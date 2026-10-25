export const APP = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Postulación al TSJ",
} as const;

/** URL que usa el SERVIDOR de Next para hablar con la API. */
export const API_INTERNA =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const COOKIE_SESION = process.env.SESSION_COOKIE_NAME ?? "cp_post_session";

/** Cookie breve tras /api/sesion/renovar: evita bucle si el 401 persiste. */
export const COOKIE_RECIEN_RENOVADA = "cp_post_recien_renovada";

/** Nombre de la cookie HttpOnly de refresh que emite la API (path /api/v1/auth). */
export const COOKIE_REFRESH_API = process.env.API_REFRESH_COOKIE_NAME ?? "cp_refresh";

/**
 * Correo pendiente de verificar, entre el registro y el código. HttpOnly y de
 * vida corta: así el correo no viaja en la URL.
 */
export const COOKIE_CORREO_PENDIENTE = "cp_post_correo";

/** Origen público del portal (redirects de /api/sesion/*), sin barra final. */
export function origenPortal(): string {
  const configurada = process.env.POSTULACION_PUBLIC_URL?.replace(/\/$/, "");
  if (configurada) return configurada;
  return "http://localhost:3000";
}
