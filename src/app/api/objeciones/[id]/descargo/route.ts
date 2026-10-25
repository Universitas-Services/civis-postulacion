import { NextResponse } from "next/server";
import { z } from "zod";
import { descargoSchema } from "@/contracts";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

const idSchema = z.string().uuid();

/** Documento adjunto a su propio descargo, para verlo en el navegador. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ message: "Objeción inválida" }, { status: 400 });
  }
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/applicant/objeciones/${id}/descargo/archivo`,
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Su sesión venció. Ingrese de nuevo." }, { status: 401 });
  }
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
    const message =
      typeof cuerpo?.message === "string" ? cuerpo.message : "Documento no disponible";
    return NextResponse.json({ message }, { status: respuesta.status });
  }
  const tipo = respuesta.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  const visible =
    tipo === "application/pdf" || tipo.startsWith("image/") ? tipo : "application/octet-stream";
  const salida = new NextResponse(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": visible,
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}

/** Presenta el descargo: título, descripción y un documento opcional. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ message: "Objeción inválida" }, { status: 400 });
  }
  const entrante = await request.formData();
  const analisis = descargoSchema.safeParse({
    title: entrante.get("title"),
    description: entrante.get("description"),
  });
  if (!analisis.success) {
    return NextResponse.json(
      { message: analisis.error.issues[0]?.message ?? "Revise su descargo" },
      { status: 400 },
    );
  }

  const saliente = new FormData();
  saliente.append("title", analisis.data.title);
  saliente.append("description", analisis.data.description);
  const archivo = entrante.get("file");
  if (archivo instanceof File && archivo.size > 0) {
    saliente.append("file", archivo, archivo.name || "descargo.pdf");
  }

  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/applicant/objeciones/${id}/descargo`,
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
