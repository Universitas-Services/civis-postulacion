import type { ObjecionRecibida } from "@/contracts";

/** Situación de la objeción desde el punto de vista del postulante. */
export function situacionDe(o: ObjecionRecibida): { texto: string; clase: string } {
  if (o.descargo) {
    return { texto: "Descargo presentado", clase: "bg-validado-50 text-validado-700" };
  }
  if (o.forwardedAt) {
    return { texto: "Enviada al Consejo sin descargo", clase: "bg-toga-100 text-toga-700" };
  }
  return { texto: "Espera su descargo", clase: "bg-balanza-50 text-balanza-700" };
}
