# Fase 1 - Analisis del proyecto actual

Fecha: 2026-07-12

## Resumen

La fase 1 queda ejecutada como relevamiento tecnico. No se instalaron dependencias, no se modifico codigo funcional y no se agrego configuracion de Vitest todavia.

El proyecto esta preparado para incorporar testing de forma incremental, pero conviene separar desde el inicio tests de logica pura en entorno `node` y tests de componentes en `jsdom`, aunque la primera configuracion puede arrancar con `jsdom` como entorno general segun el plan.

El primer objetivo debe seguir siendo validar el entorno de testing, no probar autenticacion completa todavia.

## Package.json

Scripts actuales:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `postinstall`: `prisma generate`

No existe script de test. Las dependencias de testing recomendadas en el plan no estan instaladas aun:

- `vitest`
- `@testing-library/react`
- `jsdom`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

Dependencias relevantes para mocks futuros:

- `next-auth`
- `@prisma/client` y cliente generado en `src/generated/prisma`
- `bcrypt`
- `cloudinary`
- `resend`
- `@emailjs/browser`
- `react-hook-form`
- Radix UI
- `lucide-react`
- `motion`
- `react-leaflet` / `leaflet`
- `react-player`

Observacion: `postinstall` ejecuta `prisma generate`, por lo que la fase de instalacion debe verificar que el cliente generado siga consistente.

## TypeScript y alias

`tsconfig.json` confirma:

- `strict: true`
- `module: "esnext"`
- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- `baseUrl: "src"`
- alias `@/*` hacia `*`
- `allowJs: true`
- `noEmit: true`

La configuracion de Vitest debe replicar el alias `@` apuntando a `src`. No parece necesario modificar `tsconfig.json` en fase 1.

## Estructura revisada

Areas principales:

- `src/app`: App Router, paginas publicas bajo `src/app/(front)` y route handlers bajo `src/app/api`.
- `src/components`: componentes reutilizables y componentes de feature.
- `src/components/ui`: primitivas UI estilo shadcn/Radix.
- `src/context`: `CourseContext.tsx` y `NewsContext.tsx`, ambos cliente.
- `src/hooks`: `useMedia.ts`, hook cliente con `window`.
- `src/libs`: helpers, Prisma, Cloudinary, auth, certificados y email.

Hay muchos archivos `use client`, incluyendo paginas de front, dashboard, auth y componentes UI. Esto confirma que `jsdom` sera necesario para tests de componentes.

## Componentes cliente que requieren jsdom

Candidatos evidentes:

- `src/app/(front)/auth/login/page.tsx`: formulario de login, `useSession`, `signIn`, `getSession`, `useRouter`, `react-hook-form` e interacciones.
- `src/app/(front)/auth/register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `verify-email/page.tsx`: formularios/flujos cliente de auth.
- `src/components/Navbar/navbar.tsx`: `useSession`, `signOut`, scroll, clicks fuera del menu y `document`.
- `src/components/Buttons/SignOutMenuButton.tsx`: `signOut`.
- `src/components/Auth/NextAuthProvider.tsx`: `SessionProvider`.
- `src/context/NewsContext.tsx` y `src/context/CourseContext.tsx`: providers cliente.
- `src/hooks/useMedia.ts`: `window.innerWidth` y evento `resize`.
- `src/components/ContactForm/ContactForm.tsx`: EmailJS, formularios y `window.close`.
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`: timers, confirmacion de navegador y fetch.
- `src/components/Dashboard/Certificates/CertificateValidationContent.tsx`: clipboard, DOM fallback y timers.
- `src/components/FileUpload/FileUpload.tsx`, formularios de dashboard y helpers de preview: APIs de archivo/browser.

Para el primer test de entorno no conviene usar estos componentes complejos. Es mejor renderizar un componente minimo creado solo para validar el setup.

## Modulos que requeriran mocks

Mocks esperados por dependencia:

- `next/navigation`: `useRouter`, `useParams`, `useSearchParams`, `redirect`, `notFound`.
- `next-auth/react`: `useSession`, `SessionProvider`, `signIn`, `signOut`, `getSession`.
- `next-auth`: `getServerSession` y `NextAuth`.
- `next-auth/middleware`: `withAuth` para `src/proxy.ts`.
- Prisma: `src/libs/db.ts` exporta `prisma` desde `src/generated/prisma`; route handlers y helpers de auth/certificados dependen de este cliente.
- `bcrypt`: `hash` y `compare`.
- `cloudinary`: uploads y deletes en APIs de news.
- `resend`: envio de emails de confirmacion y reseteo.
- `@emailjs/browser`: formulario de contacto.
- APIs browser: `window`, `document`, `localStorage`, `navigator.clipboard`, `matchMedia`, `FileReader`, `URL.createObjectURL`, canvas, `window.open`, `window.close`, `window.confirm`.
- `next/image` puede requerir mock si aparecen problemas en tests de componentes, aunque Next soporta algunos escenarios con configuracion.
- Librerias con DOM pesado como `leaflet`, `react-leaflet` y `react-player` probablemente necesiten mock al testear paginas que las importen.

