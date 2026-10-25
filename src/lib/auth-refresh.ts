import "server-only";

import { API_INTERNA, COOKIE_REFRESH_API } from "./config";
import { accessExpiresAtDesde } from "./ttl-access";
import { leerSesion } from "./sesion";

/**
 * Refresh de la API vía BFF.
 *
 * La cookie HttpOnly `cp_refresh` no viaja en el navegador del panel: Next la
 * captura del Set-Cookie, la guarda cifrada en la sesión del panel y la
 * reenvía solo a /auth/*. Un refresh es rotativo: reusar el valor anterior
 * revoca toda la familia (REUSE_DETECTED).
 *
 * No enviamos `Origin`: el BFF es server-to-server y el browser nunca tiene
 * `cp_refresh`, así que no hay CSRF por cookie hacia la API. El OriginGuard
 * permite peticiones sin Origin/Referer. Así el refresh no depende de que
 * POSTULACION_PUBLIC_URL coincida con CORS_ORIGINS (causa frecuente de 403 en prod).
 */

export type TokensRenovados = {
  readonly accessToken: string;
  readonly refreshCookie: string;
  readonly accessExpiresAt: number;
};

/** Lista Set-Cookie de una Response (Node/undici). */
function setCookieHeaders(respuesta: Response): string[] {
  const headers = respuesta.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const unica = respuesta.headers.get("set-cookie");
  return unica ? [unica] : [];
}

/**
 * Extrae `cp_refresh=<valor>` del Set-Cookie de login/refresh.
 * Descarta Path, HttpOnly, etc.: eso no va en el header Cookie de ida.
 */
export function extraerRefreshCookie(respuesta: Response): string | null {
  const prefijo = `${COOKIE_REFRESH_API}=`;
  for (const cruda of setCookieHeaders(respuesta)) {
    const primerSegmento = cruda.split(";")[0]?.trim() ?? "";
    if (primerSegmento.startsWith(prefijo) && primerSegmento.length > prefijo.length) {
      return primerSegmento;
    }
  }
  return null;
}

/**
 * Cabeceras para login/refresh/logout hacia la API (server-to-server).
 *
 * Solo Cookie de refresh cuando aplica. Sin Origin: ver comentario del módulo.
 */
export function cabecerasAuthCookie(refreshCookie?: string | null): Record<string, string> {
  return refreshCookie ? { Cookie: refreshCookie } : {};
}

let renovacionEnCurso: Promise<TokensRenovados | null> | null = null;

/**
 * Último refresh exitoso en este proceso. Evita REUSE_DETECTED cuando un proxy
 * (PDF) ya rotó el refresh y otra petición concurrente aún lleva el viejo:
 * la cookie del navegador no se propaga entre requests en vuelo.
 */
let ultimoRefreshOk: {
  readonly refreshUsado: string;
  readonly tokens: TokensRenovados;
} | null = null;

/**
 * Un solo POST /auth/refresh a la vez. Si accessToken es null, 401, o no hay
 * Set-Cookie nuevo, devuelve null (sin reutilizar el refresh anterior).
 *
 * `accessQueFallo`: si el access cacheado es exactamente el que acaba de
 * recibir 401, no lo devolvemos otra vez (evitaría un bucle renovar→página).
 */
