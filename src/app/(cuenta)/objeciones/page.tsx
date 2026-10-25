import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ObjecionRecibida } from "@/contracts";
import { causalesDe } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { situacionDe } from "@/components/objeciones/situacion";

export const metadata: Metadata = { title: "Objeciones" };

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas",
  });

export default async function Objeciones() {
  await exigirRol("APPLICANT");

  let objeciones: ObjecionRecibida[] = [];
  let sinPostulacion = false;
  try {
    objeciones = await llamarApi<ObjecionRecibida[]>("/applicant/objeciones");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/objeciones");
    if (error instanceof ErrorApi && error.status === 404) sinPostulacion = true;
    else throw error;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-institucional text-3xl text-toga-900">Objeciones</h1>
      <p className="mt-2 text-base text-toga-600">
        Cuando alguien objeta su postulación, la objeción llega primero al comité. Usted puede
        responderla con un descargo; el comité envía al Consejo la objeción junto con su respuesta.
      </p>

      {sinPostulacion ? (
        <div className="mt-6 rounded-lg border border-toga-200 bg-white px-5 py-6 text-base text-toga-600">
          Todavía no ha registrado su postulación.{" "}
          <Link
            href="/postulacion"
            className="font-semibold text-balanza-700 hover:text-balanza-600"
          >
            Regístrela aquí
          </Link>
          .
        </div>
      ) : objeciones.length === 0 ? (
        <div className="mt-6 rounded-lg border border-toga-200 bg-white px-5 py-6">
          <p className="text-base font-semibold text-toga-900">No ha recibido objeciones</p>
          <p className="mt-1 text-sm text-toga-600">
            Si recibe una, se lo avisaremos por correo y aparecerá aquí para que presente su
            descargo.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {objeciones.map((o) => {
            const s = situacionDe(o);
            const causales = causalesDe(o);
            return (
              <li key={o.id}>
                <Link
                  href={`/objeciones/${o.id}`}
                  className="group flex items-center gap-4 rounded-lg border border-toga-200 bg-white px-5 py-4 transition-colors hover:border-toga-300 hover:bg-toga-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.clase}`}
                      >
                        {s.texto}
                      </span>
                      <span className="text-xs text-toga-500">
                        Recibida el {fecha(o.receivedAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-base font-medium text-toga-900">
                      {causales.join(" · ")}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-toga-400 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
