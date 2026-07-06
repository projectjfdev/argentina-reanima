# Navbar - Profile menu

Fecha: 2026-07-06

## Alcance implementado

- Se agrego render condicional por sesion en el navbar.
- Si hay usuario logueado:
  - se muestra un avatar circular con la primera letra del nombre o email;
  - al hacer click se despliega un submenu;
  - el submenu muestra `Mi Perfil` y `Cerrar sesion`.
- Si no hay usuario logueado:
  - se muestra el boton `Iniciar sesion`.
- No se agrego logica a `Mi Perfil`.
- No se agrego logica a `Cerrar sesion`.
- Se mantuvo el cambio acotado al navbar.

## Rutas y archivos modificados

- `src/components/Navbar/navbar.tsx`
- `doc/authV2/reports/navbar-profile-menu.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.
