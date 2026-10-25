import type { LucideIcon } from "lucide-react";
import {
  Award,
  Baby,
  Briefcase,
  Building2,
  FileBadge,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  Landmark,
  Scale,
  ScrollText,
  Shield,
  Stamp,
  University,
  UserRound,
  Users,
} from "lucide-react";
import type { SlotInstancia } from "@/lib/maqueta-expediente-documentos";

/** Icono Lucide según el tipo de documento del slot. */
export function iconoParaSlot(slot: SlotInstancia): LucideIcon {
  const k = slot.slotKey;

  if (k.includes("partida_nacimiento")) return Baby;
  if (k.includes("cedula")) return IdCard;
  if (k.includes("nacionalidad")) return Stamp;
  if (k.includes("solvencia_moral")) return Scale;
  if (k.includes("cert_medica") || k.includes("mental")) return HeartPulse;
  if (k.includes("antecedentes")) return Shield;
  if (k.includes("contraloria")) return Building2;
  if (k.includes("pregrado") || k.includes("abogado")) return GraduationCap;
  if (k.includes("especializacion") && slot.rolPar === "titulo") return Award;
  if (k.includes("especializacion")) return FileCheck2;
  if (k.includes("maestria") && slot.rolPar === "titulo") return University;
  if (k.includes("maestria")) return FileCheck2;
  if (k.includes("doctorado") && slot.rolPar === "titulo") return GraduationCap;
  if (k.includes("doctorado")) return ScrollText;
  if (k.includes("convalidacion")) return FileBadge;
  if (k.includes("colegio") || k.includes("inpre") || k.includes("prueba_15")) return Briefcase;
  if (k.includes("docente") || k.includes("concurso")) return University;
  if (k.includes("dem") || k.includes("judicial") || k.includes("funcionarial")) return Landmark;
  if (k.includes("militancia")) return Users;
  if (k.includes("parentesco") || k.includes("matrimonio")) return UserRound;
  if (k.includes("sintesis") || k.includes("curricular")) return FileBadge;
  if (k.includes("otro_documento") || k === "otro_documento") return FileText;
  if (k.includes("contratacion")) return FileText;

  switch (slot.bloque) {
    case "identidad":
      return IdCard;
    case "honorabilidad":
      return Shield;
    case "formacion":
      return GraduationCap;
    case "trayectoria":
      return Briefcase;
    case "incompatibilidades":
      return Scale;
    case "otro":
      return FileText;
    default:
      return FileText;
  }
}
