# Fase 1: invalidaciones centralizadas

Fecha: 2026-07-19

## Objetivo

Implementar la Fase 1 del plan `doc/cache/plan/plan-migracion-cache-components.md`: corregir invalidaciones actuales e introducir una capa centralizada antes de migrar a `cacheComponents`.

No se implemento cache real, no se activo `cacheComponents`, no se agrego `revalidateTag`, `updateTag`, `"use cache"` ni `unstable_cache`.

## Cambios realizados

### Helpers nuevos

- `src/libs/cache/revalidation.ts`
  - Nuevo helper central para invalidaciones por dominio:
    - `revalidateNewsViews(newsId?)`
    - `revalidateCourseViews(courseId?)`
    - `revalidateDonationCampaignViews(campaignId?)`
- `src/libs/cache/cacheTags.ts`
  - Nombres de etiquetas preparados para fases futuras:
    - noticias;
    - cursos;
    - campanas de donacion;
    - donaciones publicas por campana.
  - Estas etiquetas todavia no se usan para cache real.

### Noticias

Archivos modificados:

- `src/app/api/news/route.ts`
- `src/app/api/news/[id]/route.ts`

Cambios:

- Se reemplazo el uso directo de `revalidatePath` por `revalidateNewsViews`.
- Se corrigio la invalidacion incorrecta de `/api/lastThreeNews`.
- Ahora se invalida la ruta real `/api/news/lastThreeNews`.
- Al crear una noticia se invalidan:
  - `/`
  - `/noticias`
  - `/api/news`
  - `/api/news/lastThreeNews`
  - `/api/news/{id}`
- Al editar o eliminar una noticia por id ahora tambien se invalidan las vistas publicas afectadas.

### Cursos

Archivos modificados:

- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`

Cambios:

- Se reemplazo el uso directo de `revalidatePath` por `revalidateCourseViews`.
- Al crear o actualizar desde `/api/courses` se invalidan:
  - `/capacitaciones`
  - `/api/courses`
  - `/capacitaciones/{id}`
  - `/api/courses/{id}`
- Al editar o eliminar desde `/api/courses/[id]` ahora tambien se invalidan las vistas afectadas.

### Donaciones y campanas

Archivos modificados:

- `src/app/api/donations/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/amount/route.ts`
- `src/app/api/admin/donations/[id]/reopen/route.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`

Cambios:

- Se eliminaron helpers locales duplicados de invalidacion.
- Se reemplazaron llamadas directas a `revalidatePath` por `revalidateDonationCampaignViews`.
- Las operaciones que afectan una campana ahora invalidan:
  - `/quiero-ser-parte`
  - `/campanas-dea`
  - `/api/donation-campaigns`
  - `/api/donation-campaigns/current`
  - `/api/donation-campaigns/{campaignId}/donors`, cuando hay id de campana.

## Tests actualizados

Archivo modificado:

- `src/test/donations/public-donations-route.test.ts`

Cambios:

- Se agrego verificacion de que una solicitud rechazada por incluir `amount` no ejecuta invalidaciones.
- Se agrego verificacion de las rutas nuevas invalidadas:
  - `/campanas-dea`
  - `/api/donation-campaigns`

## Archivos creados

- `src/libs/cache/cacheTags.ts`
- `src/libs/cache/revalidation.ts`
- `doc/cache/reports-plan-migracion-cache-components/fase-1-invalidaciones-centralizadas.md`

## Archivos modificados

- `src/app/api/news/route.ts`
- `src/app/api/news/[id]/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`
- `src/app/api/donations/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/amount/route.ts`
- `src/app/api/admin/donations/[id]/reopen/route.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/test/donations/public-donations-route.test.ts`

## Verificacion ejecutada

- `npm test -- src/test/donations/public-donations-route.test.ts`
  - Resultado: paso.
  - Nota: el primer intento fallo por `EPERM` del sandbox al resolver la ruta `C:\Users\PC Franco`; se repitio con permisos escalados y paso.
- `npm run test:run`
  - Resultado: paso.
  - 27 archivos de test, 112 tests.
- `npm run build`
  - Resultado: paso.
  - Se mantiene el warning previo de Turbopack sobre tracing de `next.config.ts` desde Prisma. No fue introducido por esta fase.

## Estado final

La Fase 1 queda completada.

Las invalidaciones actuales estan centralizadas y corregidas, sin introducir cache real ni acoplar el proyecto a `unstable_cache`. El proyecto queda mejor preparado para la fase siguiente de blindaje de contenido privado/critico antes de activar `cacheComponents`.
