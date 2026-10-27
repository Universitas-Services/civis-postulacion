import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRegistro } from "@/components/acceso/formularios-acceso";
import { documentosVigentes } from "@/lib/legal";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function Registro() {
  const docs = await documentosVigentes();

  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Crear cuenta</h1>
      <p className="mt-2 text-base text-toga-600">
        Es el primer paso para postularse. Con esta cuenta registrará su expediente y seguirá cada
        etapa del proceso.
      </p>
      <div className="mt-6">
        {docs?.terminos && docs.privacidad ? (
          <FormularioRegistro terminos={docs.terminos} privacidad={docs.privacidad} />
        ) : (
          // Sin los dos documentos publicados no hay registro: aceptarlos es obligatorio.
          <div role="status" className="rounded-md border border-toga-200 bg-white p-4 text-sm">
            <p className="font-semibold text-toga-900">El registro no está disponible por ahora</p>
            <p className="mt-1 text-toga-600">
              {docs
                ? "Estamos publicando los Términos y Condiciones y la Política de Privacidad. Vuelva a intentarlo más tarde."
                : "No se pudo contactar con el servidor. Intente de nuevo en unos minutos."}
            </p>
            <p className="mt-3">
              <Link href="/login" className="font-semibold text-balanza-700 hover:text-balanza-600">
                Volver a ingresar
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
