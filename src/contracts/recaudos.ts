/**
 * Catálogo de recaudos alineado a civis-api/src/contracts/recaudos.ts.
 * Incluye slotKey front para enrutar formularios y flags optional/multiple de la API.
 */

export const BLOCK_IDS = [
  "identidad",
  "honorabilidad",
  "formacion",
  "trayectoria",
  "incompatibilidades",
  "otro",
] as const;
export type BlockId = (typeof BLOCK_IDS)[number];

/** Etiquetas de bloque (UI checklist / sidebar). */
export const BLOCK_LABEL: Record<BlockId, string> = {
  identidad: "Identidad y nacionalidad",
  honorabilidad: "Honorabilidad e idoneidad ética",
  formacion: "Formación académica",
  trayectoria: "Trayectoria profesional",
  incompatibilidades: "Incompatibilidades y declaraciones juradas",
  otro: "Otro",
};

/** Alias usado por sidebars existentes. */
export const BLOQUE_ETIQUETA = BLOCK_LABEL;

export const ORDEN_BLOQUES: readonly BlockId[] = [
  "identidad",
  "honorabilidad",
  "formacion",
  "trayectoria",
  "incompatibilidades",
  "otro",
];

/** Categorías API de recaudo, incluida síntesis curricular, convalidación y otro documento. */
export const DOCUMENT_CATEGORY = [
  "BIRTH_CERTIFICATE",
  "NATIONAL_ID",
  "SWORN_SINGLE_NATIONALITY",
  "CURRICULUM_VITAE",
  "HONORABILITY_LETTER",
  "MENTAL_CAPACITY_CERT",
  "CRIMINAL_RECORD",
  "COMPTROLLER_CLEARANCE",
  "LAW_DEGREE",
  "SPECIALIZATION_DEGREE",
  "SPECIALIZATION_APPROVAL",
  "MASTER_DEGREE",
  "MASTER_APPROVAL",
  "DOCTORATE_DEGREE",
  "DOCTORATE_APPROVAL",
  "FOREIGN_DEGREE_VALIDATION",
  "BAR_ASSOCIATION_REGISTRATION",
  "BAR_ASSOCIATION_SOLVENCY",
  "INPREABOGADO_REGISTRATION",
  "INPREABOGADO_SOLVENCY",
  "FREE_PRACTICE_PROOF",
  "TEACHING_SERVICE_CERT",
  "TEACHING_CONTEST_RECORD",
  "JUDICIAL_CAREER_CERT",
  "PUBLIC_ADMIN_CAREER_CERT",
  "SWORN_NO_PARTY_MILITANCY",
  "SWORN_NO_KINSHIP",
  "MARRIAGE_CERTIFICATE",
  "SWORN_NO_STATE_CONTRACTS",
  "OTHER",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORY)[number];

export interface RecaudoDef {
  readonly category: DocumentCategory;
  readonly slotKey: string | null;
  readonly bloque: BlockId | null;
  readonly etiqueta: string;
  readonly optional: boolean;
  readonly multiple: boolean;
  readonly extraibleConIa: boolean;
}

