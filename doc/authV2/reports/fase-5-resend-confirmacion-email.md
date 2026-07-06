# Auth V2 - Reporte Fase 5

Fecha: 2026-07-06

## Alcance implementado

- Se instalo la dependencia `resend`.
- Se agrego cliente server-only para Resend.
- Se agrego template HTML/texto plano para email de confirmacion.
- El registro ahora envia email de confirmacion con link a `/auth/verify-email?token=...`.
- El token original solo se envia por email; en base de datos se conserva el hash SHA-256.
- Si falla el envio del email, se revierte el usuario creado para permitir reintentar el registro.
- Se agrego endpoint `GET /api/auth/verify-email?token=...`.
- Se agrego pagina `/auth/verify-email?token=...` para mostrar estado al usuario.
- La verificacion marca:
  - `user.emailVerified = now`;
  - `EmailVerificationToken.usedAt = now`.
- Se manejan estados:
  - confirmacion exitosa;
  - email ya confirmado;
  - token invalido;
  - token vencido.

## Rutas y archivos modificados

- `package.json`
- `package-lock.json`
- `.env.example`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/(front)/auth/verify-email/page.tsx`
- `src/libs/auth/emailVerification.ts`
- `src/libs/email/resend.ts`
- `src/libs/email/templates/confirmEmail.ts`
- `doc/authV2/reports/fase-5-resend-confirmacion-email.md`

## Variables requeridas

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL="noreply@argentinareanima.org.ar"`
- `APP_URL`

El dominio/remitente de Resend debe estar verificado antes de usarlo en produccion.

## Verificacion

- `npm install resend`: OK.
- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.

## Observaciones

- `npm install resend` reporto vulnerabilidades existentes en auditoria npm: 7 moderadas y 8 altas. No se ejecuto `npm audit fix` porque queda fuera del alcance de Fase 5 y puede modificar dependencias de forma amplia.
- No se implemento reenvio de confirmacion; el plan lo marcaba como opcional posterior.
- No se inicio Fase 6.

