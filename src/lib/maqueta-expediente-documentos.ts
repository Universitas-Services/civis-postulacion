/**
 * Catálogo UI del formulario de nuevo expediente.
 * Las categorías API viven en `contracts/recaudos.ts`.
 */

import { CHAMBERS, SALA_ETIQUETA, recaudoPorSlotKey } from "@/contracts";

export const SALAS_MAQUETA = CHAMBERS.map((value) => ({
  value,
  label: `Sala ${SALA_ETIQUETA[value] ?? value}`,
})) as readonly { readonly value: (typeof CHAMBERS)[number]; readonly label: string }[];

export type SalaMaqueta = (typeof CHAMBERS)[number];

export type BloqueDocumentoId =
  "identidad" | "honorabilidad" | "formacion" | "trayectoria" | "incompatibilidades" | "otro";

export type TrayectoriaOpcion = "A" | "B" | "C";

export type TipoParFormacion = "especializacion" | "maestria" | "doctorado";

export interface DefinicionSlotFijo {
  readonly kind: "fijo";
  readonly id: string;
  readonly bloque: BloqueDocumentoId;
  readonly titulo: string;
  readonly ayuda: string;
  readonly opcional?: boolean;
  /** Solo visible si la trayectoria activa coincide. */
  readonly trayectoria?: TrayectoriaOpcion;
}

export interface DefinicionGrupoPar {
  readonly kind: "par_repetible";
  readonly grupoId: TipoParFormacion;
  readonly bloque: "formacion";
  readonly tituloTitulo: string;
  readonly ayudaTitulo: string;
  readonly tituloConstancia: string;
  readonly ayudaConstancia: string;
  readonly opcional?: boolean;
  readonly notaPar: string;
  readonly etiquetaAnadir: string;
}

export type DefinicionCatalogo = DefinicionSlotFijo | DefinicionGrupoPar;

export const BLOQUE_ETIQUETA: Record<BloqueDocumentoId, string> = {
  identidad: "Identidad y nacionalidad",
  honorabilidad: "Honorabilidad e idoneidad ética",
  formacion: "Formación académica",
  trayectoria: "Trayectoria profesional",
  incompatibilidades: "Incompatibilidades y declaraciones juradas",
  otro: "Otro",
};

