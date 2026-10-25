"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Al pulsar «atrás», el navegador (bfcache) o el propio Next (caché del
 * enrutador) pueden mostrar una pantalla sin consultar al servidor. Esta
 * guardia pregunta si hay sesión y corrige con `replace`, para que la pantalla
 * equivocada tampoco quede en el historial:
 *
 * - `sin-sesion` (ingreso, registro, verificación, recuperación): con sesión
 *   abierta lleva a la postulación.
 * - `con-sesion` (postulación, objeciones): sin sesión lleva al ingreso.
 */
export function GuardiaHistorial({ espera }: { readonly espera: "sin-sesion" | "con-sesion" }) {
  const router = useRouter();

  useEffect(() => {
    let vigente = true;

    async function comprobar() {
      const respuesta = await fetch("/api/sesion/estado", { cache: "no-store" }).catch(() => null);
      if (!vigente || !respuesta?.ok) return;
      const { activa } = (await respuesta.json()) as { activa: boolean };
      if (espera === "sin-sesion" && activa) router.replace("/postulacion");
      if (espera === "con-sesion" && !activa) router.replace("/login");
    }

    function alMostrar(evento: PageTransitionEvent) {
      if (evento.persisted) void comprobar();
    }

    void comprobar();
    window.addEventListener("pageshow", alMostrar);
    return () => {
      vigente = false;
      window.removeEventListener("pageshow", alMostrar);
    };
  }, [espera, router]);

  return null;
}
