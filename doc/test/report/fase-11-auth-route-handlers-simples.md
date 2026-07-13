# Reporte fase 11 - Auth route handlers simples

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 4 del plan `doc/test/plan/auth-testing-execution-plan.md`: validar route handlers simples que delegan en helpers ya cubiertos.

No se avanzo sobre route handlers con email y persistencia, componentes cliente, pagina de login ni `authOptions`.

## Archivos creados

- `src/test/auth/reset-password-route.test.ts`
- `src/test/auth/verify-email-route.test.ts`
- `doc/test/report/fase-11-auth-route-handlers-simples.md`

## Archivos modificados

- Ninguno de codigo productivo.

## Tests implementados

### `src/test/auth/reset-password-route.test.ts`

- Password corta retorna `400` y `success: false`.
- Resultado no exitoso de `resetPasswordWithToken` retorna `400` y `success: false`.
- Resultado exitoso de `resetPasswordWithToken` retorna `200` y `success: true`.
- Valida que el handler delegue `token` y `password` al helper cuando la password cumple longitud minima.

### `src/test/auth/verify-email-route.test.ts`

- Resultado `success` retorna `200` y `success: true`.
- Resultado `already-verified` retorna `200` y `success: true`.
- Resultado `invalid` retorna `400` y `success: false`.
- Resultado `expired` retorna `410` y `success: false`.
- Valida que el token de querystring sea delegado a `verifyEmailToken`.

## Cobertura alcanzada en esta fase

Quedaron cubiertos los contratos HTTP principales de:

- `POST /api/auth/reset-password`
- `GET /api/auth/verify-email`

La cobertura se limita a status code, cuerpo JSON y delegacion a helpers. No prueba internals de Next.js, Prisma, bcrypt, email real ni logica ya cubierta por los helpers.

## Mocks utilizados

Se usaron mocks locales por archivo:

- `@/libs/auth/passwordReset`
  - `resetPasswordWithToken`
- `@/libs/auth/emailVerification`
  - `verifyEmailToken`

Los tests construyen requests simulados:

- `Request` para `POST /api/auth/reset-password`.
- `NextRequest` para `GET /api/auth/verify-email`.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 8 passed.
- Tests: 30 passed.
- Estado: verde.

## Observaciones y mejoras detectadas

- No fue necesario modificar codigo productivo.
- El test de password corta valido el mensaje real con `contraseña`, que es el contrato emitido por el handler.
- Los handlers son pequenos y se testean bien con mocks directos de helpers; no hace falta extraer utilidades compartidas todavia.
- En fases posteriores, si se repite mucho armado de `Request` o parseo de JSON, podria crearse un helper de test para route handlers.
- No se requieren dependencias nuevas para esta fase.
