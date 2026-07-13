# Reporte fase 16 - Revision auth testing

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 9 del plan `doc/test/plan/auth-testing-execution-plan.md`: revisar la cobertura alcanzada, confirmar los limites de los tests actuales y dejar identificados candidatos para E2E futuro.

Esta fase no agrega tests nuevos ni modifica codigo productivo.

## Archivos creados

- `doc/test/report/fase-16-revision-auth-testing.md`

## Archivos modificados

- Ninguno.

## Inventario final de tests de autenticacion

### Helpers puros

- `src/test/auth/passwordReset.test.ts`
- `src/test/auth/emailVerification.test.ts`

Cobertura:

- Generacion de tokens hexadecimales.
- Hashing SHA-256 determinista.
- Unicidad basica entre llamadas consecutivas.

### Autorizacion admin

- `src/test/auth/requireAdminSession.test.ts`

Cobertura:

- Sin sesion: `401`.
- Usuario no admin: `403`.
- Usuario admin: `null`.

### Helpers con Prisma mockeado

- `src/test/auth/verifyEmailToken.test.ts`
- `src/test/auth/resetPasswordWithToken.test.ts`

Cobertura:

- Tokens vacios, inexistentes, usados y expirados.
- Verificacion exitosa de email.
- Reset exitoso de password.
- Consumo atomico de token.
- Invalidacion de otros tokens activos.
- Carrera con `updateMany.count !== 1`.

### Route handlers simples

- `src/test/auth/reset-password-route.test.ts`
- `src/test/auth/verify-email-route.test.ts`

Cobertura:

- Contratos HTTP principales.
- Status codes esperados.
- Respuestas JSON.
- Delegacion a helpers.

### Route handlers con email y persistencia

- `src/test/auth/forgot-password-route.test.ts`
- `src/test/auth/register-route.test.ts`

Cobertura:

- Validaciones de entrada.
- Registro exitoso.
- Recuperacion de password.
- Politica anti-enumeracion en forgot password.
- Envio de emails mockeado.
- Rollback de usuario creado si falla email de confirmacion.

### Componentes cliente

- `src/test/auth/sign-out-menu-button.test.tsx`
- `src/test/auth/login-page.test.tsx`

Cobertura:

- Cierre de sesion delegando a `signOut`.
- Render del login.
- Validacion cliente.
- Login por credenciales.
- Error de credenciales.
- Redireccion por rol.
- Inicio de login con Google.

### authOptions

- `src/test/auth/authOptions.test.ts`

Cobertura:

- Provider credentials `authorize`.
- Callback `signIn`.
- Callback `jwt`.
- Callback `session`.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 13 passed.
- Tests: 62 passed.
- Estado: verde.

## Limites actuales de la cobertura Vitest

Los tests actuales cubren logica propia, contratos HTTP de handlers y comportamiento de UI con mocks. Quedan fuera intencionalmente:

- Base de datos real.
- Migraciones reales.
- Prisma Client contra una DB de prueba.
- Resend real.
- Entrega real de emails.
- Links reales recibidos por email.
- OAuth real con Google.
- Cookies reales de NextAuth.
- JWT firmado y ciclo completo de sesion.
- Navegacion real en navegador.
- Acceso real a rutas protegidas con middleware/proxy.
- Render completo de animaciones/canvas en la pagina de login.

Estos limites son correctos para la etapa actual porque mantienen la suite rapida, determinista y sin dependencias externas.

## Candidatos para E2E futuro

Para una etapa posterior con Playwright o herramienta equivalente, conviene cubrir:

- Login real por credenciales.
- Logout real con cookies/session.
- Redireccion por rol luego de login real.
- Acceso a rutas protegidas como usuario anonimo.
- Acceso a rutas protegidas como usuario `USER`.
- Acceso a rutas protegidas como usuario `ADMIN`.
- Registro completo con email simulado o proveedor de email de test.
- Verificacion de email desde link generado.
- Recuperacion de password desde link generado.
- Intento de login con email no verificado.
- OAuth con Google solo si existe entorno seguro de prueba para ese proveedor; si no, usar un proveedor simulado o mantenerlo fuera del E2E automatizado.

## Riesgos residuales

- Al no usar DB real, no se detectan errores de schema, constraints o transacciones reales de Prisma.
- Al no ejecutar Resend real, no se valida formato final entregado por el proveedor.
- Al mockear NextAuth, no se valida compatibilidad completa con cookies, JWT firmado ni ciclo del route handler `[...nextauth]`.
- Al mockear `AuthVisualPanel` y animaciones en login, no se valida esa parte visual dentro de la suite de auth.

## Recomendaciones

- Mantener los tests actuales como suite base de regresion para auth.
- Ejecutar `npm run test:run` antes de cambios en autenticacion, certificados vinculados a usuarios o APIs de auth.
- Ejecutar `npm run build` como chequeo complementario antes de merge, ya que el proyecto no tiene lint activo.
- Considerar helpers compartidos de test solo si nuevas fases repiten demasiado armado de Prisma mocks o `Request` JSON.
- Planificar una etapa E2E separada, con datos de prueba controlados y sin depender de emails/OAuth reales salvo que exista infraestructura dedicada.

## Estado de cierre

La implementacion de tests de autenticacion definida en `doc/test/plan/auth-testing-execution-plan.md` queda completada hasta Fase 9.

No se agregaron dependencias nuevas.
No se modifico codigo productivo.
La suite completa queda en verde.
