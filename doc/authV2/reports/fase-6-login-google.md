# Auth V2 - Reporte Fase 6

Fecha: 2026-07-06

## Alcance implementado

- Se agrego `GoogleProvider` a NextAuth v4.
- Se mantuvo estrategia JWT.
- No se instalo ni uso Prisma Adapter.
- Se implemento Google login mediante callbacks manuales.
- En `signIn` para Google:
  - se normaliza y valida el email;
  - se busca usuario por email;
  - si existe, se permite login;
  - si existe y Google informa email verificado, se marca `emailVerified` si estaba pendiente;
  - si no existe, se crea usuario con `role: USER`;
  - si Google informa email verificado, se guarda `emailVerified`;
  - nunca se asigna `ADMIN` desde Google.
- En `jwt`:
  - se guardan `id`, `role` y `emailVerified`;
  - se refrescan esos datos desde base de datos usando el email del token.
- En `session`:
  - se exponen `session.user.id`, `session.user.role` y `session.user.emailVerified`.
- Se agrego boton "Continuar con Google" en `/auth/login`.
- La redireccion post-login queda por rol:
  - `ADMIN` a `/dashboard`;
  - `USER` a `/`.

## Rutas y archivos modificados

- `src/libs/authOptions.ts`
- `src/app/(front)/auth/login/page.tsx`
- `doc/authV2/reports/fase-6-login-google.md`

## Variables requeridas

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Callbacks a configurar en Google Cloud Console:

- `http://localhost:3000/api/auth/callback/google`
- `https://DOMINIO-PRODUCCION/api/auth/callback/google`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.

## Pendiente

- No se inicio Fase 7.
- Falta QA manual del flujo real de Google con credenciales OAuth configuradas en el entorno.
