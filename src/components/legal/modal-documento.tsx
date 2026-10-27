"use client";

import * as Dialog from "@radix-ui/react-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";
import type { DocumentoLegal } from "@/contracts";

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas",
  });
}

/**
 * Enlace que abre el documento legal en un modal para leerlo sin salir del
 * formulario. Muestra la versión exacta que se acepta.
 */
export function ModalDocumento({
  documento,
  children,
}: {
  readonly documento: DocumentoLegal;
  /** Texto del enlace. */
  readonly children: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="font-semibold text-balanza-700 underline decoration-balanza-600/40 underline-offset-2 hover:text-balanza-600"
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-toga-900/50" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-50 mx-auto flex max-h-[88dvh] max-w-3xl -translate-y-1/2 flex-col rounded-lg bg-white shadow-xl focus:outline-none sm:inset-x-6">
          <header className="flex items-start justify-between gap-4 border-b border-toga-200 px-5 py-4">
            <div>
              <Dialog.Title className="font-institucional text-xl text-toga-900">
                {documento.title}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-toga-600">
                Versión <span className="cifra">{documento.version}</span> · vigente desde el{" "}
                {fecha(documento.publishedAt)}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Cerrar"
              className="pulsable grid h-9 w-9 shrink-0 place-items-center rounded-md text-toga-600 hover:bg-toga-50"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="min-h-0 overflow-y-auto px-5 py-4">
            <article className="text-[0.95rem] leading-relaxed text-toga-800 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-institucional [&_h2]:text-lg [&_h2]:text-toga-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-balanza-700 [&_li]:mb-1 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-toga-900 [&_table]:mb-4 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_td]:border [&_td]:border-toga-200 [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top [&_th]:border [&_th]:border-toga-200 [&_th]:bg-toga-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{documento.content}</ReactMarkdown>
            </article>
          </div>
          <footer className="border-t border-toga-200 px-5 py-3 text-right">
            <Dialog.Close className="pulsable rounded-md bg-toga-900 px-4 py-2 text-sm font-semibold text-white hover:bg-toga-800">
              Cerrar
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
