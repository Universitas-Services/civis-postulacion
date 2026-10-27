import type { NextConfig } from "next";

function configuredOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

const apiOrigin = configuredOrigin(process.env.NEXT_PUBLIC_API_URL);
const documentOrigin = configuredOrigin(process.env.NEXT_PUBLIC_DOCUMENT_ORIGIN);

/** Captcha del registro y el ingreso (Cloudflare Turnstile): script e iframe. */
const TURNSTILE = "https://challenges.cloudflare.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Netlify despliega con su propio adaptador (OpenNext); con `standalone`
  // el sitio responde "Page Not Found" en todas las rutas. Docker, en cambio,
  // lo necesita. Se decide por el entorno de construcción, no a mano.
  output: process.env.NETLIFY ? undefined : "standalone",
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          // React DevTools / reconstrucción de callstacks usan eval() en
          // desarrollo. En producción React no lo usa: no abrir el agujero.
          process.env.NODE_ENV === "production"
            ? `script-src 'self' 'unsafe-inline' ${TURNSTILE}`
            : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE}`,
          ["connect-src 'self'", apiOrigin, TURNSTILE].filter(Boolean).join(" "),
          // PDF en iframe (frame-src blob:). Imagen en <img> (img-src blob:).
          // Los bytes salen del proxy del panel, no del almacén.
          ["frame-src 'self' blob:", apiOrigin, documentOrigin, TURNSTILE]
            .filter(Boolean)
            .join(" "),
        ].join("; "),
      },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" }]
        : []),
    ];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // Área privada de cada postulante: no se indexa.
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          ...securityHeaders,
        ],
      },
      {
        // Después del catch-all: en Next gana la última coincidencia.
        // El visor PDF (iframe same-origin / blob) necesita poder enmarcar el proxy.
        source: "/api/documentos/contenido/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
