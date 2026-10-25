---
name: front-postulante-civis
description: Convenciones del portal del postulante (civis-postulacion) de la plataforma de verificación de credenciales. Úsala SIEMPRE que se toque este proyecto - una pantalla, un formulario, la sesión, una Server Action o una llamada a la API. Actívala aunque solo digan "añade esta vista", "arregla el registro" o "que se vea mejor". Cubre la sesión sin exponer el token, el registro con correo verificado, el flujo de la postulación y de los descargos, y las reglas que la interfaz nunca debe contradecir.
---

# Portal del postulante — CIVIS

Un único usuario: la persona que se postula a magistrado del TSJ. Crea su cuenta,
registra su expediente, carga documentos, sigue el proceso y responde objeciones.
Es una herramienta (modo *Operate*): claridad y precisión antes que expresión.

## Sesión

- Mismo diseño que el panel interno: el token de la API vive **cifrado** (jose,
  A256GCM) en la cookie HttpOnly `cp_post_session`. **Nunca llega al navegador.**
- Toda llamada a la API sale del servidor de Next por `src/lib/api.ts`
  (`llamarApi` en páginas, `llamarApiAccion` en Server Actions, `fetchAutenticado`
  en Route Handlers). Ese módulo lleva `import "server-only"`: no lo quites.
- `proxy.ts` solo comprueba que la cookie exista. La autorización la hace la API:
  todas las rutas `/applicant/*` son del rol `APPLICANT` y operan sobre **su**
  expediente, sin recibir ids de postulante.
- El login rechaza cuentas sin rol `APPLICANT` (el personal usa el panel) y revoca
  la sesión que la API acababa de abrir.

## Cuenta

- Registro: nombre, apellido, correo y clave (12+, mayúscula, minúscula, dígito)
  → `POST /public/cuentas/registro` → código de 6 dígitos al correo →
  `/public/cuentas/verificar`. Hay campo trampa `website`.
- El correo pendiente de verificar va en la cookie HttpOnly `cp_post_correo`
  (`src/lib/correo-pendiente.ts`). **Nunca pongas el correo en la URL.**
- Un ingreso con cuenta sin verificar (`403 codigo: CORREO_SIN_VERIFICAR`) lleva a
  `/verificar`.

## Postulación

- Sin expediente: formulario de datos (cédula, sala, teléfono venezolano).
- En `DRAFT` (al crearlo **o cuando la revisión lo devuelve**) puede corregir datos y
  documentos y enviarlo a revisión **sin código por correo**: la sesión basta.
- La devolución muestra el motivo (`devolucion.motivo`). La secretaría también
  puede corregir en paralelo desde el panel.
- Fuera de `DRAFT`, todo es de solo lectura.

## Objeciones y descargo

- Toda objeción llega primero al **comité**. El postulante ve la objeción **sin la
  identidad de quien la presentó** — nunca muestres nombre, cédula ni correo del
  objetante, ni digas si fue un visualizador.
- Descargo: título + descripción + documento opcional (PDF/JPEG/PNG), uno por
  objeción, **no se edita**: se confirma antes de enviar.
- Si el comité ya la envió al Consejo (`forwardedAt`), ya no admite descargo.

## Diseño

- Paleta y tipografía del Consejo (`toga-*`, `balanza-*`, `validado-*`; IBM Plex).
  `balanza-300/800` no existen.
- Texto corrido de 16 px como suelo. Códigos y números de expediente con `.codigo`;
  cifras con `.cifra`.
- Movimiento: `--ease-salida` (ease-out fuerte), < 300 ms, `.pulsable` en botones,
  `.aparecer-aviso` solo para avisos que cambian el estado. Respeta
  `prefers-reduced-motion`.
- Toda acción irreversible pide confirmación con su contexto concreto.
- Estados vacíos que explican qué falta y qué hacer.
- Responsive: utilizable en teléfono; nada de scroll horizontal de página.

## Antes de dar algo por terminado

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
