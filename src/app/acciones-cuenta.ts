"use server";

import { redirect, RedirectType } from "next/navigation";
import {
  codigoVerificacionSchema,
  correoPendienteSchema,
  loginSchema,
  registroCuentaSchema,
  restablecerContrasenaSchema,
} from "@/contracts";
import { API_INTERNA } from "@/lib/config";
import { correoPendiente, olvidarCorreo, recordarCorreo } from "@/lib/correo-pendiente";
import { cabecerasAuthCookie, extraerRefreshCookie } from "@/lib/auth-refresh";
import { accessExpiresAtDesde } from "@/lib/ttl-access";
import { cerrarSesion, guardarSesion, leerSesion } from "@/lib/sesion";
import { cabecerasCliente } from "@/lib/cliente";
import { hayPendientesCon } from "@/lib/legal";
import { ErrorApi, llamarApiAccion, NoAutorizado } from "@/lib/api";

export interface EstadoFormulario {
  readonly error?: string;
  readonly exito?: string;
  readonly campos?: Record<string, string>;
  /** Lo que escribió (nunca la contraseña), para no perderlo si hay un error. */
  readonly valores?: Record<string, string>;
}

function camposDe(issues: readonly { path: PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const clave = issue.path.map(String).join(".");
    if (!campos[clave]) campos[clave] = issue.message;
  }
  return campos;
}

