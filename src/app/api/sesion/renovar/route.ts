import { NextResponse } from "next/server";
import { COOKIE_RECIEN_RENOVADA, COOKIE_SESION, origenPortal } from "@/lib/config";
import { renovarSesionTras401 } from "@/lib/auth-refresh";
import { cifrarSesion, leerSesion, limpiarCookiesSesion, OPCIONES_COOKIE } from "@/lib/sesion";

/**
 * Renovación del token de acceso.
 *
 * Vive en un Route Handler porque es el único sitio, junto a las Server
 * Actions, donde Next permite escribir cookies. Y escribirla es obligatorio:
 * el refresh de la API es ROTATIVO —cada uso anula el anterior—, así que
 * renovar sin poder guardar el token nuevo dejaría la sesión rota en el
 * siguiente intento, y la API lo leería como robo de credencial.
 *
 * Se llama con `?volver=<ruta>` y devuelve a esa ruta al terminar, de modo
 * que el operador ve un parpadeo y sigue trabajando donde estaba.
 */
function basePublica(request: Request): string {
  const configurada = process.env.POSTULACION_PUBLIC_URL?.replace(/\/$/, "");
  if (configurada) return configurada;
  const host = request.headers.get("host");
  if (host) {
    const esquema = request.headers.get("x-forwarded-proto") ?? "http";
    return `${esquema}://${host}`;
  }
  return origenPortal();
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const base = basePublica(request);
  const crudo = url.searchParams.get("volver") ?? "/postulacion";
  const volver = crudo.startsWith("/") && !crudo.startsWith("//") ? crudo : "/postulacion";

  const sesion = await leerSesion();
  if (!sesion?.refreshCookie) {
    const salida = NextResponse.redirect(new URL("/login", base));
    limpiarCookiesSesion(salida);
    return salida;
  }

  const tokens = await renovarSesionTras401(sesion.accessToken, sesion.refreshCookie);
  if (!tokens) {
    const salida = NextResponse.redirect(new URL("/login?sesion=expirada", base));
    limpiarCookiesSesion(salida);
    return salida;
  }

  const cookie = await cifrarSesion({
    usuario: sesion.usuario,
    accessToken: tokens.accessToken,
    refreshCookie: tokens.refreshCookie,
    accessExpiresAt: tokens.accessExpiresAt,
  });

  const salida = NextResponse.redirect(new URL(volver, base));
  salida.cookies.set(COOKIE_SESION, cookie, OPCIONES_COOKIE);
  // Si al volver la página sigue en 401, renovarYVolver ve esta marca y
  // corta el bucle hacia login (en vez de ERR_TOO_MANY_REDIRECTS).
  salida.cookies.set(COOKIE_RECIEN_RENOVADA, "1", {
    httpOnly: true,
    secure: OPCIONES_COOKIE.secure,
    sameSite: OPCIONES_COOKIE.sameSite,
    path: "/",
    maxAge: 90,
  });
  return salida;
}
