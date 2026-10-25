import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Role, Sesion } from "@/contracts";
import { COOKIE_RECIEN_RENOVADA } from "./config";
import { usuarioActual } from "./sesion";

/**
 * Guard de rol para una pantalla concreta.
 *
 * Va en la PÁGINA y no en el layout a propósito: Next renderiza layout y
 * página en paralelo, así que un layout que decide no incluir a su hijo no
 * impide que ese hijo ya haya lanzado su petición —y su 403— antes.
 *
 * Devuelve el usuario si tiene alguno de los roles; si no, redirige a la
 * pantalla que le explica por qué no puede entrar.
 */
export async function exigirRol(...roles: readonly Role[]): Promise<Sesion> {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  if (!roles.some((r) => usuario.roles.includes(r))) redirect("/login");
  return usuario;
}

/**
 * Qué hacer cuando la API responde 401 durante el render de una página.
 *
 * Se manda al postulante a renovar el token y volver aquí mismo, en vez de
 * expulsarlo al login. Sin esto, el token de 15 minutos echaría a quien esté
 * evaluando un expediente en mitad del trabajo.
 *
 * La renovación no puede hacerse desde el render —Next no deja escribir
 * cookies ahí—, así que se delega en /api/sesion/renovar, que sí puede. Si el
 * refresh tampoco vale, ese handler manda al login.
 *
 * Si ya renovamos hace un instante (`cp_bo_recien_renovada`) y la API sigue
 * en 401, NO borramos cookies aquí (ilégal en RSC → React #441): redirigimos
 * a /api/sesion/expirada, que limpia marca + sesión y manda al login.
 */
export async function renovarYVolver(ruta: string): Promise<never> {
  const store = await cookies();
  if (store.get(COOKIE_RECIEN_RENOVADA)?.value === "1") {
    redirect("/api/sesion/expirada");
  }
  redirect(`/api/sesion/renovar?volver=${encodeURIComponent(ruta)}`);
}
