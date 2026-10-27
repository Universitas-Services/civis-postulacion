import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { ToastProvider } from "@/components/toast-provider";
import { GuardiaHistorial } from "@/components/guardia-historial";
import { terminarSesion } from "@/app/acciones-cuenta";
import { usuarioActual } from "@/lib/sesion";
import { llamarApi } from "@/lib/api";

const SECCIONES = [
  { href: "/postulacion", texto: "Mi postulación" },
  { href: "/objeciones", texto: "Objeciones" },
] as const;

/** Área del postulante con sesión: su postulación y sus objeciones. */
export default async function LayoutCuenta({ children }: { readonly children: React.ReactNode }) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  const ruta = (await headers()).get("x-pathname") ?? "";

  // Versión nueva de los términos o la política: hay que aceptarla antes de
  // seguir. Las objeciones quedan fuera para no estorbar un descargo con
  // plazo. Si la consulta falla, se sigue: la API exige igual la aceptación.
  if (!ruta.startsWith("/aceptar-documentos") && !ruta.startsWith("/objeciones")) {
    const pendientes = await llamarApi<unknown[]>("/applicant/legal/pendientes").catch(() => []);
    if (pendientes.length > 0) redirect("/aceptar-documentos");
  }

  return (
    <ToastProvider>
      <GuardiaHistorial espera="con-sesion" />
      <div className="min-h-dvh bg-toga-50">
        <header className="bg-toga-900 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/postulacion" className="shrink-0">
              <Image
                src="/brand/civis-horiz-blanco.png"
                alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
                width={962}
                height={333}
                className="h-9 w-auto sm:h-10"
                priority
              />
            </Link>
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden truncate text-sm text-toga-200 sm:inline">
                {usuario.fullName}
              </span>
              <form action={terminarSesion}>
                <button
                  type="submit"
                  className="pulsable inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Salir
                </button>
              </form>
            </div>
          </div>
          <nav aria-label="Secciones" className="mx-auto max-w-5xl px-2 sm:px-4">
            <ul className="flex gap-1 overflow-x-auto">
              {SECCIONES.map((s) => {
                const activa = ruta === s.href || ruta.startsWith(`${s.href}/`);
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={activa ? "page" : undefined}
                      className={`inline-flex border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                        activa
                          ? "border-balanza-500 text-white"
                          : "border-transparent text-toga-300 hover:text-white"
                      }`}
                    >
                      {s.texto}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>
        <main id="contenido" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
