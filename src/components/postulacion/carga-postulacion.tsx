"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slotKeyDesdeCategory, type EstadoPostulacion } from "@/contracts";
import { PasoCargaDocumentos } from "@/components/expediente-maqueta/paso-carga-documentos";
import type { ArchivoGuardado } from "@/components/expediente-maqueta/slot-documento-pdf";
import type { SalaMaqueta } from "@/lib/maqueta-expediente-documentos";
import { useToast } from "@/components/toast-provider";
import { enviarARevision } from "@/app/(cuenta)/postulacion/acciones";

/** Documentos ya cargados, por casilla del listado, para retomar la carga. */
function sembrar(documentos: EstadoPostulacion["documentos"]) {
  const out: Record<string, ArchivoGuardado[]> = {};
  for (const d of documentos) {
    const slot = slotKeyDesdeCategory(d.category) ?? d.category.toLowerCase();
    out[slot] = [...(out[slot] ?? []), { id: d.id, name: d.originalName, size: d.sizeBytes }];
  }
  return out;
}

/** Envío a revisión con confirmación concreta. Sin código por correo: basta la sesión. */
function EnvioRevision({
  fileNumber,
  reenvio,
}: {
  readonly fileNumber: string | null;
  readonly reenvio: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await enviarARevision();
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo enviar a revisión");
        setConfirmando(false);
        return;
      }
      toast.exito(
        reenvio ? "Expediente corregido y reenviado a revisión." : "Expediente enviado a revisión.",
      );
      router.refresh();
    });
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="pulsable rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
      >
        {reenvio ? "Reenviar a revisión" : "Enviar a revisión"}
      </button>
    );
  }

  return (
    <div className="aparecer-aviso max-w-xl space-y-3 rounded-lg border border-balanza-600/25 bg-balanza-50/50 p-4">
      <p className="text-sm text-toga-800">
        ¿Enviar el expediente{" "}
        {fileNumber && <span className="codigo font-semibold">{fileNumber}</span>} a revisión
        documental? Mientras esté en revisión no podrá cambiar datos ni documentos.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={enviar}
          disabled={pendiente}
          className="pulsable rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
        >
          {pendiente ? "Enviando…" : "Confirmar envío"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={pendiente}
          className="pulsable rounded-md border border-toga-300 bg-white px-4 py-2 text-sm font-medium text-toga-700 hover:bg-toga-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

/** Carga de documentos del propio postulante: el mismo listado que usa la secretaría. */
export function CargaPostulacion({ estado }: { readonly estado: EstadoPostulacion }) {
  const [prefijo, digitos] = estado.nationalId.split("-");
  return (
    <PasoCargaDocumentos
      datos={{
        nombre: estado.firstName,
        apellido: estado.lastName,
        prefijoCedula: prefijo === "E" ? "E" : "V",
        cedulaDigitos: digitos ?? "",
        sala: estado.chamber as SalaMaqueta,
      }}
      salaLabel={estado.chamberLabel}
      submissionId={estado.submissionId ?? ""}
      urlCarga="/api/postulacion/documentos"
      guardadosIniciales={sembrar(estado.documentos)}
      onEnviarRevision={() => undefined}
      accionEnvio={
        <EnvioRevision fileNumber={estado.fileNumber} reenvio={estado.devolucion !== null} />
      }
    />
  );
}
