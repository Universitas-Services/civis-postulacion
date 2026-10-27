"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import type { DocumentoLegal } from "@/contracts";
import {
  aceptarDocumentos,
  iniciarSesion,
  pedirCodigoRecuperacion,
  reenviarCodigo,
  reenviarCodigoRecuperacion,
  registrarCuenta,
  restablecerContrasena,
  verificarCuenta,
  type EstadoFormulario,
} from "@/app/acciones-cuenta";
import { useToast } from "@/components/toast-provider";
import {
  AvisoError,
  BotonEnviar,
  Campo,
  CampoContrasena,
  CLASE_CAMPO,
} from "@/components/formulario/campos";
import { CasillasAceptacion } from "@/components/legal/casillas-aceptacion";
import { Captcha } from "./captcha";

export function FormularioIngreso() {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(iniciarSesion, {});
  return (
    <form action={accion} className="space-y-4" noValidate>
      <AvisoError mensaje={estado.error} />
      <Campo
        nombre="email"
        etiqueta="Correo"
        type="email"
        autoComplete="username"
        required
        defaultValue={estado.valores?.email}
        error={estado.campos?.email}
      />
      <CampoContrasena
        nombre="password"
        etiqueta="Contraseña"
        autoComplete="current-password"
        error={estado.campos?.password}
      />
      <p className="-mt-1 text-right text-sm">
        <Link href="/recuperar" className="font-medium text-balanza-700 hover:text-balanza-600">
          ¿Olvidó su contraseña?
        </Link>
      </p>
      <Captcha reinicio={estado} />
      <BotonEnviar enCurso="Ingresando…">Ingresar</BotonEnviar>
      <p className="text-center text-sm text-toga-600">
        ¿Aún no tiene cuenta?{" "}
        <Link href="/registro" className="font-semibold text-balanza-700 hover:text-balanza-600">
          Créela aquí
        </Link>
      </p>
    </form>
  );
}

