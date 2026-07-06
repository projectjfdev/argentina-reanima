# Auth Login - Correccion de altura de card

Fecha: 2026-07-06

## Alcance implementado

- Se corrigio el desborde visual de `/auth/login` cuando aparecen mensajes de validacion.
- La card ahora alinea sus columnas con `items-stretch`.
- La columna izquierda dejo de usar altura fija y paso a usar `min-h-[600px] self-stretch`.
- El panel izquierdo conserva la altura base, pero ahora acompana el crecimiento del formulario derecho.
- No se redisenaron estilos ni se modificaron otros flujos.

## Rutas y archivos modificados

- `src/app/(front)/auth/login/page.tsx`
- `doc/authV2/reports/login-card-height-fix.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.
