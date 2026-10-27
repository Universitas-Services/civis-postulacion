import "server-only";
import type { DocumentosVigentes } from "@/contracts";
import { API_INTERNA } from "./config";
import { llamarApi } from "./api";

/**
 * Términos y Condiciones y Política de Privacidad vigentes. Ruta pública de
 * la API; `null` si no se pudo consultar.
 */
export async function documentosVigentes(): Promise<DocumentosVigentes | null> {
  const respuesta = await fetch(`${API_INTERNA}/public/legal/vigentes`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!respuesta?.ok) return null;
  return (await respuesta.json().catch(() => null)) as DocumentosVigentes | null;
}

/**
 * ¿La cuenta tiene que aceptar una versión nueva? Si la consulta falla se
 * sigue: la API exige igual la aceptación en las escrituras.
 */
export async function hayDocumentosPendientes(): Promise<boolean> {
  const pendientes = await llamarApi<unknown[]>("/applicant/legal/pendientes").catch(() => []);
  return pendientes.length > 0;
}

/** Igual, con un token recién emitido (justo tras el login, antes de leer la cookie). */
export async function hayPendientesCon(accessToken: string): Promise<boolean> {
  const respuesta = await fetch(`${API_INTERNA}/applicant/legal/pendientes`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!respuesta?.ok) return false;
  const datos = (await respuesta.json().catch(() => [])) as unknown[];
  return Array.isArray(datos) && datos.length > 0;
}