/** Llamada pública (sin sesión) a la API. Devuelve la respuesta o null si no hubo red. */
async function llamarPublica(ruta: string, body: unknown): Promise<Response | null> {
  return fetch(`${API_INTERNA}${ruta}`, {
    method: "POST",
    headers: {
      ...(await cabecerasCliente()),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);
}

async function mensajeDe(respuesta: Response, porDefecto: string): Promise<string> {
  const datos = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
  return typeof datos?.message === "string" && datos.message.trim() ? datos.message : porDefecto;
}

const SIN_RED = "No se pudo contactar con el servidor. Intente de nuevo en unos minutos.";

/** El widget de Turnstile deja su token en este campo del formulario. */
function tokenCaptcha(formData: FormData): string | undefined {
  const token = formData.get("cf-turnstile-response");
  return typeof token === "string" && token ? token : undefined;
}

/**
 * Acepta las versiones nuevas de los términos o la política (una constancia
 * por documento) y vuelve a la postulación.
 */
export async function aceptarDocumentos(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const ids = {
    terminosId: String(formData.get("terminosId") ?? "") || undefined,
    privacidadId: String(formData.get("privacidadId") ?? "") || undefined,
  };
  const campos: Record<string, string> = {};
  if (ids.terminosId && formData.get("aceptaTerminos") !== "on") {
    campos.aceptaTerminos = "Debe aceptar los Términos y Condiciones";
  }
  if (ids.privacidadId && formData.get("aceptaPrivacidad") !== "on") {
    campos.aceptaPrivacidad = "Debe aceptar la Política de Privacidad";
  }
  if (Object.keys(campos).length > 0) return { campos };

  try {
    await llamarApiAccion("/applicant/legal/aceptar", { method: "POST", body: ids });
  } catch (error) {
    if (error instanceof NoAutorizado) redirect("/login", RedirectType.replace);
    return {
      error: error instanceof ErrorApi ? error.message : "No se pudo registrar la aceptación.",
    };
  }
  redirect("/postulacion", RedirectType.replace);
}

export async function iniciarSesion(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const analisis = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    captchaToken: tokenCaptcha(formData),
  });
  const valores = { email: String(formData.get("email") ?? "") };
  if (!analisis.success) return { campos: camposDe(analisis.error.issues), valores };

  // Login propio del portal: exige captcha y sólo admite cuentas de postulante.
  const respuesta = await llamarPublica("/auth/login-postulante", analisis.data);

  if (!respuesta) return { error: SIN_RED, valores };
  if (respuesta.status === 400) {
    return { error: await mensajeDe(respuesta, "Confirme que no es un robot."), valores };
  }
  if (respuesta.status === 429) {
    return {
      error: "Demasiados intentos. Espere unos minutos antes de volver a probar.",
      valores,
    };
  }
  if (respuesta.status === 401) return { error: "Correo o contraseña incorrectos.", valores };
  if (respuesta.status === 403) {
    const datos = (await respuesta.json().catch(() => null)) as {
      message?: string;
      codigo?: string;
    } | null;
    if (datos?.codigo === "CORREO_SIN_VERIFICAR") {
      await recordarCorreo(analisis.data.email);
      redirect("/verificar", RedirectType.replace);
    }
    return { error: datos?.message ?? "Acceso denegado." };
  }
  if (!respuesta.ok) {
    return { error: await mensajeDe(respuesta, `No se pudo ingresar (${respuesta.status}).`) };
  }

  const datos = (await respuesta.json()) as {
    accessToken: string;
    expiresIn?: string;
    user: { id: string; email: string; fullName: string; roles: string[] };
  };
  const refreshCookie = extraerRefreshCookie(respuesta);
  if (!refreshCookie) {
    return { error: "El servidor no entregó la sesión. Intente de nuevo." };
  }

  // Este portal es solo para postulantes; el personal usa el panel interno.
  if (!datos.user.roles.includes("APPLICANT")) {
    await fetch(`${API_INTERNA}/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json", ...cabecerasAuthCookie(refreshCookie) },
      cache: "no-store",
    }).catch(() => null);
    return {
      error:
        "Esta cuenta no es de postulante. El personal del Consejo ingresa por el panel interno.",
    };
  }

  await guardarSesion({
    usuario: {
      id: datos.user.id,
      email: datos.user.email,
      fullName: datos.user.fullName,
      roles: ["APPLICANT"],
    },
    accessToken: datos.accessToken,
    refreshCookie,
    accessExpiresAt: accessExpiresAtDesde(datos.expiresIn),
  });
  // Si hay una versión nueva de los términos o la política, se va directo a
  // aceptarla: sin redirecciones encadenadas, que dejan la pantalla en blanco.
  const destino = (await hayPendientesCon(datos.accessToken))
    ? "/aceptar-documentos"
    : "/postulacion";
  // `replace`: el ingreso no queda en el historial; «atrás» no vuelve al login.
  redirect(destino, RedirectType.replace);
}

export async function terminarSesion(): Promise<void> {
  const sesion = await leerSesion();
  if (sesion) {
    // La API revoca la familia de refresh tokens.
    await fetch(`${API_INTERNA}/auth/logout`, {
      method: "POST",
      headers: cabecerasAuthCookie(sesion.refreshCookie),
      cache: "no-store",
    }).catch(() => undefined);
  }
  await cerrarSesion();
  redirect("/login", RedirectType.replace);
}

export async function registrarCuenta(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const analisis = registroCuentaSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    website: formData.get("website") ?? "",
    aceptaTerminos: formData.get("aceptaTerminos") === "on",
    aceptaPrivacidad: formData.get("aceptaPrivacidad") === "on",
    terminosId: formData.get("terminosId"),
    privacidadId: formData.get("privacidadId"),
    captchaToken: tokenCaptcha(formData),
  });
  const valores = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    aceptaTerminos: formData.get("aceptaTerminos") === "on" ? "on" : "",
    aceptaPrivacidad: formData.get("aceptaPrivacidad") === "on" ? "on" : "",
  };
  if (!analisis.success) return { campos: camposDe(analisis.error.issues), valores };

  const respuesta = await llamarPublica("/public/cuentas/registro", analisis.data);
  if (!respuesta) return { error: SIN_RED, valores };
  if (respuesta.status === 429) {
    return { error: "Demasiados registros desde esta conexión. Intente más tarde.", valores };
  }
  if (!respuesta.ok) {
    return { error: await mensajeDe(respuesta, "No se pudo crear la cuenta."), valores };
  }
  await recordarCorreo(analisis.data.email);
  redirect("/verificar", RedirectType.replace);
}

export async function verificarCuenta(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = await correoPendiente();
  if (!email) {
    return {
      error: "No sabemos qué cuenta verificar. Ingrese con su correo para recibir un código.",
    };
  }
  const codigo = codigoVerificacionSchema.safeParse(formData.get("codigo"));
  if (!codigo.success) {
    return { campos: { codigo: codigo.error.issues[0]?.message ?? "Código inválido" } };
  }

  const respuesta = await llamarPublica("/public/cuentas/verificar", {
    email,
    codigo: codigo.data,
  });
  if (!respuesta) return { error: SIN_RED };
  if (!respuesta.ok) {
    return { campos: { codigo: await mensajeDe(respuesta, "El código no es válido.") } };
  }
  await olvidarCorreo();
  redirect("/login?verificada=1", RedirectType.replace);
}

export async function reenviarCodigo(): Promise<EstadoFormulario> {
  const email = await correoPendiente();
  if (!email) return { error: "Ingrese con su correo para recibir un código nuevo." };
  const respuesta = await llamarPublica("/public/cuentas/reenviar", { email });
  if (!respuesta) return { error: SIN_RED };
  if (respuesta.status === 429) {
    return { error: "Ya pidió varios códigos. Espere unos minutos." };
  }
  if (!respuesta.ok) return { error: await mensajeDe(respuesta, "No se pudo reenviar el código.") };
  return { exito: "Le enviamos un código nuevo. Revise también la carpeta de correo no deseado." };
}

// ---------------------------------------------------------------- recuperar contraseña

/** Paso 1: pide el código. La API responde igual exista o no la cuenta. */
export async function pedirCodigoRecuperacion(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const valores = { email: String(formData.get("email") ?? "") };
  const correo = correoPendienteSchema.safeParse(formData.get("email"));
  if (!correo.success) {
    return { campos: { email: correo.error.issues[0]?.message ?? "Correo inválido" }, valores };
  }
  const respuesta = await llamarPublica("/public/cuentas/recuperar", { email: correo.data });
  if (!respuesta) return { error: SIN_RED, valores };
  if (respuesta.status === 429) {
    return { error: "Ya pidió varios códigos. Espere unos minutos.", valores };
  }
  if (!respuesta.ok) {
    return { error: await mensajeDe(respuesta, "No se pudo enviar el código."), valores };
  }
  await recordarCorreo(correo.data);
  redirect("/recuperar/codigo", RedirectType.replace);
}

/** Paso 2: código + contraseña nueva. La API cierra todas las sesiones de la cuenta. */
export async function restablecerContrasena(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = await correoPendiente();
  if (!email) return { error: "Vuelva a pedir el código: no sabemos qué cuenta restablecer." };
  const analisis = restablecerContrasenaSchema.safeParse({
    codigo: formData.get("codigo"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!analisis.success) return { campos: camposDe(analisis.error.issues) };

  const respuesta = await llamarPublica("/public/cuentas/restablecer", {
    email,
    ...analisis.data,
  });
  if (!respuesta) return { error: SIN_RED };
  if (!respuesta.ok) {
    return { campos: { codigo: await mensajeDe(respuesta, "El código no es válido.") } };
  }
  await olvidarCorreo();
  redirect("/login?restablecida=1", RedirectType.replace);
}

export async function reenviarCodigoRecuperacion(): Promise<EstadoFormulario> {
  const email = await correoPendiente();
  if (!email) return { error: "Vuelva a escribir su correo para recibir un código." };
  const respuesta = await llamarPublica("/public/cuentas/recuperar", { email });
  if (!respuesta) return { error: SIN_RED };
  if (respuesta.status === 429) return { error: "Ya pidió varios códigos. Espere unos minutos." };
  if (!respuesta.ok) return { error: await mensajeDe(respuesta, "No se pudo reenviar el código.") };
  return { exito: "Le enviamos un código nuevo. Revise también la carpeta de correo no deseado." };
}
