import { NextResponse } from "next/server";
import { z } from "zod";
import { adjuntarCookieSesion, fetchAutenticado } from "@/lib/api";

const idSchema = z.string().uuid();

/** PDF de un auto del comité notificado al postulante (admisión o decisión). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; autoId: string }> },
): Promise<Response> {
  const { id, autoId } = await params;
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(autoId).success) {
    return NextResponse.json({ message: "Auto inválido" }, { status: 400 });
  }
  const { respuesta, cookieSesionNueva } = await fetchAutenticado(
    `/applicant/objeciones/${id}/autos/${autoId}`,
  );
  if (!respuesta) {
    return NextResponse.json({ message: "Su sesión venció. Ingrese de nuevo." }, { status: 401 });
  }
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: unknown } | null;
    const message = typeof cuerpo?.message === "string" ? cuerpo.message : "Auto no disponible";
    return NextResponse.json({ message }, { status: respuesta.status });
  }
  const salida = new NextResponse(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": respuesta.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
  return adjuntarCookieSesion(salida, cookieSesionNueva);
}
