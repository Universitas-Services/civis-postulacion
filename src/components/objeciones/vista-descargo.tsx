import { Paperclip } from "lucide-react";
import type { Descargo } from "@/contracts";

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Caracas",
  });

/** El descargo ya presentado. No se edita. */
export function VistaDescargo({
  objectionId,
  descargo,
}: {
  readonly objectionId: string;
  readonly descargo: Descargo;
}) {
  return (
    <article className="rounded-lg border border-toga-200 bg-white p-5">
      <p className="text-xs text-toga-500">
        {descargo.submittedVia === "SECRETARIA"
          ? "Cargado por la secretaría"
          : "Presentado por usted"}{" "}
        el {fechaHora(descargo.createdAt)}
      </p>
      <h3 className="mt-1.5 text-lg font-semibold text-toga-900">{descargo.title}</h3>
      <p className="prosa mt-2 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
        {descargo.description}
      </p>
      {descargo.originalName && (
        <a
          href={`/api/objeciones/${objectionId}/descargo`}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-toga-300 bg-white px-3 py-1.5 text-sm font-semibold text-toga-700 hover:bg-toga-50"
        >
          <Paperclip className="h-4 w-4" aria-hidden="true" />
          {descargo.originalName}
        </a>
      )}
    </article>
  );
}
