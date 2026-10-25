import "server-only";
import { NextResponse } from "next/server";
import { API_INTERNA, COOKIE_SESION } from "./config";
import { renovarSesionTras401 } from "./auth-refresh";
import { cerrarSesion, cifrarSesion, guardarSesion, leerSesion, OPCIONES_COOKIE } from "./sesion";

/**
 * Cliente de la API para el portal del postulante.
 *
 * Se ejecuta SIEMPRE en el servidor: adjunta el token desde la cookie cifrada,
 * de modo que el navegador nunca lo ve. Un 401 se propaga como `NoAutorizado`
 * para que la capa superior redirija al login (páginas) o renueve (acciones).
 */
export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detalles?: readonly { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

export class NoAutorizado extends ErrorApi {
  constructor() {
    super("Sesión expirada", 401);
    this.name = "NoAutorizado";
  }
}

interface Opciones {
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
  /** Segundos de caché. Por defecto 0: el portal muestra siempre el estado real. */
  readonly revalidate?: number;
  /**
   * Si true (Server Actions), ante 401 renueva el access una vez y reintenta.
   * En RSC debe quedarse en false: durante el render no se pueden escribir
   * cookies; renovar ahí consumiría el refresh sin poder guardarlo.
   */
  readonly renovarSi401?: boolean;
  /** Timeout en ms. Por defecto 20s; extract IA necesita ≥ 90s. */
  readonly timeoutMs?: number;
}

export async function llamarApi<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  return ejecutarLlamada<T>(ruta, opciones, Boolean(opciones.renovarSi401));
}

/**
 * Variante para Server Actions: renueva el access una vez ante 401.
 * No usar desde Server Components (render).
 */
export async function llamarApiAccion<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  return ejecutarLlamada<T>(ruta, { ...opciones, renovarSi401: true }, true);
}

async function ejecutarLlamada<T>(
  ruta: string,
  opciones: Opciones,
  puedeRenovar: boolean,
  /** True si esta llamada ya es el reintento tras un refresh exitoso. */
  yaRenovo = false,
): Promise<T> {
  const sesion = await leerSesion();
  const token = sesion?.accessToken ?? null;

  const respuesta = await fetch(`${API_INTERNA}${ruta}`, {
    method: opciones.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    signal: AbortSignal.timeout(opciones.timeoutMs ?? 20_000),
    ...(opciones.revalidate
      ? { next: { revalidate: opciones.revalidate } }
      : { cache: "no-store" as const }),
  });

  if (respuesta.status === 401) {
    // Reintento tras refresh: el access es válido; no tumbar la sesión.
    if (yaRenovo) {
      const datos401 = (await respuesta.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new ErrorApi(datos401?.message ?? "No autorizado", 401);
    }

    // RSC: no borrar cookie — renovarYVolver necesita el refresh intacto.
    if (!puedeRenovar) {
      throw new NoAutorizado();
    }

    if (!sesion?.refreshCookie) {
      await cerrarSesion().catch(() => undefined);
      throw new NoAutorizado();
    }

    const tokens = await renovarSesionTras401(token, sesion.refreshCookie);
    if (!tokens) {
      // Otra request pudo ganar la carrera y ya guardar tokens nuevos.
      const otra = await leerSesion();
      if (otra?.accessToken && otra.refreshCookie && otra.accessToken !== token) {
        return ejecutarLlamada<T>(ruta, { ...opciones, renovarSi401: false }, false, true);
      }
      await cerrarSesion().catch(() => undefined);
      throw new NoAutorizado();
    }

    await guardarSesion({
      usuario: sesion.usuario,
      accessToken: tokens.accessToken,
      refreshCookie: tokens.refreshCookie,
      accessExpiresAt: tokens.accessExpiresAt,
    });

    return ejecutarLlamada<T>(ruta, { ...opciones, renovarSi401: false }, false, true);
  }

  if (respuesta.status === 204) return undefined as T;

  const datos = (await respuesta.json().catch(() => null)) as
    (T & { message?: string; errors?: { field: string; message: string }[] }) | null;

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.message ?? "No se pudo completar la operación",
      respuesta.status,
      datos?.errors,
    );
  }
  return datos as T;
}

type FetchAutenticadoInit = {
  readonly method?: string;
  readonly headers?: HeadersInit;
  readonly body?: BodyInit | null;
  readonly signal?: AbortSignal;
};

/**
 * Fetch a la API con Bearer + renovación ante 401, para Route Handlers.
 * Devuelve la Response de la API y, si renovó, el valor cifrado de la cookie
 * de sesión para que el handler lo escriba en su NextResponse.
 */
export async function fetchAutenticado(
  rutaApi: string,
  init: FetchAutenticadoInit = {},
): Promise<{ respuesta: Response | null; cookieSesionNueva?: string }> {
  const sesion = await leerSesion();
  if (!sesion?.accessToken) {
    return { respuesta: null };
  }

  const hacer = (access: string) =>
    fetch(`${API_INTERNA}${rutaApi}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${access}`,
      },
      body: init.body,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(20_000),
    }).catch(() => null);

  let respuesta = await hacer(sesion.accessToken);
  if (!respuesta) return { respuesta: null };

  if (respuesta.status !== 401 || !sesion.refreshCookie) {
    return { respuesta };
  }

  const tokens = await renovarSesionTras401(sesion.accessToken, sesion.refreshCookie);
  if (!tokens) {
    // No cerrar sesión aquí: un proxy (PDF) que pierde la carrera de refresh
    // no debe tumbar al operador. Dejamos el 401 y la Action/página deciden.
    return { respuesta };
  }

  respuesta = await hacer(tokens.accessToken);
  if (!respuesta) return { respuesta: null };

  const cookieSesionNueva = await cifrarSesion({
    usuario: sesion.usuario,
    accessToken: tokens.accessToken,
    refreshCookie: tokens.refreshCookie,
    accessExpiresAt: tokens.accessExpiresAt,
  });

  return { respuesta, cookieSesionNueva };
}

/** Adjunta la cookie de sesión renovada a una NextResponse de un proxy. */
export function adjuntarCookieSesion(
  salida: NextResponse,
  cookieSesionNueva?: string,
): NextResponse {
  if (cookieSesionNueva) {
    salida.cookies.set(COOKIE_SESION, cookieSesionNueva, OPCIONES_COOKIE);
  }
  return salida;
}