export const CATALOGO_DOCUMENTOS_MAQUETA: readonly DefinicionCatalogo[] = [
  {
    kind: "fijo",
    id: "partida_nacimiento",
    bloque: "identidad",
    titulo: "Copia certificada partida de nacimiento",
    ayuda: "Adjunte PDF o imagen de la partida de nacimiento del postulante",
  },
  {
    kind: "fijo",
    id: "cedula_identidad",
    bloque: "identidad",
    titulo: "Copia de la cédula de identidad vigente",
    ayuda: "Adjunte PDF o imagen de la cédula de identidad vigente del postulante",
  },
  {
    kind: "fijo",
    id: "dj_no_otra_nacionalidad",
    bloque: "identidad",
    titulo: "Declaración jurada de no poseer otra nacionalidad",
    ayuda:
      "Adjunte PDF o imagen de la declaración jurada de no poseer otra nacionalidad del postulante",
  },
  {
    kind: "fijo",
    id: "sintesis_curricular",
    bloque: "identidad",
    titulo: "Copia de la síntesis curricular actualizada",
    ayuda:
      "Adjunte PDF o imagen de la síntesis curricular (currículum vitae actualizado) del postulante",
  },
  {
    kind: "fijo",
    id: "solvencia_moral",
    bloque: "honorabilidad",
    titulo: "Solvencia moral o carta deontológica",
    ayuda:
      "Adjunte PDF o imagen de la carta deontológica del postulante emitida por un colegio de abogados, universidad u organización profesional afín",
  },
  {
    kind: "fijo",
    id: "cert_medica_mental",
    bloque: "honorabilidad",
    titulo: "Certificación médica de capacidad mental",
    ayuda:
      "Adjunte PDF o imagen de la certificación médica o psicológica de capacidad mental del postulante expedida por un especialista",
  },
  {
    kind: "fijo",
    id: "antecedentes_penales",
    bloque: "honorabilidad",
    titulo: "Certificado de antecedentes penales",
    ayuda: "Adjunte PDF o imagen del certificado de antecedentes penales vigente del postulante",
  },
  {
    kind: "fijo",
    id: "contraloria_inhabilitacion",
    bloque: "honorabilidad",
    titulo: "Certificación de Contraloría General de la República de no poseer inhabilitación",
    ayuda:
      "Adjunte PDF o imagen de la certificación de la Contraloría General de la República del postulante que acredite no registrar inhabilitación ni responsabilidad administrativa firme",
  },
  {
    kind: "fijo",
    id: "titulo_pregrado_abogado",
    bloque: "formacion",
    titulo: "Fondo negro del título universitario de abogado",
    ayuda:
      "Adjunte PDF o imagen del título universitario de pregrado de abogado o licenciado en derecho de la República del postulante, debidamente protocolizado y registrado ante la oficina principal de registro público correspondiente, que acredite la titulación e idoneidad profesional de base exigida por la ley",
  },
  {
    kind: "par_repetible",
    grupoId: "especializacion",
    bloque: "formacion",
    opcional: true,
    tituloTitulo: "Fondo negro del título universitario de especialización en materia jurídica",
    ayudaTitulo:
      "Adjunte PDF o imagen del título de especialista en cualquier rama de la ciencia jurídica, expedido por institución acreditada y registrado",
    tituloConstancia:
      "Copia de la constancia de aprobación del trabajo especial de grado de la especialización",
    ayudaConstancia:
      "Adjunte PDF o imagen de la constancia o acta del jurado que certifique la aprobación del trabajo especial de grado",
    notaPar:
      "Por cada título de especialización que se adjunta se debe tener la constancia de aprobación",
    etiquetaAnadir: "Añadir otro título de especialización",
  },
  {
    kind: "par_repetible",
    grupoId: "maestria",
    bloque: "formacion",
    opcional: true,
    tituloTitulo: "Fondo negro del título universitario de maestría en ciencia jurídica",
    ayudaTitulo:
      "Adjunte PDF o imagen del título de maestría en especialidad jurídica otorgado por universidad acreditada, debidamente registrado",
    tituloConstancia:
      "Copia de la constancia de aprobación del trabajo especial de grado de la maestría",
    ayudaConstancia:
      "Adjunte PDF o imagen de la constancia o acta del jurado que certifique la aprobación del trabajo especial de grado",
    notaPar: "Por cada título de maestría que se adjunta se debe tener la constancia de aprobación",
    etiquetaAnadir: "Añadir otro título de maestría",
  },
  {
    kind: "par_repetible",
    grupoId: "doctorado",
    bloque: "formacion",
    opcional: true,
    tituloTitulo:
      "Fondo negro del título universitario de doctorado en derecho o ciencias jurídicas",
    ayudaTitulo:
      "Adjunte PDF o imagen del título de doctor o doctora en derecho o área afín, otorgado por institución acreditada, registrado y protocolizado",
    tituloConstancia: "Copia de la constancia de aprobación de tesis doctoral",
    ayudaConstancia:
      "Adjunte PDF o imagen de la constancia o acta del jurado que certifique la aprobación de la tesis doctoral",
    notaPar:
      "Por cada título de doctorado que se adjunta se debe tener la constancia de aprobación",
    etiquetaAnadir: "Añadir otro título de doctorado",
  },
  {
    kind: "fijo",
    id: "convalidacion_titulo",
    bloque: "formacion",
    opcional: true,
    titulo: "Copia del certificado de revalidación o convalidación de título extranjero",
    ayuda:
      "Adjunte PDF o imagen de la resolución o certificado de revalidación o convalidación del título extranjero. Puede cargar varios si hay más de un título del exterior.",
  },
  {
    kind: "fijo",
    id: "tray_a_inscripcion_colegio",
    bloque: "trayectoria",
    trayectoria: "A",
    titulo: "Certificación de inscripción en el colegio de abogados",
    ayuda:
      "Adjunte PDF o imagen de la certificación de inscripción oficial expedida por el colegio de abogados de su adscripción territorial",
  },
  {
    kind: "fijo",
    id: "tray_a_solvencia_colegio",
    bloque: "trayectoria",
    trayectoria: "A",
    titulo: "Certificación de solvencia del colegio de abogados",
    ayuda:
      "Adjunte PDF o imagen de la constancia de colegiación activa y solvencia vigente expedida por la junta directiva del colegio",
  },
  {
    kind: "fijo",
    id: "tray_a_inscripcion_inpre",
    bloque: "trayectoria",
    trayectoria: "A",
    titulo: "Certificación de inscripción en el INPREABOGADO",
    ayuda:
      "Adjunte PDF o imagen de la constancia de inscripción expedida por el Instituto de Previsión Social del Abogado",
  },
  {
    kind: "fijo",
    id: "tray_a_solvencia_inpre",
    bloque: "trayectoria",
    trayectoria: "A",
    titulo: "Constancia de solvencia del INPREABOGADO",
    ayuda:
      "Adjunte PDF o imagen de la constancia o certificado de solvencia vigente del Instituto de Previsión Social del Abogado",
  },
  {
    kind: "fijo",
    id: "tray_a_prueba_15_anos",
    bloque: "trayectoria",
    trayectoria: "A",
    titulo: "Copia de prueba documental que acredite quince (15) años de ejercicio libre",
    ayuda:
      "Adjunte PDF o imagen del soporte que acredite un mínimo de quince años en el ejercicio de la abogacía",
  },
  {
    kind: "fijo",
    id: "tray_b_cert_docente",
    bloque: "trayectoria",
    trayectoria: "B",
    titulo: "Certificación oficial de servicio docente y categoría",
    ayuda:
      "Adjunte PDF o imagen de la constancia institucional donde conste cátedra, antigüedad (mínimo 15 años) y categoría docente",
  },
  {
    kind: "fijo",
    id: "tray_b_actas_concurso",
    bloque: "trayectoria",
    trayectoria: "B",
    titulo: "Copia de las actas de concurso público de oposición docente",
    ayuda:
      "Adjunte PDF o imagen del acta de jurado, veredicto o resolución de nombramiento por concurso de oposición",
  },
  {
    kind: "fijo",
    id: "tray_c_cert_dem",
    bloque: "trayectoria",
    trayectoria: "C",
    titulo: "Certificación formal de carrera judicial (DEM)",
    ayuda:
      "Adjunte PDF o imagen de la constancia de servicio de la DEM o órgano competente, con trayectoria no menor a quince años",
  },
  {
    kind: "fijo",
    id: "tray_c_cert_funcionarial",
    bloque: "trayectoria",
    trayectoria: "C",
    titulo: "Certificación formal de carrera funcionarial",
    ayuda:
      "Adjunte PDF o imagen de la certificación formal de carrera funcionarial que acredite la trayectoria en el servicio público",
  },
  {
    kind: "fijo",
    id: "dj_no_militancia",
    bloque: "incompatibilidades",
    titulo: "Declaración jurada de no militancia político partidista",
    ayuda:
      "Adjunte PDF o imagen de la declaración jurada autenticada o constancia de renuncia formal de no ejercer activismo político partidista",
  },
  {
    kind: "fijo",
    id: "dj_parentesco",
    bloque: "incompatibilidades",
    titulo: "Declaración jurada de ausencia de incompatibilidad por parentesco y vínculo conyugal",
    ayuda:
      "Adjunte PDF o imagen de la declaración jurada de no poseer parentesco ni vínculo conyugal con magistrados activos del TSJ",
  },
  {
    kind: "fijo",
    id: "acta_matrimonio",
    bloque: "incompatibilidades",
    opcional: true,
    titulo: "Copia certificada de acta de matrimonio si posee",
    ayuda:
      "Adjunte PDF o imagen de la copia certificada del acta de matrimonio o constancia de unión estable de hecho",
  },
  {
    kind: "fijo",
    id: "dj_no_contratacion",
    bloque: "incompatibilidades",
    titulo: "Declaración jurada de no contratación con el Estado y conflictos de interés",
    ayuda:
      "Adjunte PDF o imagen de la declaración jurada de no ser propietario, socio ni representante de personas jurídicas con contratos vigentes con la administración pública",
  },
  {
    kind: "fijo",
    id: "otro_documento",
    bloque: "otro",
    opcional: true,
    titulo: "Otro documento",
    ayuda:
      "Adjunte PDF o imagen de cualquier documento adicional consignado. Puede cargar varios archivos.",
  },
] as const;

