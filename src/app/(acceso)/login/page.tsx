import type { Metadata } from "next";
import { FormularioIngreso } from "@/components/acceso/formularios-acceso";

export const metadata: Metadata = { title: "Ingresar" };

export default async function Ingreso({
  searchParams,
}: {
  readonly searchParams: Promise<{ verificada?: string; sesion?: string; restablecida?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Ingresar</h1>
      <p className="mt-2 text-base text-toga-600">
        Con su cuenta ve el estado de su postulación, corrige lo que le pidan y responde objeciones.
      </p>

      {params.verificada === "1" && (
        <p className="aparecer-aviso mt-5 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-3 text-sm text-validado-700">
          Correo confirmado. Ya puede ingresar.
        </p>
      )}
      {params.restablecida === "1" && (
        <p className="aparecer-aviso mt-5 rounded-md border border-validado-700/25 bg-validado-50 px-4 py-3 text-sm text-validado-700">
          Contraseña restablecida. Ingrese con la nueva.
        </p>
      )}
      {params.sesion === "expirada" && (
        <p className="mt-5 rounded-md border border-toga-300 bg-white px-4 py-3 text-sm text-toga-700">
          Su sesión venció. Ingrese de nuevo para continuar.
        </p>
      )}

      <div className="mt-6">
        <FormularioIngreso />
      </div>
    </>
  );
}
