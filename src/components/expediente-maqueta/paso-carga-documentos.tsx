"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FileStack } from "lucide-react";
import { categoryDesdeSlotKey } from "@/contracts";
import { useToast } from "@/components/toast-provider";
import { construirSlotsVisibles } from "@/lib/maqueta-expediente-documentos";
import { marcarSidebarDocumentoAbierto } from "@/lib/sidebar-panel";
import { SidebarChecklistDocumentos } from "./sidebar-checklist-documentos";
import { SlotDocumentoPdf, type ArchivoGuardado } from "./slot-documento-pdf";
import { iconoParaSlot } from "./iconos-documento";
import type { DatosPostulanteMaqueta } from "./paso-datos-postulante";

export function PasoCargaDocumentos({
  datos,
  salaLabel,
  submissionId,
  onEnviarRevision,
  enviandoRevision = false,
  urlCarga,
  guardadosIniciales,
  accionEnvio,
}: {
  readonly datos: DatosPostulanteMaqueta;
  readonly salaLabel: string;
  readonly submissionId: string;
  readonly onEnviarRevision: () => void;
  readonly enviandoRevision?: boolean;
  /** Ruta que recibe el FormData. Por defecto, el proxy autenticado del panel. */
  readonly urlCarga?: string;
  /** Documentos ya guardados (al reanudar una carga). */
  readonly guardadosIniciales?: Record<string, ArchivoGuardado[]>;
  /** Sustituye el botón «Enviar a revisión» (la autopostulación verifica el correo). */
  readonly accionEnvio?: ReactNode;
}) {
  const toast = useToast();
  const [pendientes, setPendientes] = useState<Record<string, File | null>>({});
  const [guardados, setGuardados] = useState<Record<string, ArchivoGuardado[]>>(
    guardadosIniciales ?? {},
  );
  const destino = urlCarga ?? `/api/documentos/${submissionId}`;
  const [activo, setActivo] = useState<string | undefined>();
  const [guardando, setGuardando] = useState(false);
  const [sustituyendoId, setSustituyendoId] = useState<string | null>(null);
  const [enRevision, setEnRevision] = useState(false);
  const [confirmandoRevision, setConfirmandoRevision] = useState(false);

  const slots = useMemo(() => construirSlotsVisibles(), []);
  const slotActivo = slots.find((s) => s.slotKey === activo);

  useEffect(() => {
    marcarSidebarDocumentoAbierto(Boolean(activo));
    return () => marcarSidebarDocumentoAbierto(false);
  }, [activo]);

  const slotsConGuardados = useMemo(() => {
    const set = new Set<string>();
    for (const [key, list] of Object.entries(guardados)) {
      if (list.length > 0) set.add(key);
    }
    return set;
  }, [guardados]);

  function seleccionar(slotKey: string) {
    if (enRevision || enviandoRevision) return;
    setActivo(slotKey);
  }

  function setPendiente(slotKey: string, file: File | null) {
    setPendientes((prev) => ({ ...prev, [slotKey]: file }));
  }

  async function guardarDocumento(slotKey: string) {
    const file = pendientes[slotKey];
    const slot = slots.find((s) => s.slotKey === slotKey);
    if (!file || !slot || enRevision || enviandoRevision) return;
    if (!slot.multiple && (guardados[slotKey]?.length ?? 0) > 0) return;

    const category = categoryDesdeSlotKey(slotKey);
    if (!category) {
      toast.error("Tipo de documento no reconocido.");
      return;
    }

    setGuardando(true);
    try {
      const cuerpo = new FormData();
      cuerpo.append("category", category);
      cuerpo.append("file", file);

      const respuesta = await fetch(destino, {
        method: "POST",
        body: cuerpo,
      });
      const datosResp = (await respuesta.json()) as {
        id?: string;
        originalName?: string;
        sizeBytes?: number;
        message?: string;
      };

      if (!respuesta.ok || !datosResp.id) {
        toast.error(datosResp.message ?? "No se pudo cargar el documento.");
        return;
      }

      const nuevo: ArchivoGuardado = {
        id: datosResp.id,
        name: datosResp.originalName ?? file.name,
        size: datosResp.sizeBytes ?? file.size,
      };
      setGuardados((prev) => ({
        ...prev,
        [slotKey]: [...(prev[slotKey] ?? []), nuevo],
      }));
      setPendientes((prev) => ({ ...prev, [slotKey]: null }));
      toast.exito(`Documento guardado: ${slot.titulo}`);
    } catch {
      toast.error("Fallo de conexión al cargar el documento.");
    } finally {
      setGuardando(false);
    }
  }

  async function sustituirDocumento(slotKey: string, id: string, file: File) {
    const slot = slots.find((s) => s.slotKey === slotKey);
    if (!slot || enRevision || enviandoRevision || sustituyendoId) return;
    const category = categoryDesdeSlotKey(slotKey);
    if (!category) {
      toast.error("Tipo de documento no reconocido.");
      return;
    }

    setSustituyendoId(id);
    try {
      const cuerpo = new FormData();
      cuerpo.append("category", category);
      cuerpo.append("replaces", id);
      cuerpo.append("file", file);

      const respuesta = await fetch(destino, {
        method: "POST",
        body: cuerpo,
      });
      const datosResp = (await respuesta.json()) as {
        id?: string;
        originalName?: string;
        sizeBytes?: number;
        message?: string;
      };
      if (!respuesta.ok || !datosResp.id) {
        toast.error(datosResp.message ?? "No se pudo sustituir el documento.");
        return;
      }
      const nuevo: ArchivoGuardado = {
        id: datosResp.id,
        name: datosResp.originalName ?? file.name,
        size: datosResp.sizeBytes ?? file.size,
      };
      setGuardados((prev) => ({
        ...prev,
        [slotKey]: (prev[slotKey] ?? []).map((g) => (g.id === id ? nuevo : g)),
      }));
      toast.exito(`Documento sustituido: ${slot.titulo}`);
    } catch {
      toast.error("Fallo de conexión al sustituir el documento.");
    } finally {
      setSustituyendoId(null);
    }
  }

  function pedirConfirmacionEnvio() {
    setConfirmandoRevision(true);
  }

  function confirmarEnviarRevision() {
    setEnRevision(true);
    setConfirmandoRevision(false);
    setActivo(undefined);
    onEnviarRevision();
  }

  const bloqueado = enRevision || enviandoRevision;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-toga-200 bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-toga-900">Carga de documentos</h2>
            <p className="mt-1 text-sm text-toga-500">
              {enRevision
                ? "Expediente enviado a revisión. Ya no se pueden cargar ni editar documentos."
                : "Seleccione un documento del listado para cargarlo y guardarlo de forma individual."}
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-toga-500">Postulante</dt>
              <dd className="font-medium text-toga-900">
                {datos.nombre} {datos.apellido}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Cédula</dt>
              <dd className="codigo font-medium text-toga-900">
                {datos.prefijoCedula}-{datos.cedulaDigitos}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-toga-500">Sala</dt>
              <dd className="font-medium text-toga-900">{salaLabel}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="space-y-4 lg:sticky lg:top-4 lg:z-10 lg:self-start">
          <div className="rounded-lg border border-toga-200 bg-white p-5 sm:p-6">
            {slotActivo ? (
              <SlotDocumentoPdf
                slotKey={slotActivo.slotKey}
                titulo={slotActivo.titulo}
                ayuda={slotActivo.ayuda}
                Icono={iconoParaSlot(slotActivo)}
                multiple={slotActivo.multiple}
                notaMultiple={slotActivo.notaMultiple}
                etiquetaAnadir={slotActivo.etiquetaAnadir}
                pendiente={pendientes[slotActivo.slotKey] ?? null}
                guardados={guardados[slotActivo.slotKey] ?? []}
                bloqueado={bloqueado}
                guardando={guardando}
                onPendiente={(f) => setPendiente(slotActivo.slotKey, f)}
                onGuardar={() => void guardarDocumento(slotActivo.slotKey)}
                onSustituir={(id, file) => void sustituirDocumento(slotActivo.slotKey, id, file)}
                sustituyendoId={sustituyendoId}
              />
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <FileStack className="h-10 w-10 text-toga-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-toga-700">
                  {enRevision
                    ? "El expediente está en revisión"
                    : "Seleccione un documento del listado"}
                </p>
                <p className="mt-1 max-w-sm text-xs text-toga-500">
                  {enRevision
                    ? "No se admiten más cargas ni cambios."
                    : "Al elegir un ítem se abre aquí la tarjeta para adjuntar el PDF o la imagen y guardarlo."}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarChecklistDocumentos
          slots={slots}
          guardados={slotsConGuardados}
          activo={activo}
          bloqueado={bloqueado}
          onSeleccionar={seleccionar}
          accion={
            enRevision ? null : accionEnvio !== undefined ? (
              accionEnvio
            ) : confirmandoRevision ? (
              <div className="w-full space-y-2">
                <p className="text-left text-xs leading-relaxed text-toga-700">
                  ¿Confirma el envío de{" "}
                  <span className="font-semibold">
                    {datos.nombre} {datos.apellido}
                  </span>
                  ? Después no podrá cargar ni editar documentos.
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmandoRevision(false)}
                    disabled={enviandoRevision}
                    className="rounded-md border border-toga-300 bg-white px-3 py-1.5 text-xs font-medium text-toga-700 hover:bg-toga-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarEnviarRevision}
                    disabled={enviandoRevision}
                    className="rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
                  >
                    {enviandoRevision ? "Enviando…" : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={pedirConfirmacionEnvio}
                className="shrink-0 rounded-md bg-balanza-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-balanza-700"
              >
                Enviar a revisión
              </button>
            )
          }
        />
      </div>
    </div>
  );
}