export interface SlotInstancia {
  readonly slotKey: string;
  readonly bloque: BloqueDocumentoId;
  readonly titulo: string;
  readonly ayuda: string;
  readonly opcional: boolean;
  /** Permite varios PDF en el mismo tipo (no duplica el ítem del sidebar). */
  readonly multiple: boolean;
  readonly notaMultiple?: string;
  readonly etiquetaAnadir?: string;
  readonly grupoPar?: TipoParFormacion;
  readonly rolPar?: "titulo" | "constancia";
}

/** Genera las instancias de slots visibles (una entrada por tipo de documento). */
export function construirSlotsVisibles(): SlotInstancia[] {
  const out: SlotInstancia[] = [];

  for (const def of CATALOGO_DOCUMENTOS_MAQUETA) {
    if (def.kind === "fijo") {
      const recaudo = recaudoPorSlotKey(def.id);
      const multiple = recaudo?.multiple ?? false;
      out.push({
        slotKey: def.id,
        bloque: def.bloque,
        titulo: def.titulo,
        ayuda: def.ayuda,
        opcional: recaudo?.optional ?? Boolean(def.opcional),
        multiple,
        ...(multiple
          ? {
              notaMultiple: "Puede adjuntar varios PDF de este tipo.",
              etiquetaAnadir: "Añadir otro documento",
            }
          : {}),
      });
      continue;
    }

    const slotTitulo = `${def.grupoId}_titulo`;
    const recaudoTitulo = recaudoPorSlotKey(slotTitulo);
    out.push({
      slotKey: slotTitulo,
      bloque: def.bloque,
      titulo: def.tituloTitulo.replace(/^\(Opcional\)\s*/i, ""),
      ayuda: def.ayudaTitulo,
      opcional: recaudoTitulo?.optional ?? Boolean(def.opcional),
      multiple: recaudoTitulo?.multiple ?? true,
      notaMultiple: def.notaPar,
      etiquetaAnadir: def.etiquetaAnadir,
      grupoPar: def.grupoId,
      rolPar: "titulo",
    });
    const slotConstancia = `${def.grupoId}_constancia`;
    const recaudoConstancia = recaudoPorSlotKey(slotConstancia);
    out.push({
      slotKey: slotConstancia,
      bloque: def.bloque,
      titulo: def.tituloConstancia,
      ayuda: def.ayudaConstancia,
      opcional: recaudoConstancia?.optional ?? Boolean(def.opcional),
      multiple: recaudoConstancia?.multiple ?? true,
      notaMultiple: def.notaPar,
      etiquetaAnadir: "Añadir otra constancia de aprobación",
      grupoPar: def.grupoId,
      rolPar: "constancia",
    });
  }

  return out;
}

export function gruposParFormacion(): DefinicionGrupoPar[] {
  return CATALOGO_DOCUMENTOS_MAQUETA.filter(
    (d): d is DefinicionGrupoPar => d.kind === "par_repetible",
  );
}
