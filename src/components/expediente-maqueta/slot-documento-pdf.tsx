"use client";

import type { LucideIcon } from "lucide-react";
import { FileText, Plus, Trash2, Upload } from "lucide-react";

import {
  ACCEPT_ARCHIVO_DOCUMENTO,
  esArchivoDocumentoPermitido,
  TEXTO_FORMATOS_DOCUMENTO,
} from "@/lib/archivo-documento";

export type ArchivoGuardado = {
  readonly id: string;
  readonly name: string;
  readonly size: number;
};

/** Card de un documento: seleccionar PDF/imagen y guardar de forma individual. */
export function SlotDocumentoPdf({
  slotKey,
  titulo,
  ayuda,
  Icono,
  multiple,
  notaMultiple,
  etiquetaAnadir,
  pendiente,
  guardados,
  bloqueado,
  guardando,
  onPendiente,
  onGuardar,
  onSustituir,
  sustituyendoId = null,
}: {
  readonly slotKey: string;
  readonly titulo: string;
  readonly ayuda: string;
  readonly Icono: LucideIcon;
  readonly multiple: boolean;
  readonly notaMultiple?: string;
  readonly etiquetaAnadir?: string;
  readonly pendiente: File | null;
  readonly guardados: readonly ArchivoGuardado[];
  readonly bloqueado: boolean;
  readonly guardando: boolean;
  readonly onPendiente: (file: File | null) => void;
  readonly onGuardar: () => void;
  readonly onSustituir: (id: string, file: File) => void;
  readonly sustituyendoId?: string | null;
}) {
  const inputId = `slot-${slotKey}`;
  const inputExtraId = `slot-extra-${slotKey}`;
  const tieneGuardados = guardados.length > 0;
  const puedeGuardar = Boolean(pendiente) && !bloqueado && !guardando;
  const puedeAnadirOtro = multiple && !bloqueado && !pendiente && tieneGuardados;
  const saturadoUnico = !multiple && tieneGuardados && !pendiente;

  return (
    <div
      className={`rounded-lg border p-5 ${
        tieneGuardados ? "border-validado-700/30 bg-validado-50/40" : "border-toga-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 gap-2.5">
          <Icono
            className={`mt-0.5 h-5 w-5 shrink-0 ${
              tieneGuardados ? "text-validado-700" : "text-toga-500"
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-toga-900">{titulo}</h4>
            <p className="mt-1 text-xs leading-relaxed text-toga-500">{ayuda}</p>
          </div>
        </div>
        {tieneGuardados && (
          <span className="inline-flex items-center gap-1 rounded-full bg-validado-50 px-2 py-0.5 text-[0.7rem] font-medium text-validado-700 ring-1 ring-inset ring-validado-700/20">
            {multiple && guardados.length > 1 ? `${guardados.length} guardados` : "Guardado"}
          </span>
        )}
      </div>

      {tieneGuardados && (
        <>
          <ul className="mt-4 space-y-2">
            {guardados.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-toga-200 bg-white px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-toga-800">
                  <FileText className="h-4 w-4 shrink-0 text-toga-500" aria-hidden="true" />
                  <span className="truncate">{g.name}</span>
                  <span className="shrink-0 text-xs text-toga-500">
                    {Math.round(g.size / 1024)} KB
                  </span>
                </span>
                {!bloqueado && (
                  <label
                    htmlFor={`sustituir-${slotKey}-${g.id}`}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-toga-700 hover:bg-toga-100 ${
                      sustituyendoId === g.id ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {sustituyendoId === g.id ? "Sustituyendo…" : "Sustituir"}
                    <input
                      id={`sustituir-${slotKey}-${g.id}`}
                      type="file"
                      accept={ACCEPT_ARCHIVO_DOCUMENTO}
                      className="sr-only"
                      disabled={guardando || sustituyendoId !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        e.target.value = "";
                        if (!f || !esArchivoDocumentoPermitido(f)) return;
                        onSustituir(g.id, f);
                      }}
                    />
                  </label>
                )}
              </li>
            ))}
          </ul>
          {!bloqueado && (
            <p className="mt-2 text-[0.7rem] text-toga-500">
              Un archivo ya guardado no se elimina: use Sustituir para cambiarlo por otro.
            </p>
          )}
        </>
      )}

      {pendiente ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-balanza-400 bg-white px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-toga-800">
              <FileText className="h-4 w-4 shrink-0 text-toga-500" aria-hidden="true" />
              <span className="truncate">{pendiente.name}</span>
              <span className="shrink-0 text-xs text-toga-500">
                {Math.round(pendiente.size / 1024)} KB
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {!bloqueado && (
                <button
                  type="button"
                  onClick={() => onPendiente(null)}
                  disabled={guardando}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-toga-600 hover:bg-toga-100 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Quitar
                </button>
              )}
              {!bloqueado && (
                <button
                  type="button"
                  onClick={onGuardar}
                  disabled={!puedeGuardar}
                  className="rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? "Guardando…" : "Guardar documento"}
                </button>
              )}
            </span>
          </div>
        </div>
      ) : saturadoUnico ? null : bloqueado && !tieneGuardados ? (
        <p className="mt-4 text-sm text-toga-500">Sin documento adjunto.</p>
      ) : !bloqueado && !tieneGuardados ? (
        <label
          htmlFor={inputId}
          className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-toga-300 bg-toga-50 px-4 py-8 text-center transition-colors hover:border-balanza-500 hover:bg-balanza-50/30"
        >
          <Upload className="h-6 w-6 text-toga-400" aria-hidden="true" />
          <span className="mt-2 text-sm font-medium text-toga-700">Seleccionar PDF o imagen</span>
          <span className="mt-0.5 text-xs text-toga-500">{TEXTO_FORMATOS_DOCUMENTO}</span>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT_ARCHIVO_DOCUMENTO}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && !esArchivoDocumentoPermitido(f)) return;
              onPendiente(f);
              e.target.value = "";
            }}
          />
        </label>
      ) : null}

      {puedeAnadirOtro && (
        <div className="mt-4 space-y-2 border-t border-toga-100 pt-4">
          {notaMultiple && <p className="text-xs leading-relaxed text-toga-500">{notaMultiple}</p>}
          <label
            htmlFor={inputExtraId}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-xs font-semibold text-toga-700 hover:bg-toga-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {etiquetaAnadir ?? "Añadir otro documento"}
            <input
              id={inputExtraId}
              type="file"
              accept={ACCEPT_ARCHIVO_DOCUMENTO}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && !esArchivoDocumentoPermitido(f)) return;
                onPendiente(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
