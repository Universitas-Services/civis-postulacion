"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, X } from "lucide-react";
import { descargoSchema } from "@/contracts";
import { useToast } from "@/components/toast-provider";
import { AvisoError, CLASE_CAMPO } from "@/components/formulario/campos";

const MAX_DESCRIPCION = 5000;

/**
 * Descargo del postulante: título, descripción y un documento opcional (PDF o
 * imagen). Va por un Route Handler porque lleva un archivo. No se puede
 * editar después: se confirma antes de enviarlo.
 */
export function FormularioDescargo({
  objectionId,
  trackingCode,
}: {
  readonly objectionId: string;
  readonly trackingCode: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const formulario = useRef<HTMLFormElement>(null);
  const archivoRef = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<{ title?: string; description?: string }>({});
  const [error, setError] = useState<string>();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [largo, setLargo] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function validar(): FormData | null {
    const datos = new FormData(formulario.current!);
    const analisis = descargoSchema.safeParse({
      title: datos.get("title"),
      description: datos.get("description"),
    });
    if (!analisis.success) {
      const e: { title?: string; description?: string } = {};
      for (const issue of analisis.error.issues) {
        const campo = issue.path[0] as "title" | "description";
        e[campo] ??= issue.message;
      }
      setErrores(e);
      return null;
    }
    setErrores({});
    datos.delete("file");
    if (archivo) datos.append("file", archivo, archivo.name);
    return datos;
  }

  async function enviar() {
    const datos = validar();
    if (!datos) {
      setConfirmando(false);
      return;
    }
    setEnviando(true);
    setError(undefined);
    try {
      const respuesta = await fetch(`/api/objeciones/${objectionId}/descargo`, {
        method: "POST",
        body: datos,
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.message ?? "No se pudo presentar el descargo");
        setConfirmando(false);
        return;
      }
      toast.exito("Descargo presentado. El comité lo enviará al Consejo junto con la objeción.");
      router.refresh();
    } catch {
      setError("No se pudo contactar con el servidor. Intente de nuevo.");
      setConfirmando(false);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        if (validar()) setConfirmando(true);
      }}
      className="space-y-4 rounded-lg border border-toga-200 bg-white p-5 sm:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-toga-900">Presentar mi descargo</h2>
        <p className="mt-1 text-sm text-toga-600">
          Responda a la objeción con sus argumentos. Si tiene un documento que lo respalde,
          adjúntelo.
        </p>
      </div>

      <AvisoError mensaje={error} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-toga-800">
          Título
        </label>
        <input
          id="title"
          name="title"
          maxLength={200}
          required
          placeholder="P. ej.: Mi experiencia docente está acreditada"
          aria-invalid={Boolean(errores.title)}
          aria-describedby={errores.title ? "title-error" : undefined}
          className={`${CLASE_CAMPO}${errores.title ? " campo-con-error" : ""}`}
        />
        {errores.title && (
          <p id="title-error" role="alert" className="mensaje-error-campo">
            {errores.title}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="description" className="block text-sm font-medium text-toga-800">
            Descripción
          </label>
          <span className="cifra text-xs text-toga-500">
            {largo}/{MAX_DESCRIPCION}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={MAX_DESCRIPCION}
          required
          onChange={(e) => setLargo(e.target.value.length)}
          aria-invalid={Boolean(errores.description)}
          aria-describedby={errores.description ? "description-error" : undefined}
          className={`${CLASE_CAMPO} leading-relaxed${errores.description ? " campo-con-error" : ""}`}
        />
        {errores.description && (
          <p id="description-error" role="alert" className="mensaje-error-campo">
            {errores.description}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-toga-800">
          Documento de respaldo <span className="font-normal text-toga-500">(opcional)</span>
        </p>
        <input
          ref={archivoRef}
          id="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        />
        {archivo ? (
          <div className="mt-1.5 flex items-center justify-between gap-3 rounded-md border border-toga-200 bg-toga-50 px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-toga-800">
              <Paperclip className="h-4 w-4 shrink-0 text-toga-500" aria-hidden="true" />
              <span className="truncate">{archivo.name}</span>
              <span className="cifra shrink-0 text-xs text-toga-500">
                {Math.max(1, Math.round(archivo.size / 1024))} KB
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setArchivo(null);
                if (archivoRef.current) archivoRef.current.value = "";
              }}
              aria-label="Quitar el documento"
              className="rounded p-1 text-toga-500 hover:bg-toga-100 hover:text-toga-900"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="file"
            className="pulsable mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-toga-300 bg-white px-3 py-2 text-sm font-medium text-toga-700 hover:border-toga-400 hover:bg-toga-50"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Adjuntar PDF o imagen
          </label>
        )}
      </div>

      {confirmando ? (
        <div className="aparecer-aviso space-y-3 rounded-md border border-balanza-600/25 bg-balanza-50/50 p-4">
          <p className="text-sm text-toga-800">
            ¿Presentar este descargo a la objeción{" "}
            <span className="codigo font-semibold">{trackingCode}</span>? Una vez presentado no se
            puede modificar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={enviar}
              disabled={enviando}
              className="pulsable rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
            >
              {enviando ? "Presentando…" : "Confirmar y presentar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="pulsable rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
            >
              Seguir editando
            </button>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          className="pulsable rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
        >
          Revisar y presentar
        </button>
      )}
    </form>
  );
}
