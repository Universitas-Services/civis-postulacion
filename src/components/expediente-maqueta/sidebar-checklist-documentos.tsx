"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import {
  BLOQUE_ETIQUETA,
  type BloqueDocumentoId,
  type SlotInstancia,
} from "@/lib/maqueta-expediente-documentos";
import { cn } from "@/lib/utils";
import { iconoParaSlot } from "./iconos-documento";

const ORDEN_BLOQUES: BloqueDocumentoId[] = [
  "identidad",
  "honorabilidad",
  "formacion",
  "trayectoria",
  "incompatibilidades",
  "otro",
];

export function SidebarChecklistDocumentos({
  slots,
  guardados,
  activo,
  bloqueado,
  onSeleccionar,
  accion,
}: {
  readonly slots: readonly SlotInstancia[];
  readonly guardados: ReadonlySet<string>;
  readonly activo?: string;
  readonly bloqueado: boolean;
  readonly onSeleccionar: (slotKey: string) => void;
  readonly accion?: ReactNode;
}) {
  const cargados = slots.filter((s) => guardados.has(s.slotKey)).length;
  const total = slots.length;

  /** Forzar abierto (p. ej. bloque completo que el usuario expandió). */
  const [forzarAbierto, setForzarAbierto] = useState<Set<BloqueDocumentoId>>(() => new Set());
  /** Forzar cerrado (p. ej. bloque incompleto que el usuario comprimió). */
  const [forzarCerrado, setForzarCerrado] = useState<Set<BloqueDocumentoId>>(() => new Set());

  const resumenPorBloque = ORDEN_BLOQUES.map((bloque) => {
    const items = slots.filter((s) => s.bloque === bloque);
    const hechos = items.filter((s) => guardados.has(s.slotKey)).length;
    return {
      bloque,
      items,
      hechos,
      completo: items.length > 0 && hechos === items.length,
    };
  }).filter((r) => r.items.length > 0);

  // Si un bloque se completa, se comprime solo (quita el forzar-abierto).
  useEffect(() => {
    setForzarAbierto((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const r of resumenPorBloque) {
        if (r.completo && next.has(r.bloque)) {
          next.delete(r.bloque);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [guardados, slots]); // `resumen` deriva de estos dos

  function estaAbierto(bloque: BloqueDocumentoId, completo: boolean): boolean {
    if (forzarAbierto.has(bloque)) return true;
    if (forzarCerrado.has(bloque)) return false;
    return !completo;
  }

  function alternarBloque(bloque: BloqueDocumentoId, completo: boolean) {
    const abierto = estaAbierto(bloque, completo);
    if (abierto) {
      setForzarAbierto((prev) => {
        const next = new Set(prev);
        next.delete(bloque);
        return next;
      });
      setForzarCerrado((prev) => new Set(prev).add(bloque));
    } else {
      setForzarCerrado((prev) => {
        const next = new Set(prev);
        next.delete(bloque);
        return next;
      });
      setForzarAbierto((prev) => new Set(prev).add(bloque));
    }
  }

  return (
    <aside className="flex flex-col rounded-lg border border-toga-200 bg-white lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-hidden">
      <div className="shrink-0 border-b border-toga-100 px-4 py-3">
        {accion ? <div className="mb-3 flex justify-end">{accion}</div> : null}
        <p className="text-sm font-semibold text-toga-900">Documentos del expediente</p>
        <p className="mt-1 text-xs text-toga-500">
          <span className="cifra font-medium text-toga-800">{cargados}</span>
          {" / "}
          <span className="cifra">{total}</span> guardados
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-toga-100">
          <div
            className="h-full rounded-full bg-balanza-600 transition-all"
            style={{
              width: `${total ? (cargados / total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
        aria-label="Índice de documentos"
      >
        {resumenPorBloque.map(({ bloque, items, hechos, completo }) => {
          const abierto = estaAbierto(bloque, completo);
          const panelId = `bloque-docs-${bloque}`;

          return (
            <div
              key={bloque}
              className={cn(
                "rounded-md border",
                completo ? "border-validado-700/25 bg-validado-50/40" : "border-transparent",
              )}
            >
              <button
                type="button"
                onClick={() => alternarBloque(bloque, completo)}
                aria-expanded={abierto}
                aria-controls={panelId}
                className="flex w-full items-start gap-1.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-toga-50"
              >
                {abierto ? (
                  <ChevronDown
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-400"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-400"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[0.65rem] font-semibold uppercase tracking-wide",
                      completo ? "text-validado-700" : "text-toga-500",
                    )}
                  >
                    {BLOQUE_ETIQUETA[bloque]}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-toga-500">
                    <span className="cifra">
                      {hechos}/{items.length}
                    </span>
                    {completo && (
                      <span className="inline-flex items-center gap-0.5 font-medium text-validado-700">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        Completo
                      </span>
                    )}
                  </span>
                </span>
              </button>

              {abierto && (
                <ul id={panelId} className="space-y-0.5 px-1 pb-2">
                  {items.map((s) => {
                    const ok = guardados.has(s.slotKey);
                    const Icono = iconoParaSlot(s);
                    return (
                      <li key={s.slotKey}>
                        <button
                          type="button"
                          onClick={() => onSeleccionar(s.slotKey)}
                          disabled={bloqueado}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            activo === s.slotKey && "bg-toga-100 ring-1 ring-toga-200",
                            ok
                              ? "text-validado-700 hover:bg-validado-50"
                              : "text-toga-700 hover:bg-toga-50",
                          )}
                        >
                          {ok ? (
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-validado-700"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                          ) : (
                            <Icono
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-toga-500"
                              aria-hidden="true"
                            />
                          )}
                          <span className="min-w-0 leading-snug">{s.titulo}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
