# Auth V2 - Plan tecnico

## Objetivo

Actualizar el sistema de autenticacion de Argentina Reanima para que soporte usuarios normales y administradores usando el login y registro actuales como base visual, sin redisenar la UI. La nueva version debe permitir:

- Registro publico de usuarios con `Nombre y Apellido`, email y contrasena.
- Confirmacion de email antes del primer inicio de sesion.
- Login con email/contrasena y Google.
- Roles `ADMIN` y `USER`.
- Acceso al dashboard solo para usuarios `ADMIN`.
- Proteccion real de rutas y endpoints administrativos.

## Estado actual detectado

### Stack relevante

- Next.js App Router con rutas bajo `src/app`.
- NextAuth v4 en `src/app/api/auth/[...nextauth]/route.ts`.
- Configuracion central en `src/libs/authOptions.ts`.
- Prisma con PostgreSQL en `prisma/schema.prisma`.
- Cliente Prisma generado en `src/generated/prisma`.
- Login actual en `src/app/(front)/auth/login/page.tsx`.
- Registro actual en `src/app/(front)/auth/register/page.tsx`.
- Middleware/proxy de auth en `src/proxy.ts`.
- Dashboard bajo `src/app/(front)/dashboard`.

### Modelo `User` actual

El modelo actual contiene:

- `id Int`
- `email String @unique`
- `username String @unique`
- `password String`
- `createdAt`
- `updatedAt`

No existen campos para rol, nombre completo, confirmacion de email, proveedor OAuth ni tokens de verificacion.

### Login actual

El login usa `signIn("credentials")` desde NextAuth. En `authOptions`, el provider `CredentialsProvider`:

- Busca usuario por email.
- Compara password con `bcrypt.compare`.
- Devuelve `id`, `name` usando `username`, y `email`.
- No valida si el email esta confirmado.
- No agrega rol a `user`, `token` ni `session`.
- Redirige manualmente a `/dashboard` desde el cliente si el login es exitoso.

La UI actual ya es funcional y visualmente coherente. Lo que conviene ajustar es el texto para no hablar solo de administrador cuando el login pase a ser publico.

### Registro actual

La pagina de registro existe y envia:

- `username`
- `email`
- `password`

Pero el endpoint `POST /api/auth/register` tiene la creacion de usuario comentada y actualmente responde `No tenes permisos para crear un usuario` con `success: false`. Esto confirma que el registro publico todavia no esta activo.

Tambien hay un bug de manejo de respuesta en el cliente: despues de hacer `const resJSON = await res.json()`, si `success` es falso intenta ejecutar `await res.json()` otra vez. En implementacion futura debe leerse el body una sola vez.

### Proteccion actual de dashboard

`src/proxy.ts` usa `next-auth/middleware` y aplica matcher a `/dashboard/:path*`. Esto exige sesion para entrar al dashboard, pero no distingue roles.

Problema importante: las APIs administrativas no validan sesion ni rol. Por ejemplo:

- `POST /api/news`
- `PUT /api/news/[id]`
- `DELETE /api/news/[id]`
- `POST /api/courses`
- `PUT /api/courses`
- `PUT /api/courses/[id]`
- `DELETE /api/courses/[id]`

Aunque el dashboard se oculte a usuarios `USER`, cualquier endpoint de escritura debe validar `ADMIN` del lado servidor.

## Partes reutilizables

Sirven como base:

- La UI general de login y registro.
- El uso de NextAuth como motor de sesion.
- El provider de credentials con bcrypt.
- `src/proxy.ts` como punto de partida para proteger `/dashboard`.
- Prisma como fuente de verdad de usuarios.
- Los contextos y formularios existentes de dashboard, siempre que las APIs queden protegidas.

Hay que adaptar:

- `User.username` debe reemplazarse funcionalmente por `name` o `fullName`.
- Registro debe crear usuarios `USER` por defecto.
- El usuario inicial administrador debe mantenerse y migrarse a `ADMIN`.
- NextAuth debe incluir rol y estado de email confirmado en token/sesion.
- Dashboard y endpoints administrativos deben exigir rol `ADMIN`.
- Login debe bloquear credentials si `emailVerified` es nulo.
- Google login debe integrarse con creacion/vinculacion de usuario.
- Variables de entorno deben ampliarse para Resend y Google OAuth.

## Arquitectura propuesta

### Roles

Usar enum Prisma:

```prisma
enum Role {
  ADMIN
  USER
}
```

Agregar al usuario:

