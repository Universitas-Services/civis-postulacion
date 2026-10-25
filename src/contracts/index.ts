/**
 * Espejo del contrato de la API para el portal del postulante.
 *
 * El dominio lo define el backend, en `civis-api/src/contracts/`. Aquí sólo
 * viven los tipos y esquemas que este portal usa. Si cambia allí, refléjalo aquí.
 */
import { z } from "zod";

// ─────────────────────────────────────────── sesión

/** Este portal solo admite cuentas de postulante. */
export const ROLES = ["APPLICANT"] as const;
export type Role = (typeof ROLES)[number];

export interface Sesion {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly Role[];
}

// ─────────────────────────────────────────── cuenta

const correoSchema = z.string().trim().toLowerCase().email("Correo inválido").max(254);

/** Misma regla de clave que el panel y la API. */
export const contrasenaSchema = z
  .string()
  .min(12, "Mínimo 12 caracteres")
  .max(128, "Máximo 128 caracteres")
  .regex(/[a-z]/, "Debe incluir una minúscula")
  .regex(/[A-Z]/, "Debe incluir una mayúscula")
  .regex(/\d/, "Debe incluir un dígito");

const nombrePersonaSchema = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(80, "Máximo 80 caracteres")
  .regex(
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
    "Sólo letras y espacios (sin números ni signos)",
  );

