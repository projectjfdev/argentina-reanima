# Auth - Navegacion entre login y registro

Fecha: 2026-07-06

## Alcance implementado

- Se agrego enlace desde `/auth/login` hacia `/auth/register`.
- Se agrego enlace desde `/auth/register` hacia `/auth/login`.
- Los textos quedan debajo del boton principal de cada formulario.
- Los enlaces usan `text-primary`, peso semibold y hover underline para destacarse sin romper la jerarquia visual.
- No se modificaron otros flujos de autenticacion.

## Rutas y archivos modificados

- `src/app/(front)/auth/login/page.tsx`
- `src/app/(front)/auth/register/page.tsx`
- `doc/authV2/reports/auth-cross-navigation.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.
