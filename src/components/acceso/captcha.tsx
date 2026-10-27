"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (contenedor: HTMLElement, opciones: Record<string, unknown>) => string;
      reset: (widget?: string) => void;
      remove: (widget?: string) => void;
    };
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const CLAVE_SITIO = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let cargando: Promise<void> | null = null;
function cargarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  cargando ??= new Promise((resolver, rechazar) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolver();
    s.onerror = () => {
      cargando = null;
      rechazar(new Error("No se pudo cargar el captcha"));
    };
    document.head.appendChild(s);
  });
  return cargando;
}

/**
 * Captcha de Cloudflare Turnstile. Deja su token en el campo
 * `cf-turnstile-response` del formulario que lo contiene; la API lo verifica.
 * Sin `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no se muestra (entorno local sin claves).
 *
 * `reinicio` cambia cuando el envío falla: un token sólo sirve una vez.
 */
export function Captcha({ reinicio }: { readonly reinicio?: unknown }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(() => {
    if (!CLAVE_SITIO || !contenedor.current) return;
    let vivo = true;
    cargarScript()
      .then(() => {
        if (!vivo || !contenedor.current || !window.turnstile || widget.current) return;
        widget.current = window.turnstile.render(contenedor.current, {
          sitekey: CLAVE_SITIO,
          language: "es",
          theme: "light",
          size: "flexible",
        });
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    if (reinicio !== undefined && widget.current) window.turnstile?.reset(widget.current);
  }, [reinicio]);

  if (!CLAVE_SITIO) return null;
  return <div ref={contenedor} className="min-h-[65px]" />;
}
