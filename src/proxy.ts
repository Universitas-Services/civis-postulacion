import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION } from "@/lib/config";

/**
 * Guardián de rutas del portal.
 *
 * Sólo comprueba que EXISTA la cookie de sesión; no la descifra (el proxy
 * corre en el edge y el secreto no debe viajar allí). La validación real la
 * hace la API en cada llamada, y cada página la comprueba con `exigirRol`.
 */
const RUTAS_PUBLICAS = ["/login", "/registro", "/verificar", "/recuperar", "/api/sesion"];
const RUTAS_DE_ACCESO = ["/login", "/registro"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // El servidor escucha en 0.0.0.0: `request.url` no es el origen que ve el
  // navegador, y redirigir a otro origen pierde la cookie por el camino.
  const base = process.env.POSTULACION_PUBLIC_URL ?? request.nextUrl.origin;
  const conSesion = request.cookies.has(COOKIE_SESION);

  if (RUTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    if (conSesion && RUTAS_DE_ACCESO.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/postulacion", base));
    }
    return NextResponse.next();
  }

  if (!conSesion) {
    const destino = new URL("/login", base);
    if (pathname !== "/") destino.searchParams.set("volver", pathname);
    return NextResponse.redirect(destino);
  }

  const cabeceras = new Headers(request.headers);
  cabeceras.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: cabeceras } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
