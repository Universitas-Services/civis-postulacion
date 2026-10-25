import { NextResponse } from "next/server";
import { leerSesion } from "@/lib/sesion";

/**
 * ¿Hay sesión abierta en este navegador? Lo usa la guardia de las pantallas
 * cuando el navegador las restaura desde su caché al pulsar «atrás», sin pasar
 * por el proxy. No devuelve ningún dato de la sesión.
 */
export async function GET(): Promise<NextResponse> {
  const sesion = await leerSesion();
  return NextResponse.json(
    { activa: sesion !== null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
