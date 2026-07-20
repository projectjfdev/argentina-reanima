# Fase 4: revisar Route Handlers bajo el modelo nuevo

Fecha: 2026-07-19

## Objetivo

Implementar la Fase 4 del plan `doc/cache/plan/plan-migracion-cache-components.md`: revisar Route Handlers pensando en el modelo de Cache Components y preparar los endpoints criticos para que no dependan solo de `dynamic = "force-dynamic"`.

No se activo `cacheComponents`, no se agrego cache real, no se uso `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag`, `updateTag` ni `unstable_cache`.

## Cambios realizados

### Helper runtime explicito

Archivo creado:

- `src/libs/cache/runtime.ts`

Se agrego:

- `ensureRequestTimeRendering()`

Este helper encapsula `connection()` de `next/server` para indicar explicitamente que un handler debe ejecutarse en request-time.

Motivo:

- Con Cache Components, los `GET` Route Handlers siguen el mismo modelo de prerender/runtime que las rutas UI.
- Las configs de segmento como `dynamic = "force-dynamic"` quedan deshabilitadas o deprecadas bajo `cacheComponents`.
- `connection()` evita que endpoints publicos criticos basados en Prisma puedan ser prerenderizados accidentalmente.

### Endpoints publicos criticos

Archivos modificados:

- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`

Cambios:

- Se agrego `await ensureRequestTimeRendering()` al inicio de los `GET`.
- No se cambio la logica de negocio.
- No se cachearon consultas Prisma.
- Se mantiene la frescura para:
  - campana actual;
  - total recaudado;
  - porcentaje de campana;
  - listado publico de campanas;
  - listado publico de donantes;
  - validacion publica de certificados.

## Decision sobre otros Route Handlers

### APIs administrativas

No se agrego `connection()` manualmente en todos los handlers admin en esta fase porque:

- Ya estan protegidos por `requireAdminSession`, que usa `getServerSession`.
- En la Fase 2 quedaron cubiertos por headers `Cache-Control: no-store`.
- Sus `GET` dependen de sesion/request runtime.
- Agregar `connection()` en todos seria redundante en esta etapa.

Quedan igualmente clasificadas como rutas que deben permanecer siempre dinamicas/no-store.

### Noticias y cursos

No se agrego `connection()` ni cache real en:

- `src/app/api/news/**`
- `src/app/api/courses/**`

Motivo:

- Son los primeros candidatos futuros a cache con `"use cache"`, `cacheTag` y `cacheLife`.
- En esta migracion se evita acoplarlos a una solucion temporal si no es necesario.
- Si al activar `cacheComponents` el build detecta algun caso problematico, se resolvera en la fase de activacion controlada sin introducir `unstable_cache`.

### Configuraciones `dynamic = "force-dynamic"`

No se eliminaron en esta fase.

Motivo:

- La limpieza de configuraciones incompatibles/deprecadas esta prevista en la Fase 6.
- Mientras `cacheComponents` no esta activo, esas configs siguen expresando el comportamiento actual.
- Removerlas antes de activar y validar la bandera mezclaria dos cambios conceptuales.

## Archivos creados

- `src/libs/cache/runtime.ts`
- `doc/cache/reports-plan-migracion-cache-components/fase-4-route-handlers-modelo-nuevo.md`

## Archivos modificados

- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`

## Verificacion ejecutada

- `npm run test:run`
  - Resultado: paso.
  - 27 archivos de test, 112 tests.
- `npm run build`
  - Resultado: paso.
  - La clasificacion relevante se mantiene:
    - `/api/donation-campaigns`: dinamica.
    - `/api/donation-campaigns/current`: dinamica.
    - `/api/donation-campaigns/[id]/donors`: dinamica.
    - `/api/certificates/validate/[publicId]`: dinamica.
  - Se mantiene el warning previo de Turbopack sobre tracing de `next.config.ts` desde Prisma. No fue introducido por esta fase.

## Estado final

La Fase 4 queda completada.

Los Route Handlers publicos criticos que no deben cachearse quedaron preparados con request-time rendering explicito. Las APIs privadas ya estaban blindadas por sesion y headers no-store desde fases anteriores.

La siguiente fase puede activar `cacheComponents` en una rama/fase exclusiva y resolver errores de build de forma controlada.
