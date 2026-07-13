# Reporte fase 15 - authOptions

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 8 del plan `doc/test/plan/auth-testing-execution-plan.md`: cubrir la logica propia dentro de `authOptions`, sin testear internals de NextAuth ni OAuth real.

No se avanzo sobre la Fase 9 de revision final.

## Archivos creados

- `src/test/auth/authOptions.test.ts`
- `doc/test/report/fase-15-auth-options.md`

## Archivos modificados

- Ninguno de codigo productivo.

## Tests implementados

### Credentials `authorize`

- Credenciales faltantes lanzan error.
- Usuario inexistente lanza error.
- Usuario sin password local lanza error.
- Usuario con email no verificado lanza error.
- Password incorrecta lanza error.
- Credenciales validas retornan usuario autenticado con `id`, `name`, `email`, `role` y `emailVerified`.

### Callback `signIn`

- Providers no Google retornan `true`.
- Google sin email retorna `false`.
- Google con usuario existente:
  - normaliza email.
  - actualiza `emailVerified` si Google lo confirma y estaba pendiente.
  - vincula certificados.
  - copia datos de DB al usuario de NextAuth.
- Google con usuario nuevo:
  - crea usuario con password `null`.
  - define rol `USER`.
  - setea `emailVerified` si Google confirma email.
  - vincula certificados dentro de la transaccion.
  - copia datos de DB al usuario de NextAuth.

### Callback `jwt`

- Copia datos del usuario al token.
- Refresca `id`, `role` y `emailVerified` desde DB cuando el token tiene email.
- Conserva valores existentes si no encuentra usuario en DB.

### Callback `session`

- Copia `id`, `role` y `emailVerified` del token a `session.user`.

## Cobertura alcanzada en esta fase

Quedo cubierta la logica propia de autenticacion concentrada en:

- Provider credentials.
- Callback `signIn`.
- Callback `jwt`.
- Callback `session`.

La fase no cubre NextAuth internamente, cookies, JWT real firmado, OAuth real con Google ni requests al route handler `[...nextauth]`.

## Mocks utilizados

Se usaron mocks locales en `authOptions.test.ts`:

- `@/libs/db`
  - `prisma.user.findUnique`
  - `prisma.user.update`
  - `prisma.$transaction`
- Transaccion mockeada:
  - `tx.user.create`
- `bcrypt`
  - `compare`
- `@/libs/certificates`
  - `normalizeCertificateEmail`
  - `linkCertificatesToUserByEmail`

No se mockearon los providers de NextAuth. Se uso el objeto real que construyen `CredentialsProvider` y `GoogleProvider`, accediendo al `authorize` personalizado desde `provider.options.authorize`.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 13 passed.
- Tests: 62 passed.
- Estado: verde.

## Observaciones y mejoras detectadas

- No fue necesario modificar codigo productivo.
- `CredentialsProvider` conserva el callback configurado en `provider.options.authorize`; `provider.authorize` es el default del paquete. El test quedo ajustado a ese shape real.
- `authOptions` concentra varias responsabilidades: credenciales, Google sign-in, refresh de token desde DB y armado de sesion. Los tests son viables, pero una mejora futura seria extraer funciones auxiliares para `authorize`, `signIn`, `jwt` y `session` si el archivo sigue creciendo.
- Los mensajes con acentos se validaron contra el texto real que entrega el runtime, aunque PowerShell muestre algunos archivos con mojibake al imprimirlos.
- No se requieren dependencias nuevas para esta fase.
