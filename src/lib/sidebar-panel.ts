/**
 * Coordinación del sidebar global del panel.
 * Cuando se abre un documento (visor + formulario), se comprime temporalmente
 * el menú lateral para ganar espacio de trabajo; al cerrar se restaura la
 * preferencia del usuario (localStorage).
 */

export const EVENTO_SIDEBAR_DOCUMENTO = "civis:sidebar-documento";

/** Preferencia manual del hamburguesa. No incluye la compresión temporal al ver un documento. */
export const CLAVE_SIDEBAR_COLAPSADO = "civis.sidebar.colapsado";

/** Cada inicio de sesión parte con el menú abierto. */
export function reiniciarSidebar() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLAVE_SIDEBAR_COLAPSADO);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function marcarSidebarDocumentoAbierto(abierto: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO_SIDEBAR_DOCUMENTO, { detail: { abierto } }));
}
