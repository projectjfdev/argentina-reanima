# Auth V2 - Navbar actualiza sesion post-login

Fecha: 2026-07-07

## Problema

Despues de iniciar sesion correctamente con credenciales, la app redirigia a `/`, pero el navbar seguia mostrando el boton `Iniciar sesion`. El menu de perfil aparecia recien despues de refrescar manualmente con F5.

## Causa

El navbar no usaba `useSession`. Consultaba `getSession()` una sola vez al montarse y guardaba el resultado en estado local. Como el layout publico mantiene el navbar montado al navegar desde `/auth/login` hacia `/`, ese estado quedaba con la sesion anterior (`null`) y no se actualizaba despues del login.

## Alcance implementado

- Se agrego `SessionProvider` de NextAuth en el root layout.
- Se cambio el navbar para leer la sesion con `useSession`.
- Se usa `getSession()` despues de login exitoso para leer el rol confirmado antes de redirigir.
- Se usa `update()` de NextAuth despues de login exitoso para refrescar la sesion del `SessionProvider`.
- Se mantiene `router.refresh()` antes de redirigir por rol despues de `signIn`.
- No se cambio la UI del navbar.
- No se modifico Google login.
- No se modificaron roles ni permisos.

## Rutas y archivos modificados

- `src/app/layout.tsx`
- `src/app/(front)/auth/login/page.tsx`
- `src/components/Navbar/navbar.tsx`
- `src/components/Auth/NextAuthProvider.tsx`
- `doc/authV2/reports/navbar-session-refresh.md`

## Comportamiento esperado

1. El usuario inicia sesion desde `/auth/login`.
2. `signIn("credentials", { redirect: false })` completa correctamente.
3. Se ejecuta `update()` de NextAuth para refrescar la sesion del provider.
4. Se consulta la sesion actual con `getSession()` para obtener el rol confirmado.
5. Se ejecuta `router.refresh()`.
6. Se redirige segun rol:
   - `ADMIN` a `/dashboard`;
   - `USER` a `/`.
7. El navbar muestra el menu de perfil sin F5.

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.

## Como probar

1. Ejecutar `npm run dev`.
2. Entrar a `/auth/login`.
3. Iniciar sesion con un usuario `USER`.
4. Verificar que redirige a `/`.
5. Verificar que el navbar muestra el avatar/menu de perfil sin refrescar.
6. Repetir con un usuario `ADMIN` y verificar redireccion a `/dashboard`.
