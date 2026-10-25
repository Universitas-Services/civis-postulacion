import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ObjecionRecibida } from "@/contracts";
import { causalesDe } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { situacionDe } from "@/components/objeciones/situacion";
import { VistaDescargo } from "@/components/objeciones/vista-descargo";
import { FormularioDescargo } from "@/components/objeciones/formulario-descargo";

export const metadata: Metadata = { title: "Objeción" };

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas",
  });

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
            <span className="codigo">{o.trackingCode}</span> · recibida el {fecha(o.receivedAt)}
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

      {o.descargo ? (
        <section aria-labelledby="su-descargo">
          <h2 id="su-descargo" className="text-base font-semibold text-toga-900">
            Su descargo
          </h2>
          <div className="mt-3">
            <VistaDescargo objectionId={o.id} descargo={o.descargo} />
          </div>
          {o.forwardedAt && (
            <p className="mt-3 text-sm text-toga-600">
              El comité envió la objeción y su descargo al Consejo el {fecha(o.forwardedAt)}.
            </p>
          )}
        </section>
      ) : o.forwardedAt ? (
        <section className="rounded-lg border border-toga-200 bg-white px-5 py-5">
          <p className="text-base font-semibold text-toga-900">Ya no admite descargo</p>
          <p className="mt-1 text-sm text-toga-600">
            El comité envió esta objeción al Consejo el {fecha(o.forwardedAt)} sin descargo. Si
            necesita aportar algo, comuníquese con la secretaría.
          </p>
        </section>
      ) : (
        <FormularioDescargo objectionId={o.id} trackingCode={o.trackingCode} />
      )}
    </div>
  );
}
