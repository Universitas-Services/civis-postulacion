/**
 * La API no borra documentos: al sustituir uno crea otro y apunta `replacesId`
 * al anterior. En una cadena A → B → C solo la última versión sigue vigente.
 */
export function documentosVigentes<
  T extends { readonly id: string; readonly replacesId?: string | null },
>(documentos: readonly T[]): T[] {
  const sustituidos = new Set<string>();
  for (const documento of documentos) {
    if (documento.replacesId) sustituidos.add(documento.replacesId);
  }
  return documentos.filter((documento) => !sustituidos.has(documento.id));
}
