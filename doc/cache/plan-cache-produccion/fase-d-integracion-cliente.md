# Fase D - Integracion cliente y estado administrativo

Fecha: 2026-07-20

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Revisar y ajustar la integracion cliente despues de implementar cache real para noticias y cursos, sin cambiar UX, sin migrar paginas a Server Components y sin introducir `router.refresh()` de forma general.

## Archivos revisados

- `src/context/NewsContext.tsx`
- `src/context/CourseContext.tsx`
- `src/components/Dashboard/News/FormCreateNews.tsx`
- `src/components/Dashboard/News/NewsCard.tsx`
- `src/components/Dashboard/Courses/FormCreateCourse.tsx`
- `src/components/Dashboard/Courses/CourseCard.tsx`
- `src/app/(front)/dashboard/noticias/page.tsx`
- `src/app/(front)/dashboard/cursos/page.tsx`
- `src/app/(front)/noticias/page.tsx`
- `src/app/(front)/capacitaciones/page.tsx`
- `src/app/(front)/capacitaciones/[id]/page.tsx`
- `src/components/Box3Home/BoxTresHome.tsx`
- `src/app/api/news/get-all/route.ts`
- `src/app/api/courses/get-all/route.ts`

## Problemas encontrados

- Los dashboards de noticias y cursos reutilizaban los loaders publicos de los contextos. Despues de cachear `/api/news` y `/api/courses`, eso mezclaba lectura administrativa con lectura publica cacheada.
- Las mutaciones actualizaban estado con closures como `setNews([...news, item])` y `setCourses([...courses, item])`. En mutaciones consecutivas o con estado retenido por providers globales, eso podia conservar una version anterior del arreglo.
- Al eliminar un item no se limpiaba `selectedNews` o `selectedCourse` si el elemento eliminado estaba seleccionado.
- `GET /api/courses/get-all` no incluia `lessons`, aunque el dashboard de cursos necesita lecciones para editar y mostrar detalle administrativo.
- No se encontraron `cache: "no-store"` en fetches publicos de noticias o cursos que bloqueen el beneficio de los helpers cacheados.

## Cambios realizados

- `NewsContext`:
  - Se agrego `loadAdminNews(page)`.
  - `loadAdminNews` usa `/api/news/get-all` con `{ cache: "no-store" }`.
  - Mantiene paginacion administrativa en cliente con page size `6`.
  - `loadNews` mantiene `/api/news` para lectura publica cacheada.
  - `createNews`, `updateNews` y `deleteNews` ahora usan setters funcionales.
  - `deleteNews` limpia `selectedNews` si corresponde.
  - Las mutaciones solo modifican estado despues de `res.ok`.

- `CourseContext`:
  - Se agrego `loadAdminCourses()`.
  - `loadAdminCourses` usa `/api/courses/get-all` con `{ cache: "no-store" }`.
  - `loadCourses` mantiene `/api/courses` para lectura publica cacheada.
  - `createCourse`, `updateCourse` y `deleteCourse` ahora usan setters funcionales.
  - `deleteCourse` limpia `selectedCourse` si corresponde.
  - Las mutaciones solo modifican estado despues de `res.ok`.

- Dashboards:
  - `/dashboard/noticias` usa `loadAdminNews(currentPage)`.
  - `/dashboard/cursos` usa `loadAdminCourses()` y conserva la paginacion local existente.

- API administrativa de cursos:
  - `/api/courses/get-all` ahora devuelve cursos ordenados por `createdAt desc` e incluye `lessons`.

## Refetch y router.refresh

- Se agrego refetch administrativo explicito solo en la carga de dashboards:
  - `loadAdminNews(page)`
  - `loadAdminCourses()`
- No se agrego `router.refresh()`.
- Justificacion: las rutas afectadas son Client Components que consumen APIs; no hay una navegacion RSC concreta que requiera refrescar payload de Server Components.

## Fetches no-store

Agregados:

- `/api/news/get-all` en `NewsContext`, por ser lectura administrativa.
- `/api/courses/get-all` en `CourseContext`, por ser lectura administrativa.

Conservados sin `no-store`:

- `/api/news`
- `/api/news/lastThreeNews`
- `/api/courses`
- `/api/courses/[id]`

Justificacion: son fetches publicos que deben poder beneficiarse de los helpers cacheados con `"use cache"`.

## Tests agregados

- `src/test/news/newsContext.test.tsx`
- `src/test/courses/courseContext.test.tsx`

Cobertura:

- Carga administrativa con `{ cache: "no-store" }`.
- Mutacion fallida sin cambio de estado local.
- Mutacion exitosa actualizando estado local.
- Paginacion administrativa de noticias.

## Validacion ejecutada

### Tests especificos

```txt
npm run test:run -- src/test/news/newsContext.test.tsx src/test/courses/courseContext.test.tsx
```

Resultado:

```txt
Test Files  2 passed (2)
Tests       6 passed (6)
```

### Suite completo

```txt
npm run test:run
```

Resultado:

```txt
Test Files  33 passed (33)
Tests       131 passed (131)
```

### Build

```txt
npm run build
```

Resultado: exitoso.

Observacion persistente:

```txt
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list
```

Es el warning ya observado de Prisma/Turbopack y no bloqueo la fase.

## Checklist manual

- Admin edita un curso y abre `/capacitaciones/{id}` en la misma pestana.
- Admin edita un curso y abre `/capacitaciones/{id}` en una pestana nueva.
- Admin elimina un curso y verifica que `/capacitaciones/{id}` no siga mostrando el detalle anterior.
- Admin crea un curso y verifica que aparece en `/dashboard/cursos` y `/capacitaciones`.
- Admin publica una noticia y abre `/`, `/noticias` y el listado del dashboard.
- Admin edita una noticia y verifica home/listado despues de navegacion cliente.
- Probar back/forward despues de crear, editar y eliminar noticias.
- Probar back/forward despues de crear, editar y eliminar cursos.
- Abrir paginas publicas previamente visitadas despues de una mutacion administrativa.
- Repetir los flujos en pestana nueva.
- Repetir los flujos en modo incognito.
- Confirmar que una mutacion fallida no cambia el item visible en dashboard.

## Riesgos pendientes

- Validar en Vercel Preview que `revalidateTag(..., "max")` desde Route Handlers invalida las lecturas publicas cacheadas con el timing esperado.
- Validar Router Cache real con navegacion back/forward en navegador, porque no queda completamente cubierto por tests unitarios.
- Confirmar manualmente que `CourseContext` no conserva un curso eliminado si el usuario tenia abierto el detalle publico antes de la eliminacion.
- Revisar en una fase posterior si conviene migrar detalle/listado publico de cursos a Server Components; queda fuera de esta fase.

## Fuera de alcance

- No se agrego `router.refresh()`.
- No se cambio la estrategia de tags, `cacheLife` ni helpers cacheados.
- No se tocaron donaciones, certificados, campanas, perfil, dashboard general ni autenticacion.
- No se agrego React Query, SWR ni otra libreria de estado.
- No se migro ninguna pagina a Server Components.
