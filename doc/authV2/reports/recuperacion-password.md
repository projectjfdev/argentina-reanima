# Auth V2 - Recuperacion de contrasena

Fecha: 2026-07-07

## Alcance implementado

- Se agrego el flujo de recuperacion de contrasena para usuarios de Auth V2.
- Se creo una pagina publica para solicitar recuperacion en `/auth/forgot-password`.
- Se creo una pagina publica para cambiar contrasena en `/auth/reset-password?token=...`.
- Se agrego el link "Olvidaste tu contrasena?" desde `/auth/login`.
- Se agrego envio de email con Resend reutilizando la configuracion server-only existente.
- Se creo un template nuevo de email para recuperacion de contrasena, con estilo simple y consistente con confirmacion de email.
- Se agrego un token de recuperacion con vencimiento de 1 hora.
- Se guarda en base de datos solo el hash SHA-256 del token, no el token plano.
- La respuesta de solicitud de recuperacion no revela si el email existe o no.
- La nueva contrasena se guarda con `bcrypt.hash(password, 10)`, el mismo mecanismo actual de registro.
- Si la cuenta fue creada solo con Google y no tenia contrasena local, el flujo permite crear una contrasena local.
- No se modifico el login con Google.
- No se modificaron roles ni permisos.

## Modelo de datos

Se agrego el modelo `PasswordResetToken`:

- `tokenHash`: hash SHA-256 unico del token.
- `userId`: usuario asociado.
- `expiresAt`: vencimiento del token.
- `usedAt`: marca de uso o invalidacion.
- `createdAt`: fecha de creacion.

Tambien se agrego la relacion `passwordResetTokens` en `User`.

## Rutas y archivos modificados

- `prisma/schema.prisma`
- `prisma/migrations/20260707120000_password_reset_tokens/migration.sql`
- `src/libs/auth/passwordReset.ts`
- `src/libs/email/resend.ts`
- `src/libs/email/templates/resetPassword.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/(front)/auth/forgot-password/page.tsx`
- `src/app/(front)/auth/reset-password/page.tsx`
- `src/app/(front)/auth/login/page.tsx`
- `doc/authV2/reports/recuperacion-password.md`

## Flujo implementado

1. El usuario entra a `/auth/forgot-password`.
2. Ingresa su email.
3. `POST /api/auth/forgot-password` valida formato de email.
4. Si el usuario existe:
   - invalida tokens pendientes anteriores;
   - crea un token plano aleatorio;
   - guarda solo `tokenHash`;
   - envia email con link a `/auth/reset-password?token=...`.
5. Si el usuario no existe, responde el mismo mensaje generico.
6. El usuario entra al link recibido.
7. Ingresa la nueva contrasena dos veces.
8. `POST /api/auth/reset-password` valida token, vencimiento y uso previo.
9. Si el token es valido:
   - hashea la nueva contrasena con bcrypt;
   - actualiza `User.password`;
   - marca `emailVerified` si estaba pendiente;
   - consume el token;
   - invalida otros tokens pendientes del mismo usuario.

## Variables requeridas

Se reutilizan las variables existentes:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `APP_URL` o `NEXTAUTH_URL`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo el warning ya visto de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.

`npx prisma generate` actualizo los archivos generados de Prisma, pero Windows bloqueo el reemplazo del archivo nativo `query_engine-windows.dll.node` porque habia procesos `node` activos usando el DLL. Aun asi, los archivos JS/TS generados contienen `PasswordResetToken` y el build paso correctamente.

## Como probar

1. Ejecutar `npx prisma migrate dev`.
2. Ejecutar `npm run dev`.
3. Entrar a `/auth/forgot-password`.
4. Ingresar el email de un usuario existente.
5. Abrir el email recibido y entrar al link de recuperacion.
6. Cargar la nueva contrasena dos veces.
7. Iniciar sesion desde `/auth/login` con email y nueva contrasena.
8. Probar tambien un email inexistente: debe mostrar el mismo mensaje generico.
9. Probar una cuenta creada solo con Google: despues del reset debe poder iniciar sesion con credenciales locales.

## Pendiente

- QA manual real del envio con Resend en un entorno con `RESEND_API_KEY` configurada.
- Correr `npx prisma generate` nuevamente si se quiere limpiar el reemplazo pendiente del DLL, cerrando antes procesos `node` que puedan estar usando Prisma.