- `role Role @default(USER)`
- `name String`
- `emailVerified DateTime?`
- `password String?`

`password` deberia ser opcional porque los usuarios que entren solo por Google no necesitan password local.

Decision sugerida: abandonar `username` como campo obligatorio de negocio. Para evitar migraciones destructivas, se puede hacer una migracion en dos pasos:

1. Agregar `name`, `role`, `emailVerified` y campos de token sin borrar `username`.
2. Copiar `username` a `name` para usuarios existentes.
3. En una fase posterior, eliminar `username` o dejarlo nullable si no molesta.

### Sesion

Mantener NextAuth v4 y usar estrategia JWT. No instalar Prisma Adapter en esta etapa para evitar ampliar el alcance con modelos y migraciones adicionales. Para este proyecto es suficiente:

- `jwt` callback: guardar `id`, `role`, `emailVerified`.
- `session` callback: exponer `session.user.id`, `session.user.role`, `session.user.emailVerified`.
- Type augmentation para NextAuth en TypeScript.

El rol debe venir siempre de base de datos, no del cliente.

### Providers

Configurar dos providers:

- Credentials: email + password.
- GoogleProvider: OAuth con `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

#### Opcion recomendada: callbacks manuales

Mantener JWT sin adapter y resolver Google con callbacks manuales. En `signIn` callback:

- Si provider es Google, buscar usuario por email.
- Si existe, permitir acceso.
- Si existe y Google informa email verificado, marcar `emailVerified` si estaba pendiente.
- Si no existe, crear usuario con rol `USER`.
- Si no existe y Google informa email verificado, guardar `emailVerified`.
- Nunca crear usuarios Google como `ADMIN`.

Ventaja: menos modelos.

Riesgo: menor cobertura de casos complejos de cuentas vinculadas.

Decision para este proyecto: usar callbacks manuales. Prisma Adapter puede quedar como alternativa futura si mas adelante se necesita vinculacion OAuth mas completa o persistencia estandar de cuentas/sesiones, pero no es el camino principal de Auth V2.

## Modelo de datos propuesto

Modelo minimo si se usa flujo manual:

```prisma
enum Role {
  ADMIN
  USER
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  name          String
  username      String?   @unique
  password      String?
  role          Role      @default(USER)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  verificationTokens EmailVerificationToken[]
}

