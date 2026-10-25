"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EstadoPostulacion, PrefijoTelefono } from "@/contracts";
import { PREFIJOS_TELEFONO } from "@/contracts";
import { useToast } from "@/components/toast-provider";
import {
  PasoDatosPostulante,
  validarDatosPostulante,
  type DatosPostulanteMaqueta,
} from "@/components/expediente-maqueta/paso-datos-postulante";
import type { SalaMaqueta } from "@/lib/maqueta-expediente-documentos";
import { actualizarDatos, crearPostulacion } from "@/app/(cuenta)/postulacion/acciones";

/** Mapea los campos de la API a los del formulario para marcar el error. */
const CAMPO_API: Record<string, keyof DatosPostulanteMaqueta> = {
  firstName: "nombre",
  lastName: "apellido",
  nationalId: "cedulaDigitos",
  chamber: "sala",
  phone: "telefono",
};

function desdeEstado(estado: EstadoPostulacion): DatosPostulanteMaqueta {
  const [prefijo, digitos] = estado.nationalId.split("-");
  const telefono = estado.phone ?? "";
  const prefijoTel = PREFIJOS_TELEFONO.find((p) => telefono.startsWith(p));
  return {
    nombre: estado.firstName,
    apellido: estado.lastName,
    prefijoCedula: prefijo === "E" ? "E" : "V",
    cedulaDigitos: digitos ?? "",
    sala: estado.chamber as SalaMaqueta,
    telefonoPrefijo: (prefijoTel ?? "") as PrefijoTelefono | "",
    telefonoDigitos: prefijoTel ? telefono.slice(4) : "",
  };
}

/**
 * Datos de la postulación. Sin `estado`, crea el expediente; con él, corrige
 * los datos mientras está en borrador (la cédula queda fija).
 */
export function FormularioPostulacion({
  estado,
  nombreCuenta,
  onGuardado,
}: {
  readonly estado?: EstadoPostulacion;
  /** Nombre de la cuenta, para no pedirlo dos veces al crear. */
  readonly nombreCuenta?: { readonly nombre: string; readonly apellido: string };
  readonly onGuardado?: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [datos, setDatos] = useState<DatosPostulanteMaqueta>(
    estado
      ? desdeEstado(estado)
      : {
          nombre: nombreCuenta?.nombre ?? "",
          apellido: nombreCuenta?.apellido ?? "",
          prefijoCedula: "V",
          cedulaDigitos: "",
          sala: "",
          telefonoPrefijo: "",
          telefonoDigitos: "",
        },
  );
  const [errores, setErrores] = useState<Partial<Record<keyof DatosPostulanteMaqueta, string>>>({});

  function guardar() {
    const e = validarDatosPostulante(datos, { conTelefono: true });
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    iniciar(async () => {
      const comunes = {
        firstName: datos.nombre,
        lastName: datos.apellido,
        chamber: datos.sala,
        phone: `${datos.telefonoPrefijo ?? ""}${datos.telefonoDigitos ?? ""}`,
      };
      const r = estado
        ? await actualizarDatos(comunes)
        : await crearPostulacion({
            ...comunes,
            nationalIdPrefix: datos.prefijoCedula,
            nationalIdDigits: datos.cedulaDigitos,
          });
      if (!r.ok) {
        const campos: Partial<Record<keyof DatosPostulanteMaqueta, string>> = {};
        for (const [api, texto] of Object.entries(r.campos ?? {})) {
          const campo = CAMPO_API[api];
          if (campo) campos[campo] = texto;
        }
        setErrores(campos);
        toast.error(r.error ?? "Revise los datos.");
        return;
      }
      toast.exito(
        estado ? "Datos actualizados." : "Postulación registrada. Ahora cargue sus documentos.",
      );
      onGuardado?.();
      router.refresh();
    });
  }

  return (
    <PasoDatosPostulante
      valores={datos}
      errores={errores}
      onChange={(v) => {
        setDatos(v);
        setErrores({});
      }}
      onRegistrar={guardar}
      registrando={pendiente}
      conTelefono
      cedulaFija={Boolean(estado)}
      titulo={estado ? "Corregir mis datos" : "Registrar mi postulación"}
      descripcion={
        estado
          ? "Puede corregirlos mientras el expediente está en borrador."
          : "Indique su cédula, la sala a la que aspira y un teléfono de contacto. Después cargará sus documentos."
      }
      textoBoton={estado ? "Guardar cambios" : "Registrar postulación"}
    />
  );
}
