# Fase 5 - Habilitar cacheComponents en rama exclusiva

Fecha: 2026-07-19

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Activar `cacheComponents: true` en una rama exclusiva y resolver los errores mínimos necesarios para que el proyecto compile bajo el modelo nuevo de caché de Next.js 16, sin implementar todavía caché funcional con `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag` ni `updateTag`.

## Cambios realizados en esta fase

### 1. Rama exclusiva

Se creó y utilizó la rama:

```txt
cache-components-phase-5
```

La rama contiene también los cambios pendientes de las fases anteriores porque el árbol de trabajo no estaba commiteado antes de crearla.

### 2. Activación de Cache Components

Se habilitó:

```ts
cacheComponents: true
```

en `next.config.ts`.

### 3. Eliminación de segment config incompatible

El primer `npm run build` con la bandera activa falló porque Next.js 16 no permite `export const dynamic = "force-dynamic"` cuando `cacheComponents` está habilitado.

Se removió ese export de estos Route Handlers:

- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/admin/donations/route.ts`
- `src/app/api/admin/donations/[id]/route.ts`
- `src/app/api/admin/donations/[id]/amount/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/receipt/route.ts`
- `src/app/api/admin/donations/[id]/reject/route.ts`
- `src/app/api/admin/donations/[id]/reopen/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/donations/route.ts`

La intención original de esos exports se conserva con mecanismos compatibles: headers `no-store`, autenticación y renderizado request-time explícito donde aplica.

### 4. Route Handlers dinámicos de request-time

Al activar `cacheComponents`, el build intentó prerenderizar algunos GET handlers. Para evitar que endpoints privados, personalizados o críticos entren en prerender/caché accidental, se usó `ensureRequestTimeRendering()` al inicio de los GET correspondientes.

También se ajustó el helper para que sea no-op bajo Vitest, porque los tests unitarios invocan handlers fuera del request scope real de Next.js.

Archivos ajustados:

- `src/libs/cache/runtime.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/admin/donations/route.ts`
- `src/app/api/admin/donations/[id]/route.ts`
- `src/app/api/admin/donations/[id]/receipt/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`
- `src/app/api/courses/get-all/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/api/news/route.ts`
- `src/app/api/news/[id]/route.ts`
- `src/app/api/news/get-all/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`

Notas:

- En los GET handlers, `ensureRequestTimeRendering()` quedó fuera de `try/catch` para no capturar el bailout interno de Next.
- No se introdujo caché nueva para noticias o cursos. Esos endpoints quedan dinámicos por ahora hasta la fase posterior dedicada a `"use cache"`.

### 5. Suspense para `/capacitaciones/[id]`

El build falló con:

```txt
Route "/capacitaciones/[id]": Uncached data was accessed outside of <Suspense>
```

La página `src/app/(front)/capacitaciones/[id]/page.tsx` era un Client Component que llamaba `useParams()` directamente en el componente exportado.

Se separó en:

- `CourseDetailFallback`
- `CapacitacionPorIdContent`
- `CapacitacionPorId`, que envuelve el contenido con `<Suspense>`

Esto deja el acceso a `useParams()` dentro de un límite explícito sin cambiar el flujo de carga ni la obtención cliente del curso.

## Archivos modificados o creados en Fase 5

Modificados:

- `next.config.ts`
- `src/libs/cache/runtime.ts`
- `src/app/(front)/capacitaciones/[id]/page.tsx`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/admin/donations/route.ts`
- `src/app/api/admin/donations/[id]/route.ts`
- `src/app/api/admin/donations/[id]/amount/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/receipt/route.ts`
- `src/app/api/admin/donations/[id]/reject/route.ts`
- `src/app/api/admin/donations/[id]/reopen/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`
- `src/app/api/courses/get-all/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/donations/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/api/news/route.ts`
- `src/app/api/news/[id]/route.ts`
- `src/app/api/news/get-all/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`

Creado:

- `doc/cache/reports-plan-migracion-cache-components/fase-5-cache-components-rama-exclusiva.md`

## Validación ejecutada

### Build de producción

Comando:

```txt
npm run build
```

Resultado: exitoso.

El build reporta:

- `Cache Components enabled`
- 48 páginas generadas
- Route Handlers API clasificados como dinámicos `ƒ`
- rutas con contenido dinámico bajo Partial Prerendering `◐`:
  - `/auth/verify-email`
  - `/capacitaciones/[id]`
  - `/certificado/validar/[publicId]`
  - `/dashboard`
  - `/dashboard/campanas-dea`
  - `/dashboard/certificados`
  - `/dashboard/cursos`
  - `/dashboard/noticias`
  - `/mi-perfil`

Advertencia persistente:

```txt
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list
Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/app/api/news/route.ts
```

Esta advertencia ya no bloquea la migración de Fase 5, pero debe investigarse antes o durante la validación de Vercel Preview porque puede indicar trazado excesivo del proyecto por Prisma/Turbopack.

### Tests

Comando:

```txt
npm run test:run
```

Resultado: exitoso.

```txt
Test Files  27 passed (27)
Tests       112 passed (112)
```

## Riesgos y pendientes

- La rama contiene cambios acumulados de Fases 1 a 5 sin commit; antes de PR conviene revisar el diff completo o separar commits por fase.
- `ensureRequestTimeRendering()` ahora es no-op en tests unitarios. Esto es intencional para Vitest, pero la garantía real de request-time debe seguir validándose con `npm run build` y Vercel Preview.
- No se validaron flujos manuales en navegador ni Vercel Preview en esta fase.
- La advertencia de Turbopack/NFT debe revisarse porque puede afectar trazado, tamaño o comportamiento de funciones en Vercel.
- Noticias y cursos siguen dinámicos durante esta fase. La caché con `"use cache"` debe implementarse después, en una fase separada.

## Criterios de aceptación cubiertos

- `cacheComponents: true` queda habilitado.
- El build de producción pasa con Cache Components activo.
- Se removieron configuraciones `dynamic` incompatibles.
- Los endpoints privados, personalizados y críticos no quedan prerenderizados.
- No se introdujo caché real para donaciones, certificados, noticias ni cursos.
- La suite automatizada pasa.
- La migración queda lista para validación manual y Deploy Preview.

## Próximo paso recomendado

Ejecutar Fase 6 con foco en validación funcional local y Vercel Preview:

- login/logout y sesión expirada;
- dashboard completo;
- certificados públicos y administrativos;
- donaciones críticas;
- navegación cliente después de mutaciones;
- revisión de logs y advertencia Turbopack/NFT.