export async function renovarAccessConMutex(
  refreshCookie: string,
  accessQueFallo?: string | null,
): Promise<TokensRenovados | null> {
  // Access cacheado ya rechazado: invalidar para no reenviar el mismo JWT.
  if (ultimoRefreshOk && accessQueFallo && ultimoRefreshOk.tokens.accessToken === accessQueFallo) {
    ultimoRefreshOk = null;
  }

  if (
    ultimoRefreshOk &&
    ultimoRefreshOk.refreshUsado === refreshCookie &&
    (!accessQueFallo || ultimoRefreshOk.tokens.accessToken !== accessQueFallo)
  ) {
    return ultimoRefreshOk.tokens;
  }
  if (
    ultimoRefreshOk &&
    ultimoRefreshOk.tokens.refreshCookie === refreshCookie &&
    (!accessQueFallo || ultimoRefreshOk.tokens.accessToken !== accessQueFallo)
  ) {
    return ultimoRefreshOk.tokens;
  }

  if (!renovacionEnCurso) {
    const usado = refreshCookie;
    renovacionEnCurso = ejecutarRefresh(refreshCookie)
      .then((tokens) => {
        if (tokens) {
          ultimoRefreshOk = { refreshUsado: usado, tokens };
        }
        return tokens;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

/**
 * Renueva el access de forma segura ante 401.
 *
 * Evita REUSE_DETECTED: si otro request ya renovó (misma cookie de panel con
 * access/refresh nuevos), reutiliza esa sesión en lugar de refrescar de nuevo
 * con el refresh viejo.
 */
export async function renovarSesionTras401(
  accessQueFallo: string | null,
  refreshAlFallar: string | null,
): Promise<TokensRenovados | null> {
  if (!refreshAlFallar) return null;

  const actual = await leerSesion();
  if (actual?.accessToken && actual.refreshCookie && actual.accessToken !== accessQueFallo) {
    // Otro request ya renovó y guardó tokens nuevos.
    return {
      accessToken: actual.accessToken,
      refreshCookie: actual.refreshCookie,
      accessExpiresAt:
        typeof actual.accessExpiresAt === "number"
          ? actual.accessExpiresAt
          : accessExpiresAtDesde("15m"),
    };
  }

  const refreshAUsar = actual?.refreshCookie ?? refreshAlFallar;
  const tokens = await renovarAccessConMutex(refreshAUsar, accessQueFallo);

  if (tokens) {
    return tokens;
  }

  // Refresh falló: quizá otro request ganó la carrera y ya escribió sesión.
  const otraVez = await leerSesion();
  if (otraVez?.accessToken && otraVez.refreshCookie && otraVez.accessToken !== accessQueFallo) {
    return {
      accessToken: otraVez.accessToken,
      refreshCookie: otraVez.refreshCookie,
      accessExpiresAt:
        typeof otraVez.accessExpiresAt === "number"
          ? otraVez.accessExpiresAt
          : accessExpiresAtDesde("15m"),
    };
  }

  return null;
}

/**
 * ¿Hay que renovar el access antes de seguir en el panel?
 *
 * No escribe cookies: un Server Component (layout) no puede. Si es true, el
 * layout redirige a `/api/sesion/renovar` (Route Handler).
 */
export async function accessNecesitaRenovacion(): Promise<boolean> {
  const sesion = await leerSesion();
  if (!sesion?.refreshCookie || !sesion.accessToken) return false;

  const expira = sesion.accessExpiresAt;
  if (typeof expira === "number" && Date.now() < expira) return false;

  return true;
}

async function ejecutarRefresh(refreshCookie: string): Promise<TokensRenovados | null> {
  const respuesta = await fetch(`${API_INTERNA}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...cabecerasAuthCookie(refreshCookie),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  }).catch((error: unknown) => {
    const detalle = error instanceof Error ? error.message : "error de red";
    console.error(`[auth-refresh] POST /auth/refresh falló: ${detalle}`);
    return null;
  });

  if (!respuesta) return null;

  // 200 + { accessToken: null } = sin sesión; 401 = inválido / reuso.
  if (respuesta.status === 401 || !respuesta.ok) {
    console.error(
      `[auth-refresh] POST /auth/refresh status=${respuesta.status} (sin tokens en log)`,
    );
    return null;
  }

  const datos = (await respuesta.json().catch(() => null)) as {
    accessToken?: string | null;
    expiresIn?: string;
  } | null;

  if (!datos?.accessToken) {
    console.error("[auth-refresh] POST /auth/refresh sin accessToken en cuerpo");
    return null;
  }

  const nuevaRefresh = extraerRefreshCookie(respuesta);
  if (!nuevaRefresh) {
    console.error("[auth-refresh] POST /auth/refresh sin Set-Cookie de refresh");
    return null;
  }

  return {
    accessToken: datos.accessToken,
    refreshCookie: nuevaRefresh,
    accessExpiresAt: accessExpiresAtDesde(datos.expiresIn),
  };
}
