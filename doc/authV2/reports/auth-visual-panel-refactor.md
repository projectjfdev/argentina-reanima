# Auth - Refactor de panel visual

Fecha: 2026-07-06

## Alcance implementado

- Se creo un componente reutilizable para el panel visual de autenticacion.
- El panel se usa en `/auth/login` y `/auth/register`.
- El unico valor variable por props es el texto descriptivo.
- Se mantuvo la estructura visual del panel:
  - mapa de puntos;
  - icono circular;
  - titulo `Argentina Reanima`;
  - gradientes y espaciados;
  - altura base y comportamiento de estiramiento.
- No se modifico la logica de autenticacion.

## Rutas y archivos modificados

- `src/components/Login/AuthVisualPanel.tsx`
- `src/app/(front)/auth/login/page.tsx`
- `src/app/(front)/auth/register/page.tsx`
- `doc/authV2/reports/auth-visual-panel-refactor.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.
