"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

export const CLASE_CAMPO =
  "mt-1.5 block w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-base text-toga-900 transition-colors placeholder:text-toga-400 focus:border-balanza-600 focus:ring-2 focus:ring-balanza-600/20";

/** Campo con etiqueta, ayuda y error accesibles. */
export function Campo({
  nombre,
  etiqueta,
  error,
  ayuda,
  ...resto
}: {
  readonly nombre: string;
  readonly etiqueta: string;
  readonly error?: string;
  readonly ayuda?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">) {
  const descritoPor = [error ? `${nombre}-error` : null, ayuda ? `${nombre}-ayuda` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-toga-800">
        {etiqueta}
      </label>
      <input
        id={nombre}
        name={nombre}
        aria-invalid={Boolean(error)}
        aria-describedby={descritoPor || undefined}
        className={`${CLASE_CAMPO}${error ? " campo-con-error" : ""}`}
        {...resto}
      />
      {ayuda && !error && (
        <p id={`${nombre}-ayuda`} className="mt-1 text-xs text-toga-500">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${nombre}-error`} role="alert" className="mensaje-error-campo">
          {error}
        </p>
      )}
    </div>
  );
}

/** Contraseña con botón para mostrarla. */
export function CampoContrasena({
  nombre,
  etiqueta,
  error,
  ayuda,
  autoComplete,
}: {
  readonly nombre: string;
  readonly etiqueta: string;
  readonly error?: string;
  readonly ayuda?: ReactNode;
  readonly autoComplete: "current-password" | "new-password";
}) {
  const [ver, setVer] = useState(false);
  const descritoPor = [error ? `${nombre}-error` : null, ayuda ? `${nombre}-ayuda` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-toga-800">
        {etiqueta}
      </label>
      <div className="relative mt-1.5">
        <input
          id={nombre}
          name={nombre}
          type={ver ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={descritoPor || undefined}
          className={`${CLASE_CAMPO} mt-0 pr-11${error ? " campo-con-error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={ver}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-toga-500 transition-colors hover:text-toga-800"
        >
          {ver ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {ayuda && !error && (
        <p id={`${nombre}-ayuda`} className="mt-1 text-xs text-toga-500">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${nombre}-error`} role="alert" className="mensaje-error-campo">
          {error}
        </p>
      )}
    </div>
  );
}

/** Botón principal de un formulario con Server Action. */
export function BotonEnviar({
  children,
  enCurso,
}: {
  readonly children: ReactNode;
  readonly enCurso: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pulsable flex w-full items-center justify-center rounded-md bg-balanza-600 px-4 py-3 text-base font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
    >
      {pending ? enCurso : children}
    </button>
  );
}

/** Aviso de error general del formulario. */
export function AvisoError({ mensaje }: { readonly mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
    >
      {mensaje}
    </p>
  );
}
