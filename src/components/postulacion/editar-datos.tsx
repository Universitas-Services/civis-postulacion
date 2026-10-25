"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { EstadoPostulacion } from "@/contracts";
import { FormularioPostulacion } from "./formulario-postulacion";

/** Corrección de datos en borrador, plegada por defecto para no tapar los documentos. */
export function EditarDatos({ estado }: { readonly estado: EstadoPostulacion }) {
  const [abierto, setAbierto] = useState(false);
  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="pulsable inline-flex items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-medium text-toga-700 hover:bg-toga-50"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Corregir mis datos
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <FormularioPostulacion estado={estado} onGuardado={() => setAbierto(false)} />
      <button
        type="button"
        onClick={() => setAbierto(false)}
        className="text-sm font-medium text-toga-600 hover:text-toga-900"
      >
        Cancelar
      </button>
    </div>
  );
}
