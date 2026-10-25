"use server";

import { revalidatePath } from "next/cache";
import { normalizarTelefono } from "@/contracts";
import { ErrorApi, llamarApiAccion } from "@/lib/api";

export interface ResultadoPostulacion {
  readonly ok: boolean;
  readonly error?: string;
  /** Errores por campo de la API (`firstName`, `nationalId`, `phone`…). */
  readonly campos?: Record<string, string>;
}

function fallo(error: unknown, porDefecto: string): ResultadoPostulacion {
  const campos: Record<string, string> = {};
  if (error instanceof ErrorApi) {
    for (const d of error.detalles ?? []) campos[d.field] = d.message;
  }
  return {
    ok: false,
    error: error instanceof ErrorApi ? error.message : porDefecto,
    campos,
  };
}

export interface DatosPostulacion {
  readonly firstName: string;
  readonly lastName: string;
  readonly nationalIdPrefix: "V" | "E";
  readonly nationalIdDigits: string;
  readonly chamber: string;
  readonly phone: string;
}

/** Crea el expediente de la cuenta. La API admite uno por cuenta. */
export async function crearPostulacion(datos: DatosPostulacion): Promise<ResultadoPostulacion> {
  try {
    await llamarApiAccion("/applicant/postulacion", {
      method: "POST",
      body: {
        firstName: datos.firstName,
        lastName: datos.lastName,
        nationalId: `${datos.nationalIdPrefix}-${datos.nationalIdDigits}`,
        chamber: datos.chamber,
        phone: normalizarTelefono(datos.phone),
      },
    });
  } catch (error) {
    return fallo(error, "No se pudo registrar la postulación");
  }
  revalidatePath("/postulacion");
  return { ok: true };
}

/** Corrige los datos mientras el expediente está en borrador. La cédula no cambia. */
export async function actualizarDatos(
  datos: Omit<DatosPostulacion, "nationalIdPrefix" | "nationalIdDigits">,
): Promise<ResultadoPostulacion> {
  try {
    await llamarApiAccion("/applicant/postulacion", {
      method: "PATCH",
      body: {
        firstName: datos.firstName,
        lastName: datos.lastName,
        chamber: datos.chamber,
        phone: normalizarTelefono(datos.phone),
      },
    });
  } catch (error) {
    return fallo(error, "No se pudieron guardar los cambios");
  }
  revalidatePath("/postulacion");
  return { ok: true };
}

/** Envía el expediente a revisión documental. La sesión basta: no hay código por correo. */
export async function enviarARevision(): Promise<ResultadoPostulacion> {
  try {
    await llamarApiAccion("/applicant/postulacion/enviar", { method: "POST", body: {} });
  } catch (error) {
    return fallo(error, "No se pudo enviar a revisión");
  }
  revalidatePath("/postulacion");
  return { ok: true };
}
