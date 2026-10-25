"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/toast-provider";

type EstadoConMensajes = {
  readonly exito?: string;
  readonly error?: string;
};

/**
 * Dispara toasts cuando cambia el resultado de una Server Action
 * (`useActionState`). Los errores de campo (`campos`) no se tocan aquí.
 */
export function useToastDesdeEstado(estado: EstadoConMensajes) {
  const toast = useToast();
  const visto = useRef<{ exito?: string; error?: string }>({});

  useEffect(() => {
    if (estado.exito && estado.exito !== visto.current.exito) {
      visto.current.exito = estado.exito;
      toast.exito(estado.exito);
    }
    if (estado.error && estado.error !== visto.current.error) {
      visto.current.error = estado.error;
      toast.error(estado.error);
    }
  }, [estado.exito, estado.error, toast]);
}
