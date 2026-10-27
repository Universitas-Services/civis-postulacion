"use client";

import type { DocumentoLegal } from "@/contracts";
import { ModalDocumento } from "./modal-documento";

/**
 * Las dos aceptaciones, separadas y obligatorias. Cada nombre abre el
 * documento en un modal. Los ids ocultos dicen qué versión exacta se acepta.
 */
export function CasillasAceptacion({
  terminos,
  privacidad,
  errores = {},
  marcadas = {},
}: {
  readonly terminos: DocumentoLegal | null;
  readonly privacidad: DocumentoLegal | null;
  readonly errores?: Record<string, string | undefined>;
  readonly marcadas?: { readonly terminos?: boolean; readonly privacidad?: boolean };
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Aceptación de los documentos</legend>
      {terminos && (
        <Casilla
          nombre="aceptaTerminos"
          idNombre="terminosId"
          documento={terminos}
          error={errores.aceptaTerminos}
          marcada={marcadas.terminos}
          texto="los Términos y Condiciones"
        />
      )}
      {privacidad && (
        <Casilla
          nombre="aceptaPrivacidad"
          idNombre="privacidadId"
          documento={privacidad}
          error={errores.aceptaPrivacidad}
          marcada={marcadas.privacidad}
          texto="la Política de Privacidad"
        />
      )}
    </fieldset>
  );
}

function Casilla({
  nombre,
  idNombre,
  documento,
  error,
  marcada,
  texto,
}: {
  readonly nombre: string;
  readonly idNombre: string;
  readonly documento: DocumentoLegal;
  readonly error?: string;
  readonly marcada?: boolean;
  readonly texto: string;
}) {
  const idError = `${nombre}-error`;
  return (
    <div>
      <input type="hidden" name={idNombre} value={documento.id} />
      <div className="flex items-start gap-2.5">
        <input
          id={nombre}
          name={nombre}
          type="checkbox"
          defaultChecked={marcada}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          className="mt-1 h-4 w-4 shrink-0 accent-balanza-600"
        />
        <p className="text-sm text-toga-800">
          <label htmlFor={nombre}>He leído y acepto </label>
          <ModalDocumento documento={documento}>{texto}</ModalDocumento>
          <span className="text-toga-500"> (versión {documento.version})</span>.
        </p>
      </div>
      {error && (
        <p id={idError} role="alert" className="mensaje-error-campo ml-6.5">
          {error}
        </p>
      )}
    </div>
  );
}
