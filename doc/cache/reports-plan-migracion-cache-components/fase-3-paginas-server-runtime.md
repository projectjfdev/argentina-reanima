# Fase 3: adaptar paginas Server Components runtime

Fecha: 2026-07-19

## Objetivo

Implementar la Fase 3 del plan `doc/cache/plan/plan-migracion-cache-components.md`: preparar las paginas Server Components que acceden a datos runtime antes de activar `cacheComponents`.

No se activo `cacheComponents`, no se agrego cache real, no se uso `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag`, `updateTag` ni `unstable_cache`.

## Cambios realizados

### Dashboard

Archivo modificado:

- `src/app/(front)/dashboard/layout.tsx`

Cambios:

- El layout dejo de ejecutar `getServerSession` directamente en el componente exportado.
- Se agrego un boundary local de `Suspense`.
- La validacion de sesion y rol admin se movio a `DashboardAuthGate`.
- Se agrego fallback especifico `DashboardAuthFallback`.
- Se mantienen las redirecciones:
  - sin sesion: `/auth/login`;
  - usuario no admin: `/auth/login?error=unauthorized`.

Motivo:

- Preparar el layout administrativo para Cache Components sin envolver toda la app ni cachear datos de sesion.

### Verificacion de email

Archivo modificado:

- `src/app/(front)/auth/verify-email/page.tsx`

Cambios:

- El componente exportado ahora renderiza un boundary local de `Suspense`.
- La lectura de `searchParams` y la ejecucion de `verifyEmailToken` quedaron en `VerifyEmailResult`.
- Se agrego fallback especifico `VerifyEmailFallback`.

Motivo:

- `searchParams` es runtime data bajo Cache Components y el resultado de validacion de token no debe cachearse.

### Validacion publica de certificado

Archivo modificado:

- `src/app/(front)/certificado/validar/[publicId]/page.tsx`

Cambios:

- El componente exportado ahora renderiza un boundary local de `Suspense`.
- La resolucion de `params`, consulta Prisma, `notFound` y generacion de QR quedaron en `ValidateCertificateContent`.
- Se agrego fallback especifico `ValidateCertificateFallback`.
- No se cachea la validacion publica del certificado.

Motivo:

- `params` y Prisma son runtime/no-cache para esta ruta critica.
- Un certificado creado, editado o desactivado debe reflejarse de forma fresca.
- No se debe cachear un 404 si el certificado se consulta antes de existir.

### Mi Perfil

Archivo modificado:

- `src/app/(front)/mi-perfil/page.tsx`

Cambios:

- El componente exportado ahora renderiza un boundary local de `Suspense`.
- La lectura de `getServerSession` y la consulta Prisma de certificados del usuario quedaron en `MiPerfilContent`.
- Se agrego fallback especifico `MiPerfilFallback`.
- No se cachea informacion personalizada del usuario.

Motivo:

- `/mi-perfil` depende de sesion, usuario y certificados asociados.
- No debe compartir respuestas entre usuarios ni depender de cache compartida.

## Archivos modificados

- `src/app/(front)/dashboard/layout.tsx`
- `src/app/(front)/auth/verify-email/page.tsx`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/mi-perfil/page.tsx`

## Archivos creados

- `doc/cache/reports-plan-migracion-cache-components/fase-3-paginas-server-runtime.md`

## Verificacion ejecutada

- `npm run test:run`
  - Resultado: paso.
  - 27 archivos de test, 112 tests.
- `npm run build`
  - Resultado: paso.
  - La clasificacion relevante se mantiene:
    - `/dashboard/*`: dinamicas.
    - `/mi-perfil`: dinamica.
    - `/certificado/validar/[publicId]`: dinamica.
    - `/auth/verify-email`: dinamica.
  - Se mantiene el warning previo de Turbopack sobre tracing de `next.config.ts` desde Prisma. No fue introducido por esta fase.

## Estado final

La Fase 3 queda completada.

Las paginas Server Components sensibles quedaron preparadas con boundaries locales de `Suspense`, manteniendo los accesos runtime en componentes internos y sin cachear datos privados, personalizados o criticos.

La siguiente fase puede enfocarse en revisar Route Handlers bajo el modelo nuevo antes de activar `cacheComponents`.
