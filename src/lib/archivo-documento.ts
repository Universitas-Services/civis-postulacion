/**
 * Tipos de archivo admitidos en la carga documental del panel.
 * La API valida el contenido real; esto solo filtra en el cliente.
 */

export const ACCEPT_ARCHIVO_DOCUMENTO =
  "application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp";

const TIPOS_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const EXT_OK = /\.(pdf|jpe?g|png|webp)$/i;

export function esArchivoDocumentoPermitido(file: File): boolean {
  if (TIPOS_MIME.has(file.type)) return true;
  // Algunos navegadores dejan type vacío; validar por extensión.
  return EXT_OK.test(file.name);
}

export const TEXTO_FORMATOS_DOCUMENTO = "PDF o imagen (JPEG, PNG, WEBP).";

const MIME_IMAGEN = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** El visor elige imagen o PDF según el tipo real del archivo, no solo la extensión. */
export async function prepararVistaDocumento(
  blob: Blob,
  nombreArchivo: string,
): Promise<{ readonly blob: Blob; readonly modo: "imagen" | "pdf" }> {
  const mime = blob.type.split(";")[0]?.trim().toLowerCase() ?? "";
  if (MIME_IMAGEN.has(mime)) return { blob, modo: "imagen" };

  const cabecera = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const esJpeg = cabecera[0] === 0xff && cabecera[1] === 0xd8 && cabecera[2] === 0xff;
  const esPng =
    cabecera[0] === 0x89 && cabecera[1] === 0x50 && cabecera[2] === 0x4e && cabecera[3] === 0x47;
  const esGif = cabecera[0] === 0x47 && cabecera[1] === 0x49 && cabecera[2] === 0x46;
  const esWebp =
    cabecera[0] === 0x52 &&
    cabecera[1] === 0x49 &&
    cabecera[2] === 0x46 &&
    cabecera[3] === 0x46 &&
    cabecera[8] === 0x57 &&
    cabecera[9] === 0x45 &&
    cabecera[10] === 0x42 &&
    cabecera[11] === 0x50;

  if (esJpeg || esPng || esGif || esWebp || /\.(jpe?g|png|webp|gif)$/i.test(nombreArchivo)) {
    const tipo = esPng ? "image/png" : esGif ? "image/gif" : esWebp ? "image/webp" : "image/jpeg";
    const corregido = mime.startsWith("image/")
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: tipo });
    return { blob: corregido, modo: "imagen" };
  }

  return { blob, modo: "pdf" };
}
