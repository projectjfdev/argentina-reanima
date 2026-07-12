# Reporte fase 7 - Planificacion de tests de autenticacion

Fecha: 2026-07-12

## Objetivo ejecutado

Se ejecuto la fase 7 del plan `doc/test/plan/plan.md`: definir una estrategia especifica para testear autenticacion una vez preparado el entorno base de Vitest, React Testing Library y jsdom.

Esta fase no agrega tests nuevos. El resultado esperado es un mapa claro de alcance, orden de implementacion, mocks necesarios y limites entre tests unitarios, integracion liviana y E2E futuro.

## Archivos revisados

Se revisaron los puntos principales del flujo actual de autenticacion:

- `src/libs/authOptions.ts`
- `src/libs/auth/requireAdminSession.ts`
- `src/libs/auth/passwordReset.ts`
- `src/libs/auth/emailVerification.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/(front)/auth/login/page.tsx`

Tambien se tomo como base el relevamiento previo de:

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/proxy.ts`
- `src/types/next-auth.d.ts`

## Mapa de testing recomendado

### Vitest - unitarios puros

Prioridad alta porque no requieren red, DB ni NextAuth real.

- `src/libs/auth/passwordReset.ts`
  - `createPasswordResetToken`
  - `hashPasswordResetToken`
- `src/libs/auth/emailVerification.ts`
  - `createVerificationToken`
  - `hashVerificationToken`
- `src/libs/certificates/normalizeCertificateEmail.ts`
  - normalizacion de email usada por auth.
- `src/libs/certificates/validateCertificatePayload.ts`
  - no es auth directa, pero cubre datos asociados a usuarios/certificados.

Notas:

- Los tests de hashing deben validar determinismo y formato, no valores aleatorios completos.
- Para tokens aleatorios conviene verificar longitud/formato y que dos llamadas no devuelvan el mismo valor en un caso simple, sin convertirlo en prueba criptografica.

### Vitest - unitarios con mocks controlados

Prioridad media-alta.

- `src/libs/auth/requireAdminSession.ts`
  - mock de `next-auth` para `getServerSession`.
  - casos:
    - sin sesion retorna `401`.
    - usuario no admin retorna `403`.
    - admin retorna `null`.
- `resetPasswordWithToken`
  - mock de `@/libs/db`.
  - mock de `bcrypt`.
  - casos:
    - token vacio.
    - token inexistente.
    - token usado.
    - token expirado.
    - exito actualiza password, marca token usado e invalida otros tokens.
    - carrera donde `updateMany.count !== 1`.
- `verifyEmailToken`
  - mock de `@/libs/db`.
  - casos:
    - token vacio.
    - token inexistente.
    - usuario ya verificado.
    - token usado.
    - token expirado.
    - exito actualiza usuario y token.

Notas:

- Estos tests deberian correr en entorno `node` si mas adelante se separan entornos. Con la configuracion actual `jsdom` tambien pueden correr, pero no necesitan DOM.
- Hay que mockear `@/libs/db` antes de importar el modulo bajo prueba para evitar instanciar Prisma real.

### Vitest - integracion liviana de route handlers

Prioridad media.

- `src/app/api/auth/register/route.ts`
  - mocks:
    - `@/libs/db`
    - `bcrypt`
    - `@/libs/email/resend`
    - helpers de certificados si hace falta aislar vinculacion.
  - casos:
    - nombre faltante retorna `400`.
    - email invalido retorna `400`.
    - password corta retorna `400`.
    - email existente retorna `409`.
    - registro exitoso retorna `201`.
    - fallo de email hace rollback eliminando usuario creado.
- `src/app/api/auth/forgot-password/route.ts`
  - mocks:
    - Prisma.
    - Resend.
  - casos:
    - email invalido retorna `400`.
    - email inexistente retorna mensaje generico exitoso.
    - usuario existente invalida tokens previos, crea token y dispara email.
    - fallo de email no filtra informacion sensible.
- `src/app/api/auth/reset-password/route.ts`
  - mock de `resetPasswordWithToken`.
  - casos:
    - password corta retorna `400`.
    - resultado no exitoso retorna `400`.
    - exito retorna `success: true`.
- `src/app/api/auth/verify-email/route.ts`
  - mock de `verifyEmailToken`.
  - casos:
    - `success` retorna `200`.
    - `already-verified` retorna `200`.
    - `invalid` retorna `400`.
    - `expired` retorna `410`.

Notas:

- Estos tests deben construir `Request` o `NextRequest` simulados.
- No deben usar DB real ni servicios de email reales.
- Conviene evitar probar internals de `NextResponse`; alcanza con status y JSON.

### Vitest + React Testing Library - componentes cliente

Prioridad media, despues de helpers y route handlers.

- `src/components/Buttons/SignOutMenuButton.tsx`
  - mock de `next-auth/react`.
  - validar que click llama `signOut({ callbackUrl: "/" })`.
- `src/app/(front)/auth/login/page.tsx`
  - mocks:
    - `next-auth/react`: `signIn`, `getSession`, `useSession`.
    - `next/navigation`: `useRouter`.
    - posiblemente `framer-motion` si causa ruido de animaciones.
  - casos:
    - muestra campos de email/password.
    - valida requeridos con `react-hook-form`.
    - submit llama `signIn("credentials", { redirect: false, ... })`.
    - error de credenciales se muestra en pantalla.
    - exito llama `update`, `getSession` y redirige segun rol.
    - boton Google llama `signIn("google", { callbackUrl: "/auth/login" })`.

Notas:

- La pagina de login tiene bastante acoplamiento: NextAuth, router, session, motion y `react-hook-form`.
- Antes de testearla, seria razonable evaluar si conviene extraer `SignInCard` como componente exportable para reducir friccion.

### Vitest - authOptions

Prioridad media-baja, por acoplamiento.

Areas posibles:

- Provider credentials `authorize`.
- Callback `signIn` para Google.
- Callback `jwt`.
- Callback `session`.

Mocks:

- `@/libs/db`
- `bcrypt`
- `@/libs/certificates`
- variables de entorno de NextAuth/Google si el provider las requiere.

Criterio recomendado:

- Testear solo logica propia.
- No probar que NextAuth o GoogleProvider funcionan internamente.
- Si la estructura resulta fragil, conviene extraer funciones propias desde `authOptions.ts` antes de testear callbacks complejos.

## Que dejar para E2E futuro

Deberia quedar fuera de Vitest inicial:

- Login real de usuario en navegador.
- Logout real con cookies/session.
- Acceso real a rutas protegidas.
- Flujo completo de registro con email real.
- Verificacion real desde link recibido por email.
- Recuperacion completa de password desde email real.
- OAuth real con Google.

Para esos casos convendria evaluar Playwright en una etapa posterior.

## Mocks esperados por modulo

- `@/libs/db`
  - Mock central para Prisma.
  - Debe cubrir `user`, `passwordResetToken`, `emailVerificationToken`, `$transaction`.
- `bcrypt`
  - `hash`
  - `compare`
- `next-auth`
  - `getServerSession`
  - eventualmente `NextAuth` si se testea el route handler `[...nextauth]`, aunque no es prioridad.
- `next-auth/react`
  - `signIn`
  - `signOut`
  - `getSession`
  - `useSession`
  - `SessionProvider` si se renderizan providers.
- `next/navigation`
  - `useRouter`
  - `useSearchParams`
  - `redirect`
  - `notFound`
- `@/libs/email/resend`
  - `sendConfirmEmail`
  - `sendPasswordResetEmail`
- `@/libs/certificates`
  - `normalizeCertificateEmail` puede usarse real por ser puro.
  - `linkCertificatesToUserByEmail` puede mockearse si se quiere aislar auth de certificados.
- APIs browser
  - `window.alert` para login si se prueba rama de error inesperado.
  - No agregar mocks globales hasta que un test concreto los necesite.

## Orden recomendado de implementacion

1. Helpers puros:
   - `hashPasswordResetToken`
   - `createPasswordResetToken`
   - `hashVerificationToken`
   - `createVerificationToken`
   - normalizacion de email.

2. `requireAdminSession`:
   - cubre autorizacion admin con bajo costo y mock simple de `getServerSession`.

3. Helpers con Prisma mockeado:
   - `verifyEmailToken`.
   - `resetPasswordWithToken`.

4. Route handlers simples:
   - `reset-password`.
   - `verify-email`.

5. Route handlers con mas dependencias:
   - `forgot-password`.
   - `register`.

6. Componentes chicos:
   - `SignOutMenuButton`.

7. UI de login:
   - despues de tener mocks de `next-auth/react` y `next/navigation` bien establecidos.

8. `authOptions`:
   - solo ramas propias, y preferentemente despues de decidir si se extraen helpers para callbacks.

9. E2E futuro:
   - Playwright para flujos reales de navegador y sesion.

## Ubicacion sugerida de tests

Mantener cerca de la base ya creada:

- `src/test/auth/passwordReset.test.ts`
- `src/test/auth/emailVerification.test.ts`
- `src/test/auth/requireAdminSession.test.ts`
- `src/test/auth/register-route.test.ts`
- `src/test/auth/forgot-password-route.test.ts`
- `src/test/auth/reset-password-route.test.ts`
- `src/test/auth/verify-email-route.test.ts`
- `src/test/auth/login-page.test.tsx`
- `src/test/auth/sign-out-menu-button.test.tsx`

Alternativa futura:

- mover a `tests/auth/*.test.ts` si se prefiere mantener tests fuera de `src`.

La configuracion actual de Vitest soporta ambas ubicaciones.

## Riesgos y recomendaciones

- Importar `@/libs/db` sin mock puede instanciar Prisma real. Evitarlo.
- Los tests de route handlers no deben depender de `.env` real ni DB real.
- No conviene mockear globalmente `next-auth/react` o `next/navigation`; hacerlo por archivo reduce falsos positivos.
- Los callbacks de `authOptions` estan acoplados a Prisma y certificados. Si los tests quedan fragiles, extraer funciones auxiliares puras antes de aumentar cobertura.
- El login actual importa `framer-motion`, mientras `package.json` tiene `motion`. El build pasa, pero los tests del login podrian requerir mock si aparece friccion.
- Mantener separado lo que valida logica propia de lo que pertenece a NextAuth, OAuth o servicios externos.

## Archivos modificados o creados en esta fase

Archivos creados:

- `doc/test/report/fase-7-plan-auth-testing.md`

Archivos modificados:

- Ninguno.

## Estado de alcance

No se agregaron tests de autenticacion.
No se agregaron mocks.
No se modifico codigo funcional.
No se instalaron dependencias nuevas.
No se ejecuto build ni test runner porque esta fase es exclusivamente documental y no cambia codigo ejecutable.
