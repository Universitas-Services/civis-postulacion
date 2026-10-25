"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TipoToast = "exito" | "error";

type ToastItem = {
  readonly id: string;
  readonly tipo: TipoToast;
  readonly mensaje: string;
};

type ToastApi = {
  readonly exito: (mensaje: string) => void;
  /** Alias de `exito` (por si queda código o HMR con el nombre en inglés). */
  readonly success: (mensaje: string) => void;
  readonly error: (mensaje: string) => void;
  readonly dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** Sin provider (p. ej. SSR del slot RSC del layout): no-ops; en cliente hidrata con el real. */
const TOAST_SSR: ToastApi = {
  exito: () => undefined,
  success: () => undefined,
  error: () => undefined,
  dismiss: () => undefined,
};

const MAX_TOASTS = 3;
const DURACION_MS = 4800;

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const contador = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tipo: TipoToast, mensaje: string) => {
    const texto = mensaje.trim();
    if (!texto) return;
    contador.current += 1;
    const id = `toast-${contador.current}`;
    setItems((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, tipo, mensaje: texto }]);
  }, []);

  const api = useMemo<ToastApi>(() => {
    const exito = (mensaje: string) => push("exito", mensaje);
    return {
      exito,
      success: exito,
      error: (mensaje) => push("error", mensaje),
      dismiss,
    };
  }, [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ListaToasts items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  // En App Router el children del layout es un slot RSC: durante el SSR el
  // cliente hijo no ve aún el ToastProvider. Tras hidratar sí.
  return ctx ?? TOAST_SSR;
}

function ListaToasts({
  items,
  onDismiss,
}: {
  readonly items: readonly ToastItem[];
  readonly onDismiss: (id: string) => void;
}) {
  const tituloId = useId();

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <p id={tituloId} className="sr-only">
        Notificaciones
      </p>
      {items.map((t) => (
        <ToastVista key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastVista({
  toast,
  onDismiss,
}: {
  readonly toast: ToastItem;
  readonly onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), DURACION_MS);
    return () => window.clearTimeout(t);
  }, [toast.id, onDismiss]);

  const esError = toast.tipo === "error";

  return (
    <div
      role={esError ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-md motion-safe:animate-[entrada-ui_160ms_ease-out] ${
        esError
          ? "border-balanza-600/30 bg-balanza-50 text-balanza-700"
          : "border-validado-700/25 bg-validado-50 text-validado-700"
      }`}
    >
      <span className="mt-0.5 shrink-0 font-semibold" aria-hidden="true">
        {esError ? "!" : "✓"}
      </span>
      <p className="min-w-0 flex-1 leading-relaxed">{toast.mensaje}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-0.5 text-current/70 transition-colors hover:bg-black/5 hover:text-current"
        aria-label="Cerrar notificación"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
