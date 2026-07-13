# Reporte fase 12 - Auth route handlers con email y persistencia

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 5 del plan `doc/test/plan/auth-testing-execution-plan.md`: cubrir route handlers de autenticacion con dependencias de persistencia y email mediante mocks.

No se avanzo sobre componentes cliente, pagina de login ni `authOptions`.

## Archivos creados

- `src/test/auth/forgot-password-route.test.ts`
- `src/test/auth/register-route.test.ts`
- `doc/test/report/fase-12-auth-route-handlers-email-db.md`

## Archivos modificados

- Ninguno de codigo productivo.

## Tests implementados

### `src/test/auth/forgot-password-route.test.ts`

- Email invalido retorna `400` y `success: false`.
- Email inexistente retorna respuesta generica exitosa.
- Usuario existente:
  - normaliza email.
  - invalida tokens previos activos.
  - crea nuevo token de recuperacion.
  - envia email de recuperacion.
  - retorna respuesta generica exitosa.
- Fallo al enviar email de recuperacion:
  - registra el error.
  - retorna respuesta generica exitosa.
  - no filtra informacion sensible al cliente.

### `src/test/auth/register-route.test.ts`

- Nombre faltante retorna `400`.
- Email invalido retorna `400`.
- Password corta retorna `400`.
- Email existente retorna `409`.
- Registro exitoso:
  - normaliza email.
  - hashea password.
  - crea usuario.
  - crea token de verificacion.
  - vincula certificados por email.
  - envia email de confirmacion.
  - retorna `201` con `success: true`.
- Fallo al enviar email de confirmacion:
  - elimina el usuario creado como rollback.
  - retorna `500` por el catch general actual del handler.

## Cobertura alcanzada en esta fase

Quedaron cubiertos los contratos principales de:

- `POST /api/auth/forgot-password`
- `POST /api/auth/register`

La cobertura valida status code, JSON response y efectos esperados sobre mocks de Prisma, bcrypt, email y certificados. No usa DB real, Resend real ni red externa.

## Mocks utilizados

### `forgot-password`

- `@/libs/db`
  - `prisma.user.findUnique`
  - `prisma.passwordResetToken.updateMany`
  - `prisma.passwordResetToken.create`
  - `prisma.$transaction`
- `@/libs/email/resend`
  - `sendPasswordResetEmail`

Se usan helpers reales de token para validar que el token enviado por email corresponde al hash persistido.

### `register`

- `@/libs/db`
  - `prisma.user.findUnique`
  - `prisma.user.delete`
  - `prisma.$transaction`
- Transaccion mockeada:
  - `tx.user.create`
  - `tx.emailVerificationToken.create`
- `bcrypt`
  - `hash`
- `@/libs/email/resend`
  - `sendConfirmEmail`
- `@/libs/certificates`
  - `normalizeCertificateEmail`
  - `linkCertificatesToUserByEmail`

Se usan helpers reales de token para validar que el token enviado por email corresponde al hash persistido.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 10 passed.
- Tests: 40 passed.
- Estado: verde.

## Observaciones y mejoras detectadas

- No fue necesario modificar codigo productivo.
- `forgot-password` mantiene una politica adecuada de no enumerar usuarios: tanto usuario inexistente como fallo de email devuelven respuesta generica exitosa.
- `register` hace rollback manual eliminando el usuario si falla el email de confirmacion y luego devuelve `500`. Es el comportamiento actual y quedo cubierto.
- Los mocks de Prisma empiezan a repetirse entre fases. Todavia son legibles por archivo, pero si las proximas fases agregan mas handlers con persistencia convendria extraer utilidades de test para requests JSON y mocks de Prisma.
- Los textos de algunos mensajes en archivos fuente se ven con mojibake en la salida de consola de PowerShell, pero el runtime expone correctamente mensajes como `contraseña` en los tests.
- No se requieren dependencias nuevas para esta fase.
