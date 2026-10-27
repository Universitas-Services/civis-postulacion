import "server-only";
import type { DocumentosVigentes } from "@/contracts";
import { API_INTERNA } from "./config";

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
