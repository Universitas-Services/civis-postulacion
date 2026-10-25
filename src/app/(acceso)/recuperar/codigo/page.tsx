import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioRestablecer } from "@/components/acceso/formularios-acceso";
import { correoPendiente, enmascararCorreo } from "@/lib/correo-pendiente";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function RestablecerContrasena() {
  const correo = await correoPendiente();
  if (!correo) redirect("/recuperar");
  return (
    <>
      <h1 className="font-institucional text-3xl text-toga-900">Nueva contraseña</h1>
      <p className="mt-2 text-base text-toga-600">
        Si <span className="font-semibold text-toga-900">{enmascararCorreo(correo)}</span> tiene
        cuenta, le llegó un código que vence en 10 minutos. Al guardar la contraseña nueva se
        cerrarán todas sus sesiones.
      </p>
      <div className="mt-6">
        <FormularioRestablecer />
      </div>
    </>
  );
}