model EmailVerificationToken {
  id        Int      @id @default(autoincrement())
  tokenHash String   @unique
  userId    Int
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

No agregar modelos de Prisma Adapter en esta etapa. Los modelos oficiales de NextAuth para `Account`, `Session` y `VerificationToken` pueden evaluarse en una fase futura si se decide adoptar adapter. Para minimizar riesgo ahora, conservar `Int` en `User.id` y resolver Google con callbacks manuales.

## Proteccion de rutas privadas

### Dashboard

Actualizar `src/proxy.ts` para que:

- Si no hay token, redirija a `/auth/login`.
- Si hay token pero `role !== "ADMIN"`, redirija a una pagina segura, por ejemplo `/` o `/auth/login?error=unauthorized`.
- Solo `ADMIN` acceda a `/dashboard` y subrutas.

Tambien se puede agregar un layout server-side para dashboard que valide `getServerSession(authOptions)` y rol. Esto evita renderizados incorrectos y funciona como segunda barrera.

### APIs administrativas

Crear un helper servidor, por ejemplo `requireAdminSession`, para usar en handlers:

- Lee sesion con `getServerSession(authOptions)`.
- Devuelve `401` si no hay sesion.
- Devuelve `403` si hay sesion pero no es `ADMIN`.
- Permite continuar si es `ADMIN`.

Aplicarlo a todos los metodos de escritura:

- Noticias: `POST`, `PUT`, `DELETE`.
- Cursos: `POST`, `PUT`, `DELETE`.
- Cualquier futuro endpoint de Cloudinary/uploads.

Los `GET` publicos pueden permanecer abiertos si alimentan paginas publicas.

## Flujo de registro con confirmacion por email

1. Usuario abre `/auth/register`.
2. Completa:
   - Nombre y Apellido.
   - Email.
   - Contrasena.
3. Cliente envia `POST /api/auth/register`.
4. API valida datos:
   - Nombre no vacio.
   - Email valido y normalizado a lowercase.
   - Password con longitud minima definida.
   - Email no existente.
5. API hashea password con bcrypt.
6. API crea usuario:
   - `name`
   - `email`
   - `password`
   - `role: USER`
   - `emailVerified: null`
7. API genera token aleatorio seguro.
8. Guarda `tokenHash` en base de datos con vencimiento.
9. Envia email de confirmacion con Resend.
10. UI muestra mensaje de revisar correo, sin iniciar sesion automaticamente.
11. Usuario abre link de confirmacion.
12. Endpoint de confirmacion valida token:

- Existe.
- No vencio.
- No fue usado.

13. Marca:

- `user.emailVerified = now`
- `token.usedAt = now`

14. Redirige a `/auth/login?verified=1`.
15. Recien ahi puede iniciar sesion con credentials.

### Endpoint de confirmacion

Opciones:

- `GET /api/auth/verify-email?token=...`
- o pagina `/auth/verify-email?token=...` que llama a API y muestra estado.

Sugerencia: usar una pagina para mejor UX y una API para la accion. Mantener mensajes simples:

- Confirmacion exitosa.
- Token vencido.
- Token invalido.
- Email ya confirmado.

### Reenvio de confirmacion

Agregar despues de la version basica:

- `POST /api/auth/resend-verification`.
- Recibe email.
- Si el usuario existe y no esta confirmado, invalida tokens anteriores o crea uno nuevo.
- Responde de forma generica para no revelar si el email existe.

## Integracion con Resend

### Dependencia

Instalar:

```bash
npm install resend
```

### Variables de entorno

Agregar a `.env.example`:

```env
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@argentinareanima.org.ar"
APP_URL="http://localhost:3000"
```

`NEXTAUTH_URL` puede servir como URL base, pero conviene tener `APP_URL` explicita para construir links de email si se quiere separar responsabilidades.

### Remitente

El remitente requerido es:

```text
noreply@argentinareanima.org.ar
```

Antes de produccion hay que verificar el dominio `noreply.org.ar` o el dominio remitente correspondiente en Resend. Si el dominio no esta verificado, Resend puede rechazar el envio o limitarlo.

### Servicio de email

Crear una capa server-only, por ejemplo:

- `src/libs/email/resend.ts`
- `src/libs/email/templates/confirmEmail.ts`

Debe:

- Usar `RESEND_API_KEY` solo en servidor.
- Construir link absoluto con `APP_URL`.
- No exponer tokens en logs.
- Enviar HTML simple y texto plano.

## Login con Google

### Variables de entorno

Agregar:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

En Google Cloud Console configurar callback:

```text
http://localhost:3000/api/auth/callback/google
https://DOMINIO-PRODUCCION/api/auth/callback/google
```

### Comportamiento esperado

- Si Google devuelve email, buscar usuario por email normalizado.
- Si existe usuario con el mismo email creado por credentials, permitir login y marcar `emailVerified` si Google lo informa verificado.
- Si no existe usuario, crear uno nuevo como `USER`.
- Si Google informa email verificado, guardar `emailVerified`.
- Nunca crear usuarios Google como `ADMIN` automaticamente.
- Los administradores deben asignarse manualmente en base de datos o mediante herramienta admin futura.

### Callbacks manuales

En `signIn`:

- Si el provider no es Google, dejar que el flujo correspondiente continue.
- Si el provider es Google y no hay email, rechazar login.
- Buscar usuario por email normalizado.
- Si existe, permitir login y, si corresponde, actualizar `emailVerified`.
- Si no existe, crear usuario con `role: USER`, `password: null`, nombre proveniente de Google y `emailVerified` cuando Google lo informe verificado.
- Nunca asignar `ADMIN` desde datos de Google.

En `jwt`:

- Guardar `id`.
- Guardar `role`.
- Guardar `emailVerified`.

En `session`:

- Exponer `session.user.id`.
- Exponer `session.user.role`.
- Exponer `session.user.emailVerified`.

### UI

Agregar un boton "Continuar con Google" en `/auth/login`. Mantener estructura visual actual:

- Debajo o encima del formulario credentials.
- Separador simple "o".
- Boton outline con icono Google si se decide agregar asset.

En `/auth/register`, opcionalmente agregar "Registrarse con Google" o dejar Google solo en login; NextAuth puede crear la cuenta en el primer login con Google.

## Mejoras puntuales de UI/copy sin redisenar

Login:

- Cambiar textos que dicen "administrador" por textos neutrales, porque ahora tambien entran usuarios normales.
- Si un `USER` inicia sesion correctamente, no mandarlo al dashboard. Redirigirlo a `/` o a una futura area de usuario.
- Mostrar mensaje claro si el email no esta confirmado.
- Agregar boton Google sin modificar layout principal.

Registro:

- Reemplazar `Username` por `Nombre y Apellido`.
- Traducir `Password`, `Confirm Password` y `Register`.
- Luego del registro, mostrar estado "Te enviamos un email de confirmacion".
- Corregir el doble `res.json()`.
- Mantener tarjeta, mapa, gradientes y distribucion general.

## Riesgos y decisiones tecnicas

### Migracion del usuario administrador existente

Riesgo: al agregar `role`, el admin existente podria quedar como `USER` por default.

Decision requerida: identificar el email administrador actual y migrarlo explicitamente a `ADMIN`. Esto se puede hacer en la migracion, seed o script manual controlado.

### `username` actual es obligatorio y unico

Riesgo: el registro nuevo no usara username.

Decision sugerida: agregar `name` y volver `username` opcional durante transicion. No eliminarlo en la primera fase.

### Password opcional

Riesgo: el provider credentials debe manejar usuarios sin password.

Decision: si `password` es null, credentials debe rechazar login con mensaje generico y sugerir Google si corresponde.

### Confirmacion de email

Riesgo: tokens en texto plano.

Decision: guardar solo hash del token y enviar el token original por email. Usar vencimiento corto, por ejemplo 24 horas.

### Proteccion API

Riesgo actual alto: endpoints de escritura no verifican administrador.

Decision: antes de abrir registro publico, proteger todos los endpoints administrativos. Esto debe ir antes o en la misma fase que roles.

### Google y cuentas existentes

Riesgo: un usuario podria registrarse con credentials y luego entrar con Google con el mismo email.

Decision: permitir login por email coincidente y marcar `emailVerified` solo si Google informa `email_verified`. Si no lo informa, no completar esa marca automaticamente.

### Dependencias y version

Riesgo: Next.js 16 + NextAuth v4 puede requerir revisar compatibilidad de middleware/proxy y callbacks.

Decision: validar con `npm run build` despues de cada fase. No instalar Prisma Adapter en Auth V2 salvo que se abra una fase futura especifica para eso.

### Entorno de produccion

Riesgo: emails no llegan si el dominio de Resend no esta verificado.

Decision: dejar documentado como requisito de despliegue y probar envio en ambiente controlado.

## Fases de implementacion

### Fase 0 - Decisiones y respaldo

Objetivo: preparar implementacion sin afectar usuarios existentes.

Tareas:

- Confirmar email del administrador actual. (Si no lo hay, crear cuenta de admin inventada para local)
- Decidir estrategia Google:
  - Estrategia definida para Auth V2: callbacks manuales.
  - Prisma Adapter queda solo como alternativa futura fuera de este alcance.
- Confirmar dominio real para `noreply@argentinareanima.org.ar` en Resend.
- Revisar `.env` de desarrollo y produccion.
- Tomar backup de base de datos antes de migraciones.

Criterio de salida:

- Email admin definido.
- Estrategia OAuth definida como callbacks manuales con JWT.
- Variables necesarias identificadas.

### Fase 1 - Modelo de datos y migracion

Objetivo: agregar roles, nombre y confirmacion sin romper login actual.

Tareas:

- Agregar enum `Role`.
- Agregar `name`, `role`, `emailVerified`.
- Hacer `username` opcional o mantenerlo temporalmente con backfill.
- Hacer `password` opcional si se habilita Google.
- Agregar modelo de tokens de confirmacion.
- Migrar usuario administrador existente a `ADMIN`.
- Ejecutar `npx prisma migrate dev` y `npx prisma generate`.

Criterio de salida:

- Prisma genera correctamente.
- Admin existente conserva acceso.
- Usuarios nuevos podran crearse como `USER`.

### Fase 2 - Sesion NextAuth con roles

Objetivo: que la sesion conozca `id`, `role` y estado de email.

Tareas:

- Actualizar `authOptions`.
- Agregar callbacks `jwt` y `session`.
- Agregar tipos NextAuth para `session.user.role`.
- En credentials, rechazar usuario inexistente, password incorrecto y email no confirmado.
- Manejar usuarios sin password.

Criterio de salida:

- Login admin sigue funcionando.
- La sesion expone rol.
- Build TypeScript pasa.

### Fase 3 - Proteccion de dashboard y APIs

Objetivo: cerrar acceso administrativo tanto en UI como en servidor.

Tareas:

- Actualizar `src/proxy.ts` para validar `ADMIN`.
- Agregar validacion server-side en layout o paginas dashboard.
- Crear helper `requireAdminSession`.
- Proteger endpoints `POST/PUT/DELETE` de noticias y cursos.
- Devolver `401` y `403` consistentes.
- Ajustar cliente dashboard para manejar errores sin romper estado.

Criterio de salida:

- Usuario sin sesion no entra al dashboard.
- Usuario `USER` no entra al dashboard.
- Usuario `USER` no puede escribir via API.
- Usuario `ADMIN` puede gestionar contenido.

### Fase 4 - Registro publico con email pendiente

Objetivo: activar registro normal sin permitir login antes de confirmar.

Tareas:

- Cambiar campo `username` por `name` en UI.
- Enviar `name`, `email`, `password`.
- Rehabilitar `POST /api/auth/register`.
- Validar input en servidor.
- Crear usuario `USER` con `emailVerified: null`.
- Generar y guardar token hash.
- Preparar respuesta de registro pendiente.
- Corregir manejo de errores del formulario.

Criterio de salida:

- Registro crea usuario `USER`.
- Usuario no confirmado no puede iniciar sesion.
- UI informa que debe revisar su correo.

### Fase 5 - Resend y confirmacion de email

Objetivo: completar confirmacion por correo.

Tareas:

- Instalar `resend`.
- Agregar variables a `.env.example`.
- Crear cliente Resend server-only.
- Crear template de confirmacion.
- Enviar email desde `noreply@argentinareanima.org.ar`.
- Crear endpoint/pagina de verificacion.
- Marcar `emailVerified` al confirmar.
- Manejar token vencido, usado o invalido.
- Opcional: endpoint de reenvio.

Criterio de salida:

- Usuario recibe email.
- Link confirma cuenta.
- Usuario confirmado puede iniciar sesion.
- Usuario sin confirmar sigue bloqueado.

### Fase 6 - Login con Google

Objetivo: permitir autenticacion OAuth sin elevar permisos.

Tareas:

- Agregar `GoogleProvider`.
- Configurar variables Google.
- Implementar callbacks manuales sin Prisma Adapter.
- En `signIn`, buscar por email normalizado y crear o permitir usuario segun corresponda.
- Asignar siempre `USER` por defecto.
- Marcar `emailVerified` para Google verificado.
- En `jwt`, guardar `id`, `role` y `emailVerified`.
- En `session`, exponer esos datos en `session.user`.
- Agregar boton Google en login.
- Definir redireccion segun rol:
  - `ADMIN` a `/dashboard`.
  - `USER` a `/` o futura area de usuario.

Criterio de salida:

- Login Google funciona.
- Usuario Google queda como `USER`.
- Admin no se pierde.
- Dashboard sigue restringido a `ADMIN`.

### Fase 7 - Pulido, pruebas y hardening

Objetivo: validar comportamiento completo y dejarlo listo para produccion.

Tareas:

- Revisar copy de login/registro.
- Confirmar que no quedan textos que prometan dashboard a usuarios normales.
- Probar flujos manuales:
  - Registro nuevo.
  - Login antes de confirmar.
  - Confirmacion correcta.
  - Confirmacion vencida/invalida.
  - Login credentials confirmado.
  - Login Google nuevo.
  - Login Google con email existente.
  - USER intentando dashboard.
  - USER intentando API write.
  - ADMIN usando dashboard.
- Ejecutar `npm run build`.
- Revisar logs para no imprimir passwords ni tokens.
- Documentar variables de produccion.

Criterio de salida:

- Build exitoso.
- Flujos criticos validados.
- Variables y pasos de despliegue documentados.

## Orden recomendado

No abrir el registro publico antes de completar roles y proteccion de APIs. El orden seguro es:

1. Modelo y roles.
2. Sesion con roles.
3. Proteccion dashboard + APIs.
4. Registro publico.
5. Confirmacion email con Resend.
6. Google.
7. QA final.

## Checklist de aceptacion final

- Un usuario nuevo se registra como `USER`.
- El usuario recibe email de confirmacion desde `noreply@argentinareanima.org.ar`.
- El usuario no puede iniciar sesion antes de confirmar email.
- El usuario puede iniciar sesion despues de confirmar email.
- El usuario puede iniciar sesion con Google.
- Ningun usuario `USER` puede entrar a `/dashboard`.
- Ningun usuario `USER` puede crear, editar o borrar noticias/cursos por API.
- Un `ADMIN` puede entrar al dashboard y gestionar contenido.
- El usuario administrador existente conserva acceso.
- La UI de login/registro mantiene su estructura visual actual.
- `npm run build` pasa.

