import "server-only";
import { headers } from "next/headers";

/**
 * IP y navegador de quien usa el portal, para reenviarlos a la API.
 *
 * El portal habla con la API de servidor a servidor: sin esto, la API vería
 * la IP de Netlify en la bitácora, en los límites por IP y en la constancia
 * de aceptación de los términos. La API confía en X-Forwarded-For
 * (TRUST_PROXY) y toma el primer valor.
 */
export async function cabecerasCliente(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const ip =
      h.get("x-nf-client-connection-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip");
    const agente = h.get("user-agent");
    return {
      ...(ip ? { "X-Forwarded-For": ip } : {}),
      ...(agente ? { "User-Agent": agente.slice(0, 500) } : {}),
    };
  } catch {
    // Fuera de una petición (no debería ocurrir): sin cabeceras extra.
    return {};
  }
}
