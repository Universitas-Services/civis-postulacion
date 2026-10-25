---
name: CIVIS — Portal del postulante
description: Credenciales que inspiran confianza.
colors:
  vino-institucional: "#7A1E2D"
  vino-hover: "#5C1622"
  vino-suave: "#FDF2F4"
  azul-profundo: "#0F2A44"
  azul-medio: "#1A3A55"
  gris-principal: "#64748B"
  gris-texto: "#334155"
  gris-claro: "#CBD5E1"
  borde: "#E2E8F0"
  fondo: "#F8FAFC"
  lienzo: "#FFFFFF"
  negro: "#111827"
  validado: "#047857"
  validado-fondo: "#ECFDF5"
typography:
  titulo:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.25
  lema:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.2
  cuerpo:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  etiqueta:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  codigo:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  control: "6px"
  tarjeta: "8px"
  pastilla: "9999px"
spacing:
  campo: "16px"
  seccion: "24px"
  pagina-movil: "16px"
  pagina-escritorio: "24px"
motion:
  ease-salida: "cubic-bezier(0.23, 1, 0.32, 1)"
  pulsar: "120ms"
  aviso: "220ms"
---

# DESIGN — Portal del postulante CIVIS

## Overview

Herramienta institucional (modo *Operate*) para aspirantes a magistrado del TSJ. La identidad sale de la guía de marca CIVIS: azul profundo y vino institucional, Merriweather como voz de documento, IBM Plex para la interfaz y la red de nodos como signo de trazabilidad. La ambición se expresa en precisión y calma, no en efectos: el postulante debe sentir rigor y confianza en cada paso.

## Colors

- **Azul profundo** `#0F2A44`: panel de marca, encabezado del área con sesión, etapas completadas.
- **Vino institucional** `#7A1E2D`: acción principal, enlaces, acento de la red de nodos, avisos que piden algo al postulante. Nunca como fondo de grandes superficies.
- **Grises** `#64748B` / `#CBD5E1`: texto secundario y bordes. Sobre azul, el texto secundario se tiñe de los grises claros de la paleta, nunca gris neutro.
- **Validado** `#047857` sobre `#ECFDF5`: confirmaciones (correo confirmado, descargo presentado).
- Prohibido: colores partidistas, neón, degradados en texto.

## Typography

- Merriweather (400/700): títulos de página (`h1`, `h2`) y el lema. Nunca para controles.
- IBM Plex Sans: interfaz y texto corrido; 16 px es el suelo del texto que se lee.
- IBM Plex Mono (`.codigo`): números de expediente, códigos de seguimiento y el código de 6 dígitos.
- Cifras comparables con `.cifra` (tabular-nums).

## Elevation

Plano: bordes de 1 px `#E2E8F0` sobre lienzo blanco. Sin sombras decorativas; la profundidad la da el contraste azul/blanco del panel de marca.

## Components

- **Botón principal**: vino, texto blanco, `.pulsable` (escala 0.97 al pulsar, 120 ms ease-out). Uno por pantalla.
- **Botón secundario**: blanco con borde gris, mismo `.pulsable`.
- **Campo**: etiqueta encima (14 px, 500), ayuda o error debajo; error con `.campo-con-error` y `role="alert"`.
- **Confirmación en línea**: bloque vino suave que nombra la acción concreta («¿Enviar el expediente EXP-0012 a revisión?»), nunca un modal genérico.
- **Etapas del proceso**: cuatro pasos; hecho = azul relleno con check, actual = anillo vino, pendiente = gris.
- **Pastillas de estado**: vino suave (espera algo de usted), verde (hecho), gris (cerrado).
- **Red de nodos** (`components/marca/red-nodos.tsx`): SVG con semilla fija, solo en el panel de marca.

## Do's and Don'ts

- Do: decir siempre en qué etapa está el postulante y qué le toca hacer.
- Do: confirmar lo irreversible con su contexto concreto.
- Do: usar los logos oficiales de `public/brand/` (color sobre claro, blanco sobre azul; sin lema en tamaños pequeños).
- Don't: mazo de juez, balanza barroca, colores partidistas, estética de campaña o neón.
- Don't: mostrar quién presentó una objeción.
- Don't: animar acciones frecuentes; solo el aviso que cambia de estado aparece con movimiento, y se respeta `prefers-reduced-motion`.
