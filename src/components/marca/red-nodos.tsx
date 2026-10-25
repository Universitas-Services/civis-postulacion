/**
 * Patrón de la guía de marca: una red de nodos (trazabilidad, verificación).
 * Se genera con una semilla fija para que el dibujo sea siempre el mismo y no
 * cambie entre servidor y cliente. Decorativo: oculto a lectores de pantalla.
 */
function generador(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

const ANCHO = 600;
const ALTO = 800;

function construirRed(cantidad: number, semilla: number) {
  const azar = generador(semilla);
  const nodos = Array.from({ length: cantidad }, (_, i) => ({
    x: Math.round(azar() * ANCHO),
    y: Math.round(azar() * ALTO),
    // Uno de cada seis nodos va en vino, como en la guía.
    acento: i % 6 === 0,
    radio: 1.6 + azar() * 2.2,
  }));
  const enlaces: { a: number; b: number }[] = [];
  nodos.forEach((n, i) => {
    const cercanos = nodos
      .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
      .filter(({ j, d }) => j > i && d < 150)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    for (const { j } of cercanos) enlaces.push({ a: i, b: j });
  });
  return { nodos, enlaces };
}

const RED = construirRed(46, 20261025);

export function RedNodos({
  tono = "oscuro",
  className = "",
}: {
  /** `oscuro`: sobre azul profundo. `claro`: sobre fondo blanco. */
  readonly tono?: "oscuro" | "claro";
  readonly className?: string;
}) {
  const linea = tono === "oscuro" ? "rgb(248 250 252 / 0.14)" : "rgb(15 42 68 / 0.12)";
  const nodo = tono === "oscuro" ? "rgb(203 213 225 / 0.55)" : "rgb(15 42 68 / 0.35)";
  const acento = tono === "oscuro" ? "#c2414f" : "#7a1e2d";
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none ${className}`}
    >
      <g stroke={linea} strokeWidth="1">
        {RED.enlaces.map(({ a, b }) => (
          <line
            key={`${a}-${b}`}
            x1={RED.nodos[a]!.x}
            y1={RED.nodos[a]!.y}
            x2={RED.nodos[b]!.x}
            y2={RED.nodos[b]!.y}
          />
        ))}
      </g>
      {RED.nodos.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.radio} fill={n.acento ? acento : nodo} />
      ))}
    </svg>
  );
}
