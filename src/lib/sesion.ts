import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "node:crypto";
import type { Role, Sesion } from "@/contracts";
import { COOKIE_RECIEN_RENOVADA, COOKIE_SESION } from "./config";

/**
 * Sesión del panel interno.
 *
 * El token de acceso de la API se guarda CIFRADO dentro de una cookie
 * HttpOnly. Nunca llega al JavaScript del navegador: todas las llamadas a la
 * API salen del servidor de Next. Así un XSS en el panel no entrega la sesión.
 */

interface ContenidoSesion {
  readonly usuario: Sesion;
  readonly accessToken: string;
  /** Par `nombre=valor` de la cookie de refresh de la API (sin atributos Set-Cookie). */
  readonly refreshCookie: string | null;
  /** Epoch ms: renovar el access antes de este instante (TTL API menos margen). */
  readonly accessExpiresAt?: number;
}

export type { ContenidoSesion };

function clave(): Uint8Array {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.includes("CHANGE_ME")) {
    throw new Error(
      "SESSION_SECRET no está configurado o sigue con el valor de ejemplo. " +
        "Genere uno con: openssl rand -base64 48",
    );
  }
  // A256GCM exige exactamente 32 bytes: se derivan del secreto.
  return new Uint8Array(createHash("sha256").update(secreto).digest());
}

/**
 * Cifra la sesión y devuelve el valor de la cookie.
 *
 * Se expone aparte de `guardarSesion` porque un Route Handler que devuelve
 * un `NextResponse` propio —una redirección, por ejemplo— NO arrastra las
 * cookies puestas con `cookies().set()`: hay que escribirlas sobre esa misma
 * respuesta. Ese detalle costó una sesión entera de depuración.
 */
export async function cifrarSesion(contenido: ContenidoSesion): Promise<string> {
  return new EncryptJWT({ ...contenido })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(clave());
}

/** Opciones de la cookie de sesión, compartidas para no divergir. */
export const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 8 * 60 * 60,
} as const;

export async function guardarSesion(contenido: ContenidoSesion): Promise<void> {
  const cifrada = await new EncryptJWT({ ...contenido })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(clave());

  const store = await cookies();
  store.set(COOKIE_SESION, cifrada, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function leerSesion(): Promise<ContenidoSesion | null> {
  const store = await cookies();
  const cruda = store.get(COOKIE_SESION)?.value;
  if (!cruda) return null;
  try {
    const { payload } = await jwtDecrypt(cruda, clave());
    return payload as unknown as ContenidoSesion;
  } catch {
    // Cookie manipulada, caducada o cifrada con otro secreto.
    return null;
  }
}

export async function usuarioActual(): Promise<Sesion | null> {
  return (await leerSesion())?.usuario ?? null;
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESION);
}

/**
 * Limpia sesión y marca anti-bucle sobre un NextResponse (p. ej. redirect).
 * Preferible a `cerrarSesion()` cuando la respuesta es un redirect propio:
 * `cookies().delete` no siempre viaja en esa respuesta.
 */
export function limpiarCookiesSesion(respuesta: NextResponse): void {
  respuesta.cookies.set(COOKIE_RECIEN_RENOVADA, "", {
    httpOnly: true,
    secure: OPCIONES_COOKIE.secure,
    sameSite: OPCIONES_COOKIE.sameSite,
    path: "/",
    maxAge: 0,
  });
  respuesta.cookies.set(COOKIE_SESION, "", {
    httpOnly: true,
    secure: OPCIONES_COOKIE.secure,
    sameSite: OPCIONES_COOKIE.sameSite,
    path: "/",
    maxAge: 0,
  });
}

/** ¿El usuario tiene alguno de estos roles? La autorización real es de la API. */
export function tieneRol(usuario: Sesion | null, ...roles: readonly Role[]): boolean {
  return Boolean(usuario && roles.some((r) => usuario.roles.includes(r)));
}
