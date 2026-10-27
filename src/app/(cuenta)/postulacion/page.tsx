import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { EstadoPostulacion } from "@/contracts";
import { CATEGORIA_ETIQUETA } from "@/contracts";
import { ErrorApi, llamarApi, NoAutorizado } from "@/lib/api";
import { exigirRol, renovarYVolver } from "@/lib/rutas";
import { FormularioPostulacion } from "@/components/postulacion/formulario-postulacion";
import { CargaPostulacion } from "@/components/postulacion/carga-postulacion";
import { EtapasProceso } from "@/components/postulacion/etapas-proceso";
import { EditarDatos } from "@/components/postulacion/editar-datos";

export const metadata: Metadata = { title: "Mi postulación" };

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Caracas",
  });

/** 04141234567 → 0414 1234567 */
const telefonoLegible = (t: string) => (/^\d{11}$/.test(t) ? `${t.slice(0, 4)} ${t.slice(4)}` : t);

export default async function MiPostulacion() {
  const usuario = await exigirRol("APPLICANT");

  let estado: EstadoPostulacion | null = null;
  try {
    estado = await llamarApi<EstadoPostulacion>("/applicant/postulacion");
  } catch (error) {
    if (error instanceof NoAutorizado) await renovarYVolver("/postulacion");
    if (!(error instanceof ErrorApi && error.status === 404)) throw error;
  }

  if (!estado) {
    const [nombre = "", ...resto] = usuario.fullName.split(" ");
    const portal = await llamarApi<{ applicationsClosed?: boolean }>("/public/portal").catch(
      () => null,
    );
    if (portal?.applicationsClosed) {
      return (
        <div className="mx-auto max-w-3xl">
          <h1 className="font-institucional text-3xl text-toga-900">Bienvenido, {nombre}</h1>
          <div className="mt-6 rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
            <p className="text-base font-semibold text-toga-900">
              El periodo de postulaciones está cerrado
            </p>
            <p className="mt-2 text-base leading-relaxed text-toga-600">
              Ya no se reciben postulaciones nuevas. Si cree que se trata de un error, comuníquese
              con la secretaría del proceso.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-institucional text-3xl text-toga-900">Bienvenido, {nombre}</h1>
        <p className="mt-2 max-w-2xl text-base text-toga-600">
          Todavía no ha registrado su postulación. Empiece por sus datos; los documentos los cargará
          en el paso siguiente y podrá hacerlo en varias sesiones.
        </p>
        <div className="mt-6">
          <FormularioPostulacion nombreCuenta={{ nombre, apellido: resto.join(" ") }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-institucional text-2xl text-toga-900 sm:text-3xl">
              {estado.fullName}
            </h1>
            <p className="mt-1 text-sm text-toga-600">
              {estado.chamberLabel}
              {estado.fileNumber && (
                <>
                  {" · "}Expediente{" "}
                  <span className="codigo text-toga-900">{estado.fileNumber}</span>
                </>
              )}
              {estado.phone && <> · {telefonoLegible(estado.phone)}</>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-toga-500">Etapa actual</p>
            <p className="text-base font-semibold text-toga-900">{estado.etapa}</p>
            {estado.enviadoEl && (
              <p className="mt-0.5 text-xs text-toga-500">Enviado el {fecha(estado.enviadoEl)}</p>
            )}
          </div>
        </div>
        <div className="mt-6 border-t border-toga-100 pt-5">
          <EtapasProceso estado={estado.workflowStatus} devuelto={estado.devolucion !== null} />
        </div>
      </section>

      {estado.objecionesSinDescargo > 0 && (
        <div
          role="status"
          className="aparecer-aviso flex flex-wrap items-center justify-between gap-3 rounded-lg border border-balanza-600/30 bg-balanza-50 px-5 py-4"
        >
          <p className="text-base text-toga-900">
            <span className="font-semibold">
              {estado.objecionesSinDescargo === 1
                ? "El comité admitió una objeción contra su postulación."
                : `El comité admitió ${estado.objecionesSinDescargo} objeciones contra su postulación.`}
            </span>{" "}
            Tiene un plazo de pocos días para presentar su descargo: revíselo ahora.
          </p>
          <Link
            href="/objeciones"
            className="pulsable rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-balanza-700"
          >
            Ver objeciones
          </Link>
        </div>
      )}

      {estado.devolucion && (
        <div
          role="status"
          className="aparecer-aviso rounded-lg border border-balanza-600/30 bg-white px-5 py-4"
        >
          <p className="text-base font-semibold text-toga-900">
            La revisión le pide corregir su expediente
          </p>
          {estado.devolucion.motivo && (
            <p className="prosa mt-2 whitespace-pre-wrap text-base leading-relaxed text-toga-700">
              {estado.devolucion.motivo}
            </p>
          )}
          <p className="mt-2 text-sm text-toga-500">
            Devuelto el {fecha(estado.devolucion.fecha)}. Haga los cambios abajo y vuelva a
            enviarlo. La secretaría también puede ayudarle con las correcciones.
          </p>
        </div>
      )}

      {estado.puedeEditar && estado.postulacionesCerradas && !estado.devolucion && (
        <div
          role="status"
          className="rounded-lg border border-toga-200 bg-white px-5 py-4 text-base text-toga-700"
        >
          <span className="font-semibold text-toga-900">
            El periodo de postulaciones está cerrado.
          </span>{" "}
          Su expediente no llegó a enviarse a revisión y ya no puede enviarse.
        </div>
      )}

      {estado.puedeEditar ? (
        <>
          <EditarDatos estado={estado} />
          <CargaPostulacion estado={estado} />
        </>
      ) : (
        <section className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-toga-900">Documentos enviados</h2>
          <p className="mt-1 text-sm text-toga-500">
            Mientras el expediente está en revisión o evaluación no se pueden cambiar. Si la
            revisión encuentra algo que corregir, se lo devolverá con el motivo.
          </p>
          {estado.documentos.length === 0 ? (
            <p className="mt-4 text-sm text-toga-500">No hay documentos cargados.</p>
          ) : (
            <ul className="mt-4 divide-y divide-toga-100">
              {estado.documentos.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-toga-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-toga-900">
                      {CATEGORIA_ETIQUETA[d.category] ?? d.category}
                    </p>
                    <p className="truncate text-xs text-toga-500">{d.originalName}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
