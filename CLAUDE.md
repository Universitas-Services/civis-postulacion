# Portal del postulante — civis-postulacion

Front único y exclusivo del postulante a magistrado del TSJ. Uno de los proyectos
independientes de CIVIS (no es un monorepo):

| Carpeta              | Qué es                                                         | Puerto |
| -------------------- | -------------------------------------------------------------- | ------ |
| `../civis-api`       | Backend NestJS. Única fuente de verdad                         | 3001   |
| `../civis-backoffice`| Panel interno: secretaría, revisión, comité, Consejo, auditoría | 3002   |
| `.` (este)           | Portal del postulante: cuenta, postulación, seguimiento, descargos | 3000 |

## Arrancar

```bash
pnpm install && pnpm dev      # en :3000; la API debe estar arriba
```

Copia `.env.example` a `.env.local` y **cambia `SESSION_SECRET`**: la sesión no
arranca si sigue el valor de ejemplo.

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript 6.0.3 (a propósito:
`typescript-eslint` pide `<6.1.0`) · Tailwind CSS 4 · jose · Zod 4 · Vitest · pnpm 12 · Node 24.

Next 16 cambia APIs y convenciones: lee la guía en `node_modules/next/dist/docs/`
antes de escribir código.

## Antes de tocar nada

Lee la skill `front-postulante-civis` (en `.claude/skills/`). Las skills de diseño
instaladas (`emil-design-eng`, `design-taste-frontend`, `impeccable`) orientan la
interfaz; la identidad visual es la del Consejo (paleta toga/balanza) y manda sobre ellas.

Las skills de diseño de terceros no se versionan. Para reinstalarlas:

```bash
npx skills add https://github.com/emilkowalski/skills --skill emil-design-eng -a claude-code -y
npx skills add https://github.com/Leonxlnx/taste-skill -a claude-code -y
npx impeccable install --project --providers=claude --no-hooks -y
```

## Comprobación

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm build
```
