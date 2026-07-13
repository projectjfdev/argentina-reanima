# Plan de ejecucion - Tests de autenticacion

Fecha: 2026-07-13

## Objetivo

Transformar la estrategia definida en `doc/test/report/fase-7-plan-auth-testing.md` en un plan de trabajo concreto para implementar tests de autenticacion con Vitest, React Testing Library y jsdom.

Este plan no implementa tests. Define el orden de ejecucion, los archivos esperados, la cobertura por fase y las condiciones de avance.

## Criterios generales de ejecucion

- Cada fase debe terminar con `npm run test:run` en verde antes de avanzar.
- Cada fase debe generar su reporte correspondiente en `doc/test/report/`.
- Los tests no deben usar base de datos real, servicios de email reales, OAuth real ni red externa.
- Los mocks deben declararse por archivo de test salvo que una utilidad compartida reduzca duplicacion sin ocultar comportamiento.
- Cualquier import de `@/libs/db` en tests debe estar mockeado antes de importar el modulo bajo prueba.
- Si una fase requiere refactor, el cambio debe ser minimo, enfocado en testabilidad y documentado en el reporte de la fase.
- La implementacion debe avanzar de menor a mayor acoplamiento: helpers puros, helpers con mocks, route handlers, componentes cliente, pagina de login y finalmente `authOptions`.

## Fase 1 - Helpers puros de tokens

### Objetivo

Cubrir la logica pura de generacion y hashing de tokens sin Prisma, NextAuth, DOM ni mocks complejos.

### Archivos a crear

- `src/test/auth/passwordReset.test.ts`
- `src/test/auth/emailVerification.test.ts`
- `doc/test/report/fase-8-auth-helpers-puros.md`

### Archivos a modificar

- Ninguno esperado.

### Funcionalidades cubiertas

- `createPasswordResetToken` genera tokens hexadecimales de 64 caracteres.
- `hashPasswordResetToken` genera hashes SHA-256 deterministas de 64 caracteres.
- `createVerificationToken` genera tokens hexadecimales de 64 caracteres.
- `hashVerificationToken` genera hashes SHA-256 deterministas de 64 caracteres.
- Dos tokens generados consecutivamente no deberian ser iguales en un caso simple.

### Riesgo y mitigacion

Riesgo bajo. Son funciones puras y no requieren cambios productivos. Evitar asserts contra valores aleatorios completos; validar formato, longitud y determinismo.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-8-auth-helpers-puros.md`.

## Fase 2 - Autorizacion admin

### Objetivo

Validar `requireAdminSession` con mock controlado de NextAuth.

### Archivos a crear

- `src/test/auth/requireAdminSession.test.ts`
- `doc/test/report/fase-9-require-admin-session.md`

### Archivos a modificar

- Ninguno esperado.

### Funcionalidades cubiertas

- Sin sesion retorna `401` con `success: false`.
- Usuario autenticado sin rol `ADMIN` retorna `403` con `success: false`.
- Usuario `ADMIN` retorna `null`.

### Riesgo y mitigacion

Riesgo bajo-medio por el import de `authOptions`. Mockear `next-auth` y, si hace falta, aislar cualquier dependencia transitiva que intente tocar Prisma o variables de entorno.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-9-require-admin-session.md`.

## Fase 3 - Helpers con Prisma mockeado

### Objetivo

Cubrir la logica de negocio de verificacion de email y recuperacion de password sin DB real.

### Archivos a crear

- `src/test/auth/verifyEmailToken.test.ts`
- `src/test/auth/resetPasswordWithToken.test.ts`
- Opcional: `src/test/auth/prismaMock.ts` si la duplicacion de mocks lo justifica.
- `doc/test/report/fase-10-auth-helpers-prisma-mock.md`

### Archivos a modificar

- Ninguno esperado.

### Funcionalidades cubiertas

- `verifyEmailToken`:
  - token vacio retorna `invalid`.
  - token inexistente retorna `invalid`.
  - usuario ya verificado retorna `already-verified`.
  - token usado retorna `invalid`.
  - token expirado retorna `expired`.
  - token valido actualiza usuario y marca token como usado.
