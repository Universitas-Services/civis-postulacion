import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { DocumentoLegal } from "@/contracts";
import { llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { FormularioAceptacion } from "@/components/acceso/formularios-acceso";

export const metadata: Metadata = { title: "Documentos actualizados" };

/**
 * Se actualizaron los Términos y Condiciones o la Política de Privacidad: la
 * cuenta debe aceptar la versión nueva antes de seguir usando el portal.
 */
export default async function AceptarDocumentos() {
  await exigirRol("APPLICANT");

  let pendientes: DocumentoLegal[];
  try {
    pendientes = await llamarApi<DocumentoLegal[]>("/applicant/legal/pendientes");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/aceptar-documentos");
    throw error;
  }
  if (pendientes.length === 0) redirect("/postulacion");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-institucional text-3xl text-toga-900">Documentos actualizados</h1>
      <p className="mt-2 text-base text-toga-600">
        Publicamos una nueva versión de{" "}
        {pendientes.length === 2
          ? "los Términos y Condiciones y de la Política de Privacidad"
          : pendientes[0]!.kind === "TERMINOS"
            ? "los Términos y Condiciones"
            : "la Política de Privacidad"}
        . Léala y acéptela para seguir con su postulación.
      </p>
      <div className="mt-6">
        <FormularioAceptacion pendientes={pendientes} />
      </div>
    </div>
  );
}
