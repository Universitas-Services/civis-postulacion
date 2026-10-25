/**
 * Convierte el `expiresIn` de la API (`15m`, `1h`, …) a milisegundos.
 * Margen de 60 s para renovar antes de que el JWT caduque de verdad.
 */
const MARGEN_MS = 60_000;
const DEFAULT_TTL_MS = 15 * 60_000;

export function parseTtlMs(expiresIn: string | undefined | null): number {
  if (!expiresIn) return DEFAULT_TTL_MS;
  const m = expiresIn.trim().match(/^(\d+)\s*([smhd])$/i);
  if (!m) return DEFAULT_TTL_MS;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_TTL_MS;
  const u = m[2]!.toLowerCase();
  if (u === "s") return n * 1000;
  if (u === "m") return n * 60_000;
  if (u === "h") return n * 3_600_000;
  if (u === "d") return n * 86_400_000;
  return DEFAULT_TTL_MS;
}

/** Epoch ms en el que conviene renovar (TTL menos margen). */
export function accessExpiresAtDesde(
  expiresIn: string | undefined | null,
  ahora = Date.now(),
): number {
  return ahora + parseTtlMs(expiresIn) - MARGEN_MS;
}