/** optional/multiple/etiqueta = civis-api RECAUDOS; slotKey = wiring UI. */
export const RECAUDOS: readonly RecaudoDef[] = [
  {
    category: "BIRTH_CERTIFICATE",
    slotKey: "partida_nacimiento",
    bloque: "identidad",
    etiqueta: "Copia certificada de la partida de nacimiento",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "NATIONAL_ID",
    slotKey: "cedula_identidad",
    bloque: "identidad",
    etiqueta: "Cédula de identidad vigente",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "SWORN_SINGLE_NATIONALITY",
    slotKey: "dj_no_otra_nacionalidad",
    bloque: "identidad",
    etiqueta: "Declaración jurada de no poseer otra nacionalidad",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "CURRICULUM_VITAE",
    slotKey: "sintesis_curricular",
    bloque: "identidad",
    etiqueta: "Copia de la síntesis curricular actualizada",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "HONORABILITY_LETTER",
    slotKey: "solvencia_moral",
    bloque: "honorabilidad",
    etiqueta: "Solvencia moral o carta deontológica",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "MENTAL_CAPACITY_CERT",
    slotKey: "cert_medica_mental",
    bloque: "honorabilidad",
    etiqueta: "Certificación médica de capacidad mental",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "CRIMINAL_RECORD",
    slotKey: "antecedentes_penales",
    bloque: "honorabilidad",
    etiqueta: "Certificado de antecedentes penales",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "COMPTROLLER_CLEARANCE",
    slotKey: "contraloria_inhabilitacion",
    bloque: "honorabilidad",
    etiqueta: "Certificación de la Contraloría (no inhabilitación)",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "LAW_DEGREE",
    slotKey: "titulo_pregrado_abogado",
    bloque: "formacion",
    etiqueta: "Título universitario de abogado",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "SPECIALIZATION_DEGREE",
    slotKey: "especializacion_titulo",
    bloque: "formacion",
    etiqueta: "Título de especialización jurídica",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "SPECIALIZATION_APPROVAL",
    slotKey: "especializacion_constancia",
    bloque: "formacion",
    etiqueta: "Constancia de aprobación de la especialización",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "MASTER_DEGREE",
    slotKey: "maestria_titulo",
    bloque: "formacion",
    etiqueta: "Título de maestría en ciencia jurídica",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "MASTER_APPROVAL",
    slotKey: "maestria_constancia",
    bloque: "formacion",
    etiqueta: "Constancia de aprobación de la maestría",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "DOCTORATE_DEGREE",
    slotKey: "doctorado_titulo",
    bloque: "formacion",
    etiqueta: "Título de doctorado en derecho",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "DOCTORATE_APPROVAL",
    slotKey: "doctorado_constancia",
    bloque: "formacion",
    etiqueta: "Constancia de aprobación de la tesis doctoral",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "FOREIGN_DEGREE_VALIDATION",
    slotKey: "convalidacion_titulo",
    bloque: "formacion",
    etiqueta: "Convalidación de título extranjero",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "BAR_ASSOCIATION_REGISTRATION",
    slotKey: "tray_a_inscripcion_colegio",
    bloque: "trayectoria",
    etiqueta: "Inscripción en el colegio de abogados",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "BAR_ASSOCIATION_SOLVENCY",
    slotKey: "tray_a_solvencia_colegio",
    bloque: "trayectoria",
    etiqueta: "Solvencia del colegio de abogados",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "INPREABOGADO_REGISTRATION",
    slotKey: "tray_a_inscripcion_inpre",
    bloque: "trayectoria",
    etiqueta: "Inscripción en INPREABOGADO",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "INPREABOGADO_SOLVENCY",
    slotKey: "tray_a_solvencia_inpre",
    bloque: "trayectoria",
    etiqueta: "Solvencia de INPREABOGADO",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "FREE_PRACTICE_PROOF",
    slotKey: "tray_a_prueba_15_anos",
    bloque: "trayectoria",
    etiqueta: "Prueba de 15 años de ejercicio libre de la profesión",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "TEACHING_SERVICE_CERT",
    slotKey: "tray_b_cert_docente",
    bloque: "trayectoria",
    etiqueta: "Certificación de servicio docente y categoría",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "TEACHING_CONTEST_RECORD",
    slotKey: "tray_b_actas_concurso",
    bloque: "trayectoria",
    etiqueta: "Actas de concurso público de oposición docente",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
  {
    category: "JUDICIAL_CAREER_CERT",
    slotKey: "tray_c_cert_dem",
    bloque: "trayectoria",
    etiqueta: "Certificación de carrera judicial (DEM)",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "PUBLIC_ADMIN_CAREER_CERT",
    slotKey: "tray_c_cert_funcionarial",
    bloque: "trayectoria",
    etiqueta: "Certificación de carrera funcionarial jurídica",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "SWORN_NO_PARTY_MILITANCY",
    slotKey: "dj_no_militancia",
    bloque: "incompatibilidades",
    etiqueta: "Declaración jurada de no militancia político-partidista",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "SWORN_NO_KINSHIP",
    slotKey: "dj_parentesco",
    bloque: "incompatibilidades",
    etiqueta: "Declaración jurada de ausencia de parentesco o vínculo conyugal",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "MARRIAGE_CERTIFICATE",
    slotKey: "acta_matrimonio",
    bloque: "incompatibilidades",
    etiqueta: "Acta de matrimonio o unión estable",
    optional: true,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "SWORN_NO_STATE_CONTRACTS",
    slotKey: "dj_no_contratacion",
    bloque: "incompatibilidades",
    etiqueta: "Declaración jurada de no contratación con el Estado",
    optional: false,
    multiple: false,
    extraibleConIa: true,
  },
  {
    category: "OTHER",
    slotKey: "otro_documento",
    bloque: "otro",
    etiqueta: "Otro documento",
    optional: true,
    multiple: true,
    extraibleConIa: true,
  },
] as const;

export const CATEGORIA_ETIQUETA: Record<string, string> = Object.fromEntries(
  RECAUDOS.map((r) => [r.category, r.etiqueta]),
);

const porSlot = new Map(
  RECAUDOS.filter((r): r is RecaudoDef & { slotKey: string } => r.slotKey !== null).map((r) => [
    r.slotKey,
    r,
  ]),
);
const porCategory = new Map(RECAUDOS.map((r) => [r.category, r]));

export function recaudoPorSlotKey(slotKey: string): RecaudoDef | undefined {
  return porSlot.get(slotKey);
}

export function recaudoPorCategory(category: string): RecaudoDef | undefined {
  return porCategory.get(category as DocumentCategory);
}

export function categoryDesdeSlotKey(slotKey: string): DocumentCategory | undefined {
  return porSlot.get(slotKey)?.category;
}

export function slotKeyDesdeCategory(category: string): string | undefined {
  return porCategory.get(category as DocumentCategory)?.slotKey ?? undefined;
}

export function esExtraibleConIa(category: string): boolean {
  return porCategory.get(category as DocumentCategory)?.extraibleConIa === true;
}

export function esCategoryConocida(category: string): category is DocumentCategory {
  return porCategory.has(category as DocumentCategory);
}

export function ordenBloquesRevision(): readonly BlockId[] {
  return ORDEN_BLOQUES;
}
