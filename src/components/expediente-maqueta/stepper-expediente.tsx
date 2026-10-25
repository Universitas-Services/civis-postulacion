"use client";

import { Check, FileUp, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const PASOS = [
  { titulo: "Datos del postulante", detalle: "Identificación y sala", Icono: UserRound },
  { titulo: "Carga de documentos", detalle: "Expediente documental", Icono: FileUp },
] as const;

/** Stepper del flujo de nuevo expediente (datos → documentos). */
export function StepperExpedienteMaqueta({ fase }: { readonly fase: 0 | 1 }) {
  return (
    <nav aria-label="Progreso del registro" className="w-full">
      <ol className="mx-auto flex max-w-xl items-start justify-center">
        {PASOS.map((paso, i) => {
          const activo = fase === i;
          const completado = fase > i;
          const Icono = paso.Icono;
          const esUltimo = i === PASOS.length - 1;

          return (
            <li
              key={paso.titulo}
              className="relative flex min-w-0 flex-1 flex-col items-center px-2 text-center"
              aria-current={activo ? "step" : undefined}
            >
              <div className="relative flex w-full items-center justify-center">
                {i > 0 && (
                  <span
                    className={cn(
                      "absolute right-1/2 top-1/2 mr-5 h-0.5 w-[calc(50%-1.25rem)] -translate-y-1/2",
                      fase >= i ? "bg-balanza-600" : "bg-toga-200",
                    )}
                    aria-hidden="true"
                  />
                )}
                {!esUltimo && (
                  <span
                    className={cn(
                      "absolute left-1/2 top-1/2 ml-5 h-0.5 w-[calc(50%-1.25rem)] -translate-y-1/2",
                      completado ? "bg-balanza-600" : "bg-toga-200",
                    )}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-toga-50",
                    completado && "border-balanza-600 bg-balanza-600 text-white",
                    activo && !completado && "border-balanza-600 text-balanza-700",
                    !activo && !completado && "border-toga-300 text-toga-500",
                  )}
                >
                  {completado ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Icono className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-sm font-semibold",
                  activo || completado ? "text-toga-900" : "text-toga-500",
                )}
              >
                {paso.titulo}
              </p>
              <p className={cn("mt-0.5 text-xs", activo ? "text-toga-600" : "text-toga-500")}>
                {paso.detalle}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