## Flujo actual de autenticacion relevado

Archivos revisados:

- `src/libs/authOptions.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/libs/auth/requireAdminSession.ts`
- `src/libs/auth/passwordReset.ts`
- `src/libs/auth/emailVerification.ts`
- `src/proxy.ts`
- `src/app/(front)/auth/login/page.tsx`

Hallazgos:

- NextAuth usa estrategia JWT y pagina custom `/auth/login`.
- Provider credentials valida email/password, usuario existente, password local, email verificado y `bcrypt.compare`.
- Provider Google crea o actualiza usuarios en Prisma, normaliza email, marca `emailVerified` si Google lo informa y vincula certificados por email.
- Callbacks `jwt` y `session` consultan Prisma para refrescar `id`, `role` y `emailVerified`.
- `register` valida nombre/email/password, hashea password, crea token de verificacion, crea usuario y token en transaccion, vincula certificados y envia email con Resend.
- `verify-email` delega en `verifyEmailToken`.
- `forgot-password` genera token, invalida tokens anteriores, crea token nuevo y envia email de recuperacion.
- `reset-password` valida longitud minima y delega en `resetPasswordWithToken`.
- `requireAdminSession` depende de `getServerSession(authOptions)` y retorna `NextResponse` 401/403 o `null`.
- `proxy.ts` protege `/dashboard/:path*` con `withAuth` y rol `ADMIN`.
- Login cliente usa `signIn`, `getSession`, `useSession().update`, `useRouter`, `react-hook-form`, estado de loading y login con Google.

## Areas candidatas para tests iniciales

Mejores candidatos para despues de validar el entorno:

- `src/libs/certificates/normalizeCertificateEmail.ts`: helper puro, sin mocks.
- `src/libs/certificates/validateCertificatePayload.ts`: validaciones puras, sin red ni DB.
- `src/libs/certificates/generateCertificatePublicId.ts`: test simple de formato/longitud, con cautela por aleatoriedad.
- `src/libs/auth/passwordReset.ts`: `createPasswordResetToken` y `hashPasswordResetToken` son puros; `resetPasswordWithToken` requiere mocks de Prisma y bcrypt.
- `src/libs/auth/emailVerification.ts`: `createVerificationToken` y `hashVerificationToken` son puros; `verifyEmailToken` requiere mock de Prisma.
- `src/libs/utils.ts`: `cn`, aunque aporta poco valor porque solo integra `clsx` y `tailwind-merge`.
- `src/libs/auth/requireAdminSession.ts`: buen primer test de server helper con `getServerSession` mockeado.
- `src/components/Buttons/SignOutMenuButton.tsx`: componente pequeno con mock de `next-auth/react`.
- `src/hooks/useMedia.ts`: hook cliente simple con `window.innerWidth` y resize.

No recomendados como primeros tests:

- `src/app/(front)/auth/login/page.tsx`, porque mezcla NextAuth, router, session update, motion, formulario y UI.
- Route handlers de auth completos, porque requieren mocks de Prisma, bcrypt, email y Request/NextResponse.
- Componentes con Leaflet, ReactPlayer, canvas, archivos o embeds externos.

## Confirmacion de alcance

Confirmado: el primer objetivo debe ser validar el entorno de test, no testear autenticacion todavia.

La fase 2 deberia limitarse a instalar dependencias. La fase 3-6 deberia crear un test minimo de entorno que pruebe TypeScript, React Testing Library, `jest-dom`, `user-event` y alias `@/*` sin tocar base de datos, red, NextAuth ni servicios externos.

La autenticacion deberia abordarse recien despues, empezando por helpers puros y luego por piezas con mocks controlados.

## Riesgos detectados para fases siguientes

- `git status` no pudo ejecutarse por `dubious ownership`; Git pide agregar el repo a `safe.directory`. No se cambio configuracion global durante esta fase.
- Hay texto con caracteres mojibake visibles en consola en varios archivos y en el plan; puede ser solo salida de PowerShell, pero conviene revisar encoding si aparece en navegador/build.
- Tests jsdom que importen modulos server-only pueden fallar si arrastran `src/libs/db.ts`, Prisma o NextAuth server.
- La configuracion inicial con `environment: "jsdom"` sirve para validar componentes, pero los helpers server/auth probablemente convengan en `node` mas adelante.
- Login importa `framer-motion`, mientras `package.json` lista `motion`. Si esto no estuviera resuelto transitivamente, puede impactar build/tests al importar esa pagina.
- APIs de navegador como clipboard, matchMedia, canvas, FileReader y URL APIs no deberian mockearse globalmente hasta que un test concreto lo necesite.
