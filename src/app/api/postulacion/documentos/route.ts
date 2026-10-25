import { NextResponse } from "next/server";
import { DOCUMENT_CATEGORY } from "@/contracts";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

/**
 * Proxy de subida de documentos del propio postulante.
 *
 * Reconstruye el FormData poniendo `category` (y `replaces`) ANTES de `file`:
 * Fastify (`request.file()`) solo garantiza los campos recibidos antes del
 * archivo. La API decide si el expediente admite cargas (solo en borrador).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const entrante = await request.formData();
  const category = entrante.get("category");
  const replaces = entrante.get("replaces");
  const file = entrante.get("file");

  if (
    typeof category !== "string" ||
    !(DOCUMENT_CATEGORY as readonly string[]).includes(category)
  ) {
    return NextResponse.json({ message: "Categoría de documento inválida" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No se recibió ningún archivo" }, { status: 400 });
  }

  const saliente = new FormData();
  saliente.append("category", category);
  if (typeof replaces === "string" && replaces.length > 0) saliente.append("replaces", replaces);
  saliente.append("file", file, file.name.trim() || "documento.pdf");

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    "/applicant/postulacion/documentos",
    // Subida + antimalware puede tardar.
    { method: "POST", body: saliente, signal: AbortSignal.timeout(120_000) },
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Su sesión venció. Ingrese de nuevo." }, { status: 401 });
  }
  const datos: unknown = await respuesta.json().catch(() => null);
  const salida = NextResponse.json(datos ?? { message: "Respuesta vacía" }, {
    status: respuesta.status,
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
