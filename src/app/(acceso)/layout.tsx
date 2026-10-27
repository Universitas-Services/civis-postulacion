import Image from "next/image";
import { ToastProvider } from "@/components/toast-provider";
import { GuardiaHistorial } from "@/components/guardia-historial";
import { RedNodos } from "@/components/marca/red-nodos";

const PASOS = [
  {
    titulo: "Cree su cuenta",
    detalle: "Nombres y apellidos, correo y una contraseña. Confirmará el correo con un código.",
  },
  {
    titulo: "Registre su postulación",
    detalle: "Sus datos y la sala a la que aspira; después, los documentos que exige la ley.",
  },
  {
    titulo: "Siga el proceso",
    detalle:
      "Vea en qué etapa está, corrija si la revisión se lo pide y responda las objeciones que reciba.",
  },
] as const;

/**
 * Pantallas sin sesión: ingreso, registro, verificación y recuperación.
 *
 * Escritorio: a la izquierda, el panel de marca (azul profundo, red de nodos,
 * lema) y el recorrido en tres pasos; a la derecha, el formulario. Teléfono:
 * logo a color sobre blanco y solo el formulario.
 */
export default function LayoutAcceso({ children }: { readonly children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GuardiaHistorial espera="sin-sesion" />
      {/* Escritorio: ocupa exactamente la ventana, sin scroll de página. Si un
          formulario largo no cabe, solo se desplaza su columna. */}
      <div className="grid min-h-dvh bg-toga-50 lg:h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:overflow-hidden">
        <aside className="relative hidden overflow-hidden bg-toga-900 text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-[clamp(1.25rem,4.5vh,2.5rem)] xl:px-16">
          <RedNodos className="absolute inset-0 h-full w-full" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-toga-900/30 via-toga-900/70 to-toga-900"
          />

          <Image
            src="/brand/civis-horiz-blanco-slogan.png"
            alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
            width={962}
            height={333}
            className="relative h-[clamp(2.75rem,8vh,4rem)] w-auto self-start"
            priority
          />

          <div className="relative max-w-md">
            <p className="font-institucional text-[clamp(1.5rem,3.8vh,2rem)] leading-[1.2] text-balance">
              Credenciales que inspiran confianza.
            </p>
            <span
              aria-hidden="true"
              className="mt-[clamp(0.75rem,2.5vh,1.25rem)] block h-0.5 w-14 bg-balanza-500"
            />
            <p className="mt-[clamp(0.75rem,2.5vh,1.25rem)] text-base leading-relaxed text-toga-200">
              Postulación a magistrado del Tribunal Supremo de Justicia.
            </p>

            <ol className="mt-[clamp(1rem,5vh,2.5rem)] space-y-[clamp(0.625rem,2.8vh,1.5rem)]">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="cifra flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-toga-900 text-sm font-semibold"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{p.titulo}</p>
                    {/* En pantallas muy bajas queda solo el título del paso. */}
                    <p className="mt-1 text-sm leading-relaxed text-toga-200 [@media(max-height:600px)]:hidden">
                      {p.detalle}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="relative max-w-md text-xs leading-relaxed text-toga-300 [@media(max-height:520px)]:hidden">
            Sus datos de contacto y sus documentos no se publican. Solo los ve el equipo que
            verifica las credenciales.
          </p>
        </aside>

        <div className="flex flex-col lg:min-h-0 lg:overflow-y-auto">
          <header className="border-b border-toga-200 bg-white px-4 py-3 lg:hidden">
            <Image
              src="/brand/civis-horiz-color.png"
              alt="CIVIS — Consejo Independiente de Verificación de Credenciales"
              width={962}
              height={333}
              className="h-10 w-auto"
              priority
            />
          </header>
          <main
            id="contenido"
            className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:py-[clamp(1rem,4vh,3rem)]"
          >
            <div className="w-full max-w-md">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