export function FormularioRegistro({
  terminos,
  privacidad,
}: {
  readonly terminos: DocumentoLegal;
  readonly privacidad: DocumentoLegal;
}) {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(registrarCuenta, {});
  const c = estado.campos ?? {};
  return (
    <form action={accion} className="space-y-4" noValidate>
      <AvisoError mensaje={estado.error} />
      {/* Campo trampa: invisible para personas; si llega con contenido, es un bot. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          nombre="firstName"
          etiqueta="Nombres"
          autoComplete="given-name"
          required
          defaultValue={estado.valores?.firstName}
          error={c.firstName}
        />
        <Campo
          nombre="lastName"
          etiqueta="Apellidos"
          autoComplete="family-name"
          required
          defaultValue={estado.valores?.lastName}
          error={c.lastName}
        />
      </div>
      <Campo
        nombre="email"
        etiqueta="Correo"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.valores?.email}
        error={c.email}
        ayuda="Le enviaremos un código para confirmarlo. Por aquí le avisaremos de cada novedad."
      />
      <CampoContrasena
        nombre="password"
        etiqueta="Contraseña"
        autoComplete="new-password"
        error={c.password}
        ayuda="Mínimo 12 caracteres, con mayúscula, minúscula y un número."
      />
      <CampoContrasena
        nombre="confirmPassword"
        etiqueta="Repita la contraseña"
        autoComplete="new-password"
        error={c.confirmPassword}
      />
      <CasillasAceptacion
        terminos={terminos}
        privacidad={privacidad}
        errores={{
          aceptaTerminos: c.aceptaTerminos ?? c.terminosId,
          aceptaPrivacidad: c.aceptaPrivacidad ?? c.privacidadId,
        }}
        marcadas={{
          terminos: estado.valores?.aceptaTerminos === "on",
          privacidad: estado.valores?.aceptaPrivacidad === "on",
        }}
      />
      <Captcha reinicio={estado} />
      <BotonEnviar enCurso="Creando la cuenta…">Crear cuenta</BotonEnviar>
      <p className="text-center text-sm text-toga-600">
        ¿Ya tiene cuenta?{" "}
        <Link href="/login" className="font-semibold text-balanza-700 hover:text-balanza-600">
          Ingrese
        </Link>
      </p>
    </form>
  );
}

export function FormularioVerificacion() {
  const toast = useToast();
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(verificarCuenta, {});
  const [reenviando, iniciar] = useTransition();
  const [codigo, setCodigo] = useState("");

  function reenviar() {
    iniciar(async () => {
      const r = await reenviarCodigo();
      if (r.error) toast.error(r.error);
      else if (r.exito) toast.exito(r.exito);
    });
  }

  return (
    <form action={accion} className="space-y-4" noValidate>
      <AvisoError mensaje={estado.error} />
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-toga-800">
          Código de 6 dígitos
        </label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={Boolean(estado.campos?.codigo)}
          aria-describedby={estado.campos?.codigo ? "codigo-error" : undefined}
          className={`${CLASE_CAMPO} codigo text-center text-2xl tracking-[0.4em]${
            estado.campos?.codigo ? " campo-con-error" : ""
          }`}
        />
        {estado.campos?.codigo && (
          <p id="codigo-error" role="alert" className="mensaje-error-campo">
            {estado.campos.codigo}
          </p>
        )}
      </div>
      <BotonEnviar enCurso="Comprobando…">Confirmar correo</BotonEnviar>
      <p className="text-center text-sm text-toga-600">
        ¿No le llegó?{" "}
        <button
          type="button"
          onClick={reenviar}
          disabled={reenviando}
          className="font-semibold text-balanza-700 hover:text-balanza-600 disabled:opacity-60"
        >
          {reenviando ? "Enviando…" : "Enviar otro código"}
        </button>
      </p>
    </form>
  );
}

/** Recuperar contraseña, paso 1: el correo de la cuenta. */
export function FormularioPedirCodigo() {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(pedirCodigoRecuperacion, {});
  return (
    <form action={accion} className="space-y-4" noValidate>
      <AvisoError mensaje={estado.error} />
      <Campo
        nombre="email"
        etiqueta="Correo de su cuenta"
        type="email"
        autoComplete="username"
        required
        defaultValue={estado.valores?.email}
        error={estado.campos?.email}
      />
      <BotonEnviar enCurso="Enviando…">Enviarme un código</BotonEnviar>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-balanza-700 hover:text-balanza-600">
          Volver a ingresar
        </Link>
      </p>
    </form>
  );
}

/** Recuperar contraseña, paso 2: código y contraseña nueva. */
export function FormularioRestablecer() {
  const toast = useToast();
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(restablecerContrasena, {});
  const [reenviando, iniciar] = useTransition();
  const [codigo, setCodigo] = useState("");
  const c = estado.campos ?? {};

  function reenviar() {
    iniciar(async () => {
      const r = await reenviarCodigoRecuperacion();
      if (r.error) toast.error(r.error);
      else if (r.exito) toast.exito(r.exito);
    });
  }

  return (
    <form action={accion} className="space-y-4" noValidate>
      <AvisoError mensaje={estado.error} />
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-toga-800">
          Código de 6 dígitos
        </label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={Boolean(c.codigo)}
          aria-describedby={c.codigo ? "codigo-error" : undefined}
          className={`${CLASE_CAMPO} codigo text-center text-2xl tracking-[0.4em]${
            c.codigo ? " campo-con-error" : ""
          }`}
        />
        {c.codigo && (
          <p id="codigo-error" role="alert" className="mensaje-error-campo">
            {c.codigo}
          </p>
        )}
      </div>
      <CampoContrasena
        nombre="password"
        etiqueta="Contraseña nueva"
        autoComplete="new-password"
        error={c.password}
        ayuda="Mínimo 12 caracteres, con mayúscula, minúscula y un número."
      />
      <CampoContrasena
        nombre="confirmPassword"
        etiqueta="Repita la contraseña nueva"
        autoComplete="new-password"
        error={c.confirmPassword}
      />
      <BotonEnviar enCurso="Guardando…">Restablecer contraseña</BotonEnviar>
      <p className="text-center text-sm text-toga-600">
        ¿No le llegó?{" "}
        <button
          type="button"
          onClick={reenviar}
          disabled={reenviando}
          className="font-semibold text-balanza-700 hover:text-balanza-600 disabled:opacity-60"
        >
          {reenviando ? "Enviando…" : "Enviar otro código"}
        </button>
      </p>
    </form>
  );
}

/**
 * Aceptación de versiones nuevas de los términos o la política. Sólo muestra
 * las que la cuenta todavía no aceptó, con el resumen de cambios.
 */
export function FormularioAceptacion({
  pendientes,
}: {
  readonly pendientes: readonly DocumentoLegal[];
}) {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(aceptarDocumentos, {});
  const terminos = pendientes.find((d) => d.kind === "TERMINOS") ?? null;
  const privacidad = pendientes.find((d) => d.kind === "PRIVACIDAD") ?? null;
  return (
    <form action={accion} className="space-y-5" noValidate>
      <AvisoError mensaje={estado.error} />
      <ul className="space-y-3">
        {pendientes.map((d) => (
          <li key={d.id} className="rounded-md border border-toga-200 bg-white p-4">
            <p className="font-semibold text-toga-900">
              {d.title} · versión <span className="cifra">{d.version}</span>
            </p>
            {d.changeSummary && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-toga-700">
                <span className="font-medium">Qué cambió:</span> {d.changeSummary}
              </p>
            )}
          </li>
        ))}
      </ul>
      <CasillasAceptacion
        terminos={terminos}
        privacidad={privacidad}
        errores={estado.campos ?? {}}
      />
      <BotonEnviar enCurso="Guardando…">Aceptar y continuar</BotonEnviar>
    </form>
  );
}
