# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Aspirantes a magistrado del Tribunal Supremo de Justicia de Venezuela: abogados con 15 años o más de carrera, muchos mayores de 45, que se postulan una sola vez. Usan sobre todo computadora y, a veces, el teléfono. Necesitan claridad y confianza en cada paso, no velocidad.

## Product Purpose

Portal donde el aspirante crea su cuenta (correo verificado), registra su postulación, carga los recaudos que exige la ley, la envía a revisión documental, corrige lo que la revisión le devuelva y responde con un descargo las objeciones que reciba. Éxito: un expediente completo y enviado sin ayuda, y un postulante que siempre sabe en qué etapa está y qué le toca hacer.

## Positioning

Es la única puerta del aspirante al proceso de verificación del Consejo Independiente de Verificación de Credenciales (CIVIS): lo que ve aquí es lo mismo que verifica el equipo interno, sin intermediarios.

## Operating Context

- Proceso: registro → carga de documentos → revisión documental (puede devolver con motivo) → evaluación por el Consejo → resultado.
- Las objeciones llegan primero a un comité; el postulante presenta su descargo (título, descripción, documento opcional) antes de que el comité la envíe al Consejo. Nunca ve quién lo objetó.
- La secretaría puede corregir el expediente en paralelo desde el panel interno.
- Proyectos hermanos: `civis-api` (fuente de verdad) y `civis-backoffice` (panel interno, misma identidad).

## Capabilities and Constraints

- Next.js 16, sesión cifrada en cookie HttpOnly; el token nunca llega al navegador.
- Documentos: PDF, JPEG o PNG; se comprueba el contenido real y pasan por antivirus.
- El correo y los códigos nunca viajan en la URL.
- Recuperación de contraseña con código de 6 dígitos.

## Brand Commitments

Guía de marca CIVIS obligatoria (`C:\Users\Frank\Downloads\Nueva carpeta\CIVIS_guia_de_marca.png`): paleta vino `#7A1E2D`, azul profundo `#0F2A44`, gris principal `#64748B`, gris claro `#CBD5E1`, blanco `#F8FAFC`, negro `#111827`; Merriweather para títulos, IBM Plex Sans para interfaz, IBM Plex Mono para códigos; patrón visual de red de nodos; lema «Credenciales que inspiran confianza». Ideas clave: transparencia, rigor, ciudadanía, evaluación, trazabilidad, confianza. Prohibido: mazo de juez, balanza barroca, colores partidistas, campaña electoral, estética neón. Logos oficiales en `public/brand/` (horizontal color, blanco, azul, vinotinto; icono; completo).

## Evidence on Hand

Logos y guía de marca oficiales. No hay testimonios, cifras ni casos reales: no se inventan.

## Product Principles

1. El postulante siempre sabe en qué etapa está y qué le toca hacer.
2. Nada irreversible sin confirmación con su contexto concreto.
3. La identidad de quien objeta es reservada, siempre.
4. El lenguaje es institucional y claro, de usted, sin jerga interna.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste, navegación por teclado, lectores de pantalla, texto base de 16 px y objetivos táctiles amplios; usuarios mayores de 45 años.
