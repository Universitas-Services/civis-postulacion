import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import type { ObjecionRecibida } from "@/contracts";
import { AUTO_ETIQUETA, admiteDescargo, causalesDe } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { situacionDe } from "@/components/objeciones/situacion";
import { VistaDescargo } from "@/components/objeciones/vista-descargo";
import { FormularioDescargo } from "@/components/objeciones/formulario-descargo";

export const metadata: Metadata = { title: "Objeción" };

const ZONA = "America/Caracas";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  });

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA,
  });

/** «Quedan 2 días» o «Quedan 5 horas». */
function restante(iso: string): string {
  const horas = (new Date(iso).getTime() - Date.now()) / 3_600_000;
  if (horas < 24) {
    const h = Math.max(1, Math.floor(horas));
    return `Quedan ${h} ${h === 1 ? "hora" : "horas"}`;
  }
  const d = Math.floor(horas / 24);
  return `Quedan ${d} ${d === 1 ? "día" : "días"}`;
}

export default async function DetalleObjecion({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  await exigirRol("APPLICANT");
  const { id } = await params;

  let objeciones: ObjecionRecibida[];
  try {
    objeciones = await llamarApi<ObjecionRecibida[]>("/applicant/objeciones");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver(`/objeciones/${id}`);
    if (error instanceof ErrorApi && error.status === 404) notFound();
    throw error;
  }
  const o = objeciones.find((x) => x.id === id);
  if (!o) notFound();

  const s = situacionDe(o);
  const causales = causalesDe(o);
  const abierto = admiteDescargo(o);
  const decidida = o.stage === "CON_LUGAR" || o.stage === "SIN_LUGAR";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/objeciones"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-toga-600 hover:text-toga-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Objeciones
      </Link>

      <section className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.clase}`}
          >
            {s.texto}
          </span>
          <span className="text-xs text-toga-500">
            <span className="codigo">{o.trackingCode}</span>
            {o.notifiedAt && <> · notificada el {fecha(o.notifiedAt)}</>}
          </span>
        </div>
        <h1 className="font-institucional mt-3 text-2xl text-toga-900">{causales.join(" · ")}</h1>
        <p className="prosa mt-4 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
          {o.description}
        </p>
        {o.evidenceUrl && (
          <p className="mt-4 text-sm">
            <span className="text-toga-500">Evidencia aportada: </span>
            <a
              href={o.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-balanza-700 hover:text-balanza-600"
            >
              {o.evidenceUrl}
            </a>
          </p>
        )}
        <p className="mt-4 border-t border-toga-100 pt-4 text-xs text-toga-500">
          La identidad de quien presentó la objeción es reservada.
        </p>
      </section>

      {decidida && (
        <section className="rounded-lg border border-toga-200 bg-white px-5 py-5">
          <p className="text-base font-semibold text-toga-900">
            {o.stage === "CON_LUGAR"
              ? "Objeción declarada con lugar"
              : "Objeción declarada sin lugar"}
          </p>
          <p className="mt-1 text-sm text-toga-600">
            {o.stage === "CON_LUGAR"
              ? "El comité remitió el asunto al Consejo de evaluadores, que determinará su elegibilidad o el ajuste de su puntaje."
              : "El comité desestimó la objeción y ratificó su elegibilidad. Su postulación continúa en el proceso."}
            {o.finalDecidedAt && <> Decisión del {fecha(o.finalDecidedAt)}.</>}
          </p>
        </section>
      )}

      {o.autos.length > 0 && (
        <section aria-labelledby="autos">
          <h2 id="autos" className="text-base font-semibold text-toga-900">
            Autos del comité
          </h2>
          <ul className="mt-3 space-y-2">
            {o.autos.map((a) => (
              <li key={a.id}>
                <a
                  href={`/api/objeciones/${o.id}/autos/${a.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-toga-200 bg-white px-4 py-3 hover:border-toga-300"
                >
                  <FileText className="h-5 w-5 shrink-0 text-toga-400" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-medium text-toga-900 group-hover:text-balanza-700">
                      {AUTO_ETIQUETA[a.kind]}
                    </span>
                    <span className="block text-xs text-toga-500">
                      <span className="codigo">{a.number}</span> · {fecha(a.createdAt)} · PDF
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {o.descargo ? (
        <section aria-labelledby="su-descargo">
          <h2 id="su-descargo" className="text-base font-semibold text-toga-900">
            Su descargo
          </h2>
          <div className="mt-3">
            <VistaDescargo objectionId={o.id} descargo={o.descargo} />
          </div>
        </section>
      ) : abierto && o.descargoDueAt ? (
        <section aria-labelledby="plazo" className="space-y-3">
          <p
            id="plazo"
            className="rounded-lg border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
          >
            <span className="font-semibold">{restante(o.descargoDueAt)}.</span> Puede presentar su
            descargo hasta el {fechaHora(o.descargoDueAt)} (hora de Caracas).
          </p>
          <FormularioDescargo objectionId={o.id} trackingCode={o.trackingCode} />
        </section>
      ) : (
        <section className="rounded-lg border border-toga-200 bg-white px-5 py-5">
          <p className="text-base font-semibold text-toga-900">No presentó descargo</p>
          <p className="mt-1 text-sm text-toga-600">
            {o.descargoDueAt && <>El plazo venció el {fechaHora(o.descargoDueAt)}. </>}
            {decidida
              ? "El comité decidió con los elementos que constaban en el expediente."
              : "El comité decidirá con los elementos que constan en el expediente."}
          </p>
        </section>
      )}
    </div>
  );
}
