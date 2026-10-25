import type { Metadata } from "next";
import { FormularioPedirCodigo } from "@/components/acceso/formularios-acceso";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Recuperar() {
  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Recuperar contraseña</h1>
      <p className="mt-2 text-base text-toga-600">
        Escriba el correo de su cuenta. Le enviaremos un código de 6 dígitos para poner una
        contraseña nueva.
      </p>
      <div className="mt-6">
        <FormularioPedirCodigo />
      </div>
    </>
  );
}
