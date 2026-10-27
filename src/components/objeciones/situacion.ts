import type { ObjecionRecibida } from "@/contracts";
import { admiteDescargo } from "@/contracts";

/** Situación de la objeción desde el punto de vista del postulante. */
export function situacionDe(o: ObjecionRecibida): { texto: string; clase: string } {
  switch (o.stage) {
    case "EN_DESCARGO":
      return admiteDescargo(o)
        ? { texto: "Espera su descargo", clase: "bg-balanza-50 text-balanza-700" }
        : { texto: "Plazo vencido", clase: "bg-toga-100 text-toga-700" };
    case "DESCARGO_PRESENTADO":
      return { texto: "Descargo presentado", clase: "bg-validado-50 text-validado-700" };
    case "SIN_DESCARGO":
      return { texto: "Sin descargo: plazo vencido", clase: "bg-toga-100 text-toga-700" };
    case "CON_LUGAR":
      return { texto: "Declarada con lugar", clase: "bg-balanza-50 text-balanza-700" };
    case "SIN_LUGAR":
      return { texto: "Declarada sin lugar", clase: "bg-validado-50 text-validado-700" };
  }
}
