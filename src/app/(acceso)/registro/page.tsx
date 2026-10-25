import type { Metadata } from "next";
import { FormularioRegistro } from "@/components/acceso/formularios-acceso";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function Registro() {
  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Crear cuenta</h1>
      <p className="mt-2 text-base text-toga-600">
        Es el primer paso para postularse. Con esta cuenta registrará su expediente y seguirá cada
        etapa del proceso.
      </p>
      <div className="mt-6">
        <FormularioRegistro />
      </div>
    </>
  );
}
