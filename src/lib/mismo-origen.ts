/**
 * Para Route Handlers que cambian estado con la cookie de sesión: rechaza lo
 * que el navegador marca como enviado desde otro sitio. La cookie ya es
 * SameSite=Lax; esto cubre además a los subdominios hermanos.
 */
export function esMismoOrigen(request: Request): boolean {
  const sitio = request.headers.get("sec-fetch-site");
  return sitio === null || sitio === "same-origin";
}
