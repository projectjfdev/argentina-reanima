# Navbar - Cerrar sesion

Fecha: 2026-07-06

## Alcance implementado

- Se conecto la accion `Cerrar sesion` del menu de perfil con `signOut` de NextAuth v4.
- Al cerrar sesion, NextAuth redirige al usuario a `/`.
- El menu se cierra antes de ejecutar el cierre de sesion.
- No se modifico el diseno del menu.
- No se implemento logica para `Mi Perfil`.

## Rutas y archivos modificados

- `src/components/Navbar/navbar.tsx`
- `doc/authV2/reports/navbar-profile-signout.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.
