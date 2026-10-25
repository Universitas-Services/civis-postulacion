import { Check } from "lucide-react";
import type { WorkflowStatus } from "@/contracts";

const ETAPAS = [
  { clave: "carga", titulo: "Carga de documentos" },
  { clave: "revision", titulo: "Revisión documental" },
  { clave: "evaluacion", titulo: "Evaluación" },
  { clave: "resultado", titulo: "Resultado" },
] as const;

function indiceEtapa(estado: WorkflowStatus): number {
  switch (estado) {
    case "DRAFT":
      return 0;
    case "DOCUMENT_REVIEW":
      return 1;
    case "READY_FOR_EVALUATION":
    case "EVALUATION_IN_PROGRESS":
      return 2;
    default:
      return 3;
  }
}

/**
 * Dónde está el expediente, en cuatro etapas sin jerga interna. La última
 * cuenta como hecha solo cuando el proceso terminó para el postulante.
 */
export function EtapasProceso({
  estado,
  devuelto,
}: {
  readonly estado: WorkflowStatus;
  readonly devuelto: boolean;
}) {
  const actual = indiceEtapa(estado);
  const terminado = actual === 3;

  return (
    <ol className="grid gap-3 sm:grid-cols-4 sm:gap-0" aria-label="Etapas del proceso">
      {ETAPAS.map((e, i) => {
        const hecha = i < actual || (terminado && i === actual);
        const enCurso = i === actual && !terminado;
        return (
          <li key={e.clave} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            <div className="flex items-center sm:w-full">
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  hecha
                    ? "border-toga-900 bg-toga-900 text-white"
                    : enCurso
                      ? "border-balanza-600 bg-white text-balanza-700 ring-4 ring-balanza-600/10"
                      : "border-toga-300 bg-white text-toga-500"
                }`}
              >
                {hecha ? <Check className="h-3.5 w-3.5" /> : <span className="cifra">{i + 1}</span>}
              </span>
              {i < ETAPAS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-2 hidden h-px flex-1 sm:block ${i < actual ? "bg-toga-900" : "bg-toga-300"}`}
                />
              )}
            </div>
            <p
              className={`text-sm ${
                enCurso ? "font-semibold text-toga-900" : hecha ? "text-toga-700" : "text-toga-500"
              }`}
            >
              {e.titulo}
              {enCurso && devuelto && i === 0 && (
                <span className="block text-xs font-medium text-balanza-700">
                  Corrección pedida
                </span>
              )}
              <span className="sr-only">
                {hecha ? " (completada)" : enCurso ? " (etapa actual)" : " (pendiente)"}
              </span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}