- `resetPasswordWithToken`:
  - token vacio retorna `invalid`.
  - token inexistente retorna `invalid`.
  - token usado retorna `invalid`.
  - token expirado retorna `expired`.
  - token valido hashea password, actualiza usuario, consume token e invalida otros tokens del usuario.
  - carrera con `updateMany.count !== 1` retorna `invalid`.

### Riesgo y mitigacion

Riesgo medio por mocks de Prisma y bcrypt. Mantener los mocks pequenos y explicitos por caso. No reutilizar estado entre tests sin resetearlo en `beforeEach`.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-10-auth-helpers-prisma-mock.md`.

## Fase 4 - Route handlers simples

### Objetivo

Validar los endpoints que delegan en helpers ya cubiertos, con mocks de bajo acoplamiento.

### Archivos a crear

- `src/test/auth/reset-password-route.test.ts`
- `src/test/auth/verify-email-route.test.ts`
- `doc/test/report/fase-11-auth-route-handlers-simples.md`

### Archivos a modificar

- Ninguno esperado.

### Funcionalidades cubiertas

- `src/app/api/auth/reset-password/route.ts`:
  - password corta retorna `400`.
  - helper con resultado no exitoso retorna `400`.
  - helper exitoso retorna `200` y `success: true`.
- `src/app/api/auth/verify-email/route.ts`:
  - resultado `success` retorna `200`.
  - resultado `already-verified` retorna `200`.
  - resultado `invalid` retorna `400`.
  - resultado `expired` retorna `410`.

### Riesgo y mitigacion

Riesgo medio-bajo. Construir `Request` o `NextRequest` simulados y validar solo status y JSON. No probar internals de Next.js.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-11-auth-route-handlers-simples.md`.

## Fase 5 - Route handlers con email y persistencia

### Objetivo

Cubrir los endpoints con mas dependencias externas mediante mocks de Prisma, bcrypt, Resend y helpers de certificados.

### Archivos a crear

- `src/test/auth/forgot-password-route.test.ts`
- `src/test/auth/register-route.test.ts`
- Opcional: ampliar `src/test/auth/prismaMock.ts` si fue creado en fase 3.
- `doc/test/report/fase-12-auth-route-handlers-email-db.md`

### Archivos a modificar

- Ninguno esperado, salvo refactor minimo si un handler mezcla validacion y efectos de forma dificil de aislar.

### Funcionalidades cubiertas

- `src/app/api/auth/forgot-password/route.ts`:
  - email invalido retorna `400`.
  - email inexistente retorna respuesta generica exitosa.
  - usuario existente invalida tokens previos, crea token y dispara email.
  - fallo de email no expone informacion sensible.
- `src/app/api/auth/register/route.ts`:
  - nombre faltante retorna `400`.
  - email invalido retorna `400`.
  - password corta retorna `400`.
  - email existente retorna `409`.
  - registro exitoso retorna `201`.
  - fallo de email ejecuta rollback del usuario creado.

### Riesgo y mitigacion

Riesgo medio-alto por combinacion de validaciones, transacciones y servicios externos. Implementar primero `forgot-password`, luego `register`. Evitar snapshots grandes; validar status, JSON y llamadas relevantes a mocks.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-12-auth-route-handlers-email-db.md`.

## Fase 6 - Componente cliente pequeno

### Objetivo

Cubrir interaccion cliente aislada antes de entrar en la pagina de login completa.

### Archivos a crear

- `src/test/auth/sign-out-menu-button.test.tsx`
- `doc/test/report/fase-13-sign-out-menu-button.md`

### Archivos a modificar

- Ninguno esperado.

### Funcionalidades cubiertas

- `SignOutMenuButton` renderiza el boton de cierre de sesion.
- Al hacer click llama `signOut({ callbackUrl: "/" })`.

### Riesgo y mitigacion

Riesgo bajo. Mockear `next-auth/react` solo en este archivo. Usar React Testing Library y `userEvent`.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-13-sign-out-menu-button.md`.

## Fase 7 - Pagina de login

### Objetivo

Cubrir el flujo principal de login por credenciales y el disparador de Google en la UI.

### Archivos a crear

- `src/test/auth/login-page.test.tsx`
- `doc/test/report/fase-14-login-page.md`

### Archivos a modificar

