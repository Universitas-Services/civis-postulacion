import type { Metadata } from "next";
import Link from "next/link";
import { FormularioVerificacion } from "@/components/acceso/formularios-acceso";
import { correoPendiente, enmascararCorreo } from "@/lib/correo-pendiente";

export const metadata: Metadata = { title: "Confirmar correo" };

export default async function Verificar() {
  const correo = await correoPendiente();

  if (!correo) {
    return (
      <>
        <h1 className="font-institucional text-3xl text-toga-900">Confirmar correo</h1>
        <p className="mt-2 text-base text-toga-600">
          No hay ningún correo esperando confirmación en este navegador. Ingrese con su cuenta: si
          aún no la confirmó, podrá pedir un código nuevo.
        </p>
        <Link
          href="/login"
          className="pulsable mt-6 inline-flex rounded-md bg-balanza-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-balanza-700"
        >
          Ir a ingresar
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Confirme su correo</h1>
      <p className="mt-2 text-base text-toga-600">
        Enviamos un código de 6 dígitos a{" "}
        <span className="font-semibold text-toga-900">{enmascararCorreo(correo)}</span>. Vence en 10
        minutos.
      </p>
      <div className="mt-6">
        <FormularioVerificacion />
      </div>
    </>
  );
}