export const loginSchema = z.object({
  email: correoSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

/** Espejo de civis-api `registroCuentaSchema`. */
export const registroCuentaSchema = z
  .object({
    firstName: nombrePersonaSchema,
    lastName: nombrePersonaSchema,
    email: correoSchema,
    password: contrasenaSchema,
    confirmPassword: z.string().min(1, "Confirme la contraseña"),
    website: z.string().max(0).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegistroCuentaInput = z.infer<typeof registroCuentaSchema>;

/** Espejo de civis-api `restablecerContrasenaSchema` (el correo va en la cookie). */
export const restablecerContrasenaSchema = z
  .object({
    codigo: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "El código tiene 6 dígitos"),
    password: contrasenaSchema,
    confirmPassword: z.string().min(1, "Confirme la contraseña"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const codigoVerificacionSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "El código tiene 6 dígitos");

export const correoPendienteSchema = correoSchema;

// ─────────────────────────────────────────── expediente

export const WORKFLOW_STATUS = [
  "DRAFT",
  "DOCUMENT_REVIEW",
  "READY_FOR_EVALUATION",
  "EVALUATION_IN_PROGRESS",
  "EVALUATED",
  "DISQUALIFIED",
  "OBJECTION_PERIOD",
  "FINAL_REVIEW",
  "FINALIZED",
  "ARCHIVED",
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number];

/** Salas admitidas al crear expediente (contrato API vigente). */
export const CHAMBERS = [
  "CONSTITUCIONAL",
  "POLITICO_ADMINISTRATIVA",
  "ELECTORAL",
  "CASACION_CIVIL",
  "CASACION_PENAL",
  "CASACION_SOCIAL",
  "PLENA",
] as const;
export type Chamber = (typeof CHAMBERS)[number];

export const SALA_ETIQUETA: Record<string, string> = {
  CONSTITUCIONAL: "Constitucional",
  POLITICO_ADMINISTRATIVA: "Político-Administrativa",
  ELECTORAL: "Electoral",
  CASACION_CIVIL: "Casación Civil",
  CASACION_PENAL: "Casación Penal",
  CASACION_SOCIAL: "Casación Social",
  PLENA: "Plena",
};

export {
  DOCUMENT_CATEGORY,
  CATEGORIA_ETIQUETA,
  type DocumentCategory,
  BLOCK_LABEL,
  BLOQUE_ETIQUETA,
  BLOCK_IDS,
  ORDEN_BLOQUES,
  type BlockId,
  RECAUDOS,
  categoryDesdeSlotKey,
  slotKeyDesdeCategory,
  recaudoPorSlotKey,
  recaudoPorCategory,
  esCategoryConocida,
} from "./recaudos";

export const PREFIJOS_TELEFONO = ["0412", "0414", "0416", "0422", "0424", "0426"] as const;
export type PrefijoTelefono = (typeof PREFIJOS_TELEFONO)[number];

/**
 * Teléfono venezolano en formato nacional (11 dígitos): 0 + código + 7.
 * Espejo de civis-api `contracts/postulacion.ts`.
 */
export const TELEFONO_VE = /^0(?:2\d{2}|4(?:12|14|16|22|24|26))\d{7}$/;

/** Deja sólo dígitos y pasa +58XXXXXXXXXX a 0XXXXXXXXXX. */
export function normalizarTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 12 && digitos.startsWith("58")) return `0${digitos.slice(2)}`;
  if (digitos.length === 10 && !digitos.startsWith("0")) return `0${digitos}`;
  return digitos;
}

/** Lo que ve el postulante de su expediente (`GET /applicant/postulacion`). */
export interface EstadoPostulacion {
  readonly candidateId: string;
  readonly fileNumber: string | null;
  readonly submissionId: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly nationalId: string;
  readonly chamber: string;
  readonly chamberLabel: string;
  readonly phone: string | null;
  readonly workflowStatus: WorkflowStatus;
  /** Etapa sin jerga interna. */
  readonly etapa: string;
  readonly enviadoEl: string | null;
  /** Presente cuando la revisión lo devolvió y aún no lo reenvía. */
  readonly devolucion: { readonly motivo: string | null; readonly fecha: string } | null;
  readonly puedeEditar: boolean;
  readonly objecionesSinDescargo: number;
  readonly documentos: readonly {
    readonly id: string;
    readonly category: string;
    readonly originalName: string;
    readonly sizeBytes: number;
    readonly uploadedAt: string;
  }[];
}

// ─────────────────────────────────────────── objeciones y descargo

export interface Descargo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly originalName: string | null;
  readonly detectedMime: string | null;
  readonly sizeBytes: number | null;
  readonly submittedVia: "POSTULANTE" | "SECRETARIA";
  readonly createdAt: string;
}

/** Objeción tal como la ve el postulante: nunca dice quién la presentó. */
export interface ObjecionRecibida {
  readonly id: string;
  readonly trackingCode: string;
  readonly causes: readonly string[];
  /** Categoría de las objeciones antiguas, que no traen causales. */
  readonly category: string;
  readonly otherCause: string | null;
  readonly description: string;
  readonly evidenceUrl: string;
  readonly receivedAt: string;
  /** Cuando el comité la envió al Consejo. Desde ahí ya no admite descargo. */
  readonly forwardedAt: string | null;
  readonly descargo: Descargo | null;
}

/** Espejo de civis-api `descargoSchema`. */
export const descargoSchema = z.object({
  title: z.string().trim().min(3, "Título demasiado corto").max(200, "Máximo 200 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "Explique su descargo (mínimo 10 caracteres)")
    .max(5000, "Máximo 5000 caracteres"),
});

/** Categorías de las objeciones anteriores a las causales detalladas. */
export const CAUSAL_ETIQUETA: Record<string, string> = {
  POLITICAL_MILITANCY: "Militancia político-partidista",
  KINSHIP: "Parentesco con altos funcionarios",
  STATE_CONTRACTS: "Contrataciones con el Estado",
  FIRM_SANCTION: "Sanción firme",
  FALSE_CREDENTIAL: "Credencial falsa",
  INSUFFICIENT_EXPERIENCE: "Experiencia insuficiente",
  OTHER: "Otra causal",
};

/** Etiquetas de las causales: todas las que conoce el postulante, en un solo texto. */
export function causalesDe(o: {
  readonly causes: readonly string[];
  readonly category: string;
  readonly otherCause: string | null;
}): string[] {
  const lista =
    o.causes.length > 0
      ? o.causes.map((c) => CAUSA_DENUNCIA_ETIQUETA[c] ?? c)
      : [CAUSAL_ETIQUETA[o.category] ?? o.category];
  if (o.otherCause) lista.push(o.otherCause);
  return lista;
}

export const CAUSA_DENUNCIA_ETIQUETA: Record<string, string> = {
  EXCLUSIVE_NATIONALITY: "Falta de nacionalidad originaria exclusiva",
  LACK_OF_HONOR: "Carencia de reconocida honorabilidad y conducta ética",
  INSUFFICIENT_CAREER: "Insuficiencia en la trayectoria profesional (menos de 15 años)",
  MISSING_TITULAR_PROFESSOR: "Falta de rango de profesor titular",
  MISSING_JUDICIAL_RANK: "Falta de jerarquía judicial mínima",
  MISSING_POSTGRADUATE: "Carencia de formación de posgrado",
  POLITICAL_MILITANCY: "Militancia política activa o proselitismo",
  STATE_CONTRACTS: "Conflicto de interés por contrataciones con el Estado",
  KINSHIP_HIGH_OFFICIALS: "Parentesco con altos funcionarios",
  INCOMPATIBLE_MARRIAGE: "Unión conyugal incompatible",
  KINSHIP_NOMINATION_COMMITTEE: "Parentesco con el Comité de Postulaciones",
  FIRM_SANCTION: "Inhabilitación o sanción firme",
  PROVEN_MENTAL_INCAPACITY: "Incapacidad mental comprobada",
  OTHER: "Otro",
};
