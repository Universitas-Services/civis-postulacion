import { NextResponse } from "next/server";
import { origenPortal } from "@/lib/config";
import { limpiarCookiesSesion } from "@/lib/sesion";

/**
 * Cierre limpio tras un 401 persistente (ya se intentó renovar).
 *
 * Debe vivir en un Route Handler: desde un Server Component no se pueden
 * borrar cookies; hacerlo en `renovarYVolver` provocaba React #441 en prod.
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
  const base = basePublica(request);
  const salida = NextResponse.redirect(new URL("/login?sesion=expirada", base));
  limpiarCookiesSesion(salida);
  return salida;
}
