# Reporte fase 10 - Auth helpers con Prisma mockeado

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 3 del plan `doc/test/plan/auth-testing-execution-plan.md`: cubrir helpers de autenticacion con Prisma mockeado, sin base de datos real ni servicios externos.

No se avanzo sobre route handlers, componentes cliente, pagina de login ni `authOptions`.

## Archivos creados

- `src/test/auth/verifyEmailToken.test.ts`
- `src/test/auth/resetPasswordWithToken.test.ts`
- `doc/test/report/fase-10-auth-helpers-prisma-mock.md`

## Archivos modificados

- Ninguno.

## Tests implementados

### `src/test/auth/verifyEmailToken.test.ts`

- Token vacio retorna `invalid`.
- Token inexistente retorna `invalid`.
- Usuario ya verificado retorna `already-verified`.
- Token usado retorna `invalid`.
- Token expirado retorna `expired`.
- Token valido actualiza usuario, marca token como usado y retorna `success`.

### `src/test/auth/resetPasswordWithToken.test.ts`

- Token vacio retorna `invalid`.
- Token inexistente retorna `invalid`.
- Token usado retorna `invalid`.
- Token expirado retorna `expired`.
- Token valido hashea password, consume token, actualiza usuario e invalida otros tokens activos del usuario.
- Si el usuario ya tenia `emailVerified`, conserva esa fecha al actualizar la password.
- Si `updateMany.count !== 1` dentro de la transaccion, retorna `invalid` y no actualiza el usuario.

## Cobertura alcanzada en esta fase

Quedaron cubiertos los flujos principales y de error de:

- `verifyEmailToken`
- `resetPasswordWithToken`

La cobertura valida la logica propia de negocio y las llamadas esperadas a Prisma/bcrypt mediante mocks. No usa DB real, no prueba Prisma internamente y no cubre route handlers.

## Mocks utilizados

### Prisma

Se mockeo `@/libs/db` localmente por archivo:

- `prisma.emailVerificationToken.findUnique`
- `prisma.emailVerificationToken.update`
- `prisma.passwordResetToken.findUnique`
- `prisma.user.update`
- `prisma.$transaction`

Para `resetPasswordWithToken`, `prisma.$transaction` ejecuta el callback con un `tx` mockeado que contiene:

- `tx.passwordResetToken.updateMany`
- `tx.user.update`

### bcrypt

Se mockeo `bcrypt.hash` en `resetPasswordWithToken.test.ts` para validar que se invoque con la password recibida y costo `10`, sin ejecutar hashing real.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 6 passed.
- Tests: 23 passed.
- Estado: verde.

## Observaciones y mejoras detectadas

- Los tests pudieron implementarse sin refactor productivo.
- La duplicacion de mocks de Prisma todavia es manejable. No se creo `src/test/auth/prismaMock.ts` porque en esta fase no aportaba suficiente valor frente al costo de abstraccion.
- Si en las siguientes fases los route handlers reutilizan muchos mocks similares, puede convenir crear helpers compartidos de test para Prisma y transacciones.
- `verifyEmailToken` construye las operaciones de `prisma.user.update` y `prisma.emailVerificationToken.update` antes de llamar a `prisma.$transaction([...])`. Esto es consistente con el uso de Prisma Client, pero en tests obliga a validar llamadas individuales ademas de la transaccion.
- `resetPasswordWithToken` mantiene varias responsabilidades en un solo helper: validacion de token, hashing, consumo atomico, actualizacion de usuario e invalidacion de tokens previos. Esta cohesion es aceptable por ahora; si crece, podria separarse la construccion de operaciones o la validacion previa para simplificar tests.
- No se requieren dependencias nuevas para esta fase.
