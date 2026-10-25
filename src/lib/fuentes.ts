import { IBM_Plex_Mono, IBM_Plex_Sans, Merriweather } from "next/font/google";

/**
 * Tipografía de la guía de marca CIVIS: Merriweather para títulos y
 * documentos, IBM Plex Sans para la interfaz e IBM Plex Mono para códigos.
 *
 * `next/font` las descarga en compilación y las sirve desde el propio
 * dominio: el navegador del postulante no hace ninguna petición a Google.
 */
export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--fuente-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const serif = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--fuente-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Para lo que debe transcribirse sin ambigüedad: códigos y hashes. */
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fuente-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
