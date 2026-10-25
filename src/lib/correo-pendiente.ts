import "server-only";
import { cookies } from "next/headers";
import { correoPendienteSchema } from "@/contracts";
import { COOKIE_CORREO_PENDIENTE } from "./config";

/**
 * Correo de la cuenta que espera su código de verificación. Vive en una
 * cookie HttpOnly de una hora entre el registro (o un ingreso sin verificar)
 * y la pantalla del código: así el correo nunca viaja en la URL.
 */
export async function recordarCorreo(email: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_CORREO_PENDIENTE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function correoPendiente(): Promise<string | null> {
  const store = await cookies();
  const analisis = correoPendienteSchema.safeParse(store.get(COOKIE_CORREO_PENDIENTE)?.value);
  return analisis.success ? analisis.data : null;
}

export async function olvidarCorreo(): Promise<void> {
  (await cookies()).delete(COOKIE_CORREO_PENDIENTE);
}

/** lu••••@correo.com: suficiente para reconocerlo sin mostrarlo entero. */
export function enmascararCorreo(email: string): string {
  const [usuario = "", dominio = ""] = email.split("@");
  const visible = usuario.length <= 2 ? (usuario[0] ?? "") : usuario.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, usuario.length - visible.length))}@${dominio}`;
}