- Posible refactor minimo en `src/app/(front)/auth/login/page.tsx` si la pagina completa es demasiado acoplada para testear:
  - extraer componente cliente interno exportable, por ejemplo `LoginForm` o `SignInCard`.
  - mantener comportamiento visual y rutas sin cambios.

### Funcionalidades cubiertas

- Render de campos de email y password.
- Validacion de campos requeridos.
- Submit llama `signIn("credentials", { redirect: false, ... })`.
- Error de credenciales se muestra en pantalla.
- Exito refresca sesion y redirige segun rol.
- Boton Google llama `signIn("google", { callbackUrl: "/auth/login" })`.

### Riesgo y mitigacion

Riesgo alto por dependencias de `next-auth/react`, `next/navigation`, `react-hook-form` y animaciones. Mantener mocks locales y evaluar mock de animaciones solo si bloquean el render. Si se refactoriza, hacerlo antes de escribir asserts complejos y documentarlo.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-14-login-page.md`.

## Fase 8 - authOptions y callbacks propios

### Objetivo

Cubrir solo la logica propia dentro de `authOptions`, sin testear internals de NextAuth ni OAuth real.

### Archivos a crear

- `src/test/auth/authOptions.test.ts`
- `doc/test/report/fase-15-auth-options.md`

### Archivos a modificar

- Posible refactor minimo en `src/libs/authOptions.ts` si los callbacks quedan demasiado fragiles:
  - extraer funciones auxiliares puras para `authorize`, `jwt`, `session` o `signIn`.
  - conservar el objeto `authOptions` con el mismo contrato publico.

### Funcionalidades cubiertas

- Provider credentials `authorize`:
  - usuario inexistente.
  - password invalida.
  - email no verificado, si aplica al flujo actual.
  - credenciales validas.
- Callback `signIn` para Google:
  - creacion o vinculacion de usuario segun logica propia.
- Callback `jwt`:
  - agrega datos propios del usuario al token.
- Callback `session`:
  - expone datos propios esperados en `session.user`.

### Riesgo y mitigacion

Riesgo alto por acoplamiento a Prisma, bcrypt, certificados, providers y variables de entorno. Esta fase queda despues de handlers y UI para que los mocks ya esten maduros. Si el costo de testear el objeto completo es alto, priorizar funciones extraidas de logica propia.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de fase creado en `doc/test/report/fase-15-auth-options.md`.

## Fase 9 - Revision de cobertura y limites E2E

### Objetivo

Revisar cobertura alcanzada, identificar huecos intencionales y dejar preparado el siguiente plan para E2E si corresponde.

### Archivos a crear

- `doc/test/report/fase-16-revision-auth-testing.md`

### Archivos a modificar

- Opcional: `doc/test/plan/auth-testing-execution-plan.md` si durante la ejecucion se documentan ajustes aprobados.

### Funcionalidades cubiertas

- Inventario final de tests implementados.
- Confirmacion de que los flujos con DB, email y OAuth reales quedan fuera de Vitest inicial.
- Lista de candidatos para Playwright:
  - login real.
  - logout real.
  - rutas protegidas.
  - registro con email real o proveedor simulado.
  - recuperacion de password desde link.
  - verificacion de email desde link.

### Riesgo y mitigacion

Riesgo bajo. No agrega tests salvo que se detecte una brecha critica y se acuerde una fase adicional.

### Condicion de cierre

- `npm run test:run` pasa en verde.
- Reporte de cierre creado en `doc/test/report/fase-16-revision-auth-testing.md`.

## Orden resumido

1. Helpers puros de tokens.
2. `requireAdminSession`.
3. Helpers con Prisma mockeado.
4. Route handlers simples.
5. Route handlers con email y persistencia.
6. `SignOutMenuButton`.
7. Pagina de login.
8. `authOptions`.
9. Revision final y limites E2E.

## Politica de avance

No se debe iniciar una fase nueva si la fase anterior no cumple estas condiciones:

- Tests de la fase implementados.
- Suite completa en verde con `npm run test:run`.
- Reporte de fase creado en `doc/test/report/`.
- Refactors, si existieron, documentados con motivo y alcance.
- Sin dependencias nuevas salvo necesidad explicita y justificada.
