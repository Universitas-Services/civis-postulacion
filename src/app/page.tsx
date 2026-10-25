import { redirect } from "next/navigation";

/** La raíz lleva a la postulación; el proxy manda al login si no hay sesión. */
export default function Inicio() {
  redirect("/postulacion");
}
