# Fase C - Helpers cacheados de cursos

Fecha: 2026-07-20

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Implementar cache real de produccion para lecturas publicas de cursos usando Cache Components:

- `"use cache"`
- `cacheTag`
- `cacheLife`
- `revalidateTag`
- `revalidatePath` solo como compatibilidad para rutas concretas existentes

No se modificaron donaciones, campanas, certificados, dashboard, perfil ni APIs administrativas fuera de la invalidacion compartida de cache.

## Decisiones resueltas dentro de la implementacion

### Contrato serializable

Se mantiene el contrato funcional actual:

- `GET /api/courses`
  - `message`
  - `courses`
  - `totalCourses`
  - `success`
- `GET /api/courses/[id]`
  - `message`
  - `course`
  - `success`

Los cursos ahora se serializan explicitamente:

- `createdAt: string`
- `updatedAt: string`
- `lessons` se conserva como arreglo plano con `id`, `title`, `href` y `courseId`.

Esto mantiene compatibilidad con el consumo HTTP actual, donde JSON ya entregaba fechas como strings.

### Normalizacion de argumentos

La normalizacion ocurre antes del scope cacheado para evitar claves distintas ante argumentos equivalentes.

Reglas:

- `category`: `trim()`, string vacio si no existe.
- `search`: `trim()`, string vacio si no existe.
- `page`: entero >= 1, fallback `1`.
- `pageSize`: fallback `6`, maximo `24`.
- `id`: entero positivo; valores invalidos normalizan a `0` para helper directo, aunque el Route Handler mantiene el `400` para `NaN`.

### Tags

Se usan tags existentes de `src/libs/cache/cacheTags.ts`:

- `courses:list`
- `courses:detail:{id}`

### cacheLife

Perfiles explicitos:

- Listado publico: `{ stale: 300, revalidate: 1800, expire: 7200 }`
- Detalle publico: `{ stale: 300, revalidate: 1800, expire: 86400 }`

La consistencia despues de mutaciones queda cubierta por `revalidateTag(..., "max")`.

## Cambios realizados

### Nuevo helper de lectura

Archivo creado:

- `src/libs/courses/publicCourseQueries.ts`

Incluye:

- `getPublicCourses(input)`
- `getPublicCourseById(id)`
- `normalizePublicCoursesQuery(input)`
- `normalizePublicCourseId(id)`

Las funciones publicas normalizan argumentos y delegan en funciones internas con `"use cache"`.

### Route Handlers de cursos

Modificados:

- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`

Cambios:

- `GET /api/courses` usa `getPublicCourses`.
- `GET /api/courses/[id]` usa `getPublicCourseById`.
- Se retiro `ensureRequestTimeRendering()` de esas lecturas porque ahora tienen cache explicita.
- `POST /api/courses`, `PUT /api/courses`, `PUT /api/courses/[id]` y `DELETE /api/courses/[id]` usan invalidacion centralizada.

No se cacheo:

- `GET /api/courses/get-all`

### Invalidacion

Modificado:

- `src/libs/cache/revalidation.ts`

Se agrego:

- `invalidateCourse(courseId?)`

Comportamiento:

- `revalidateTag("courses:list", "max")`
- `revalidateTag("courses:detail:{id}", "max")` si hay `id`

`revalidateCourseViews(courseId?)` ahora llama primero a `invalidateCourse(courseId?)` y luego mantiene `revalidatePath` para compatibilidad con rutas concretas:

- `/capacitaciones`
- `/api/courses`
- `/capacitaciones/{id}` cuando corresponde
- `/api/courses/{id}` cuando corresponde

## Tests agregados

Archivos creados:

- `src/test/courses/publicCourseQueries.test.ts`
- `src/test/courses/courseRevalidation.test.ts`

Cobertura:

- Normalizacion de filtros, pagina, pageSize e id.
- Uso de `cacheLife`.
- Uso de `cacheTag`.
- Serializacion explicita de fechas.
- Query Prisma esperada para listado y detalle.
- Respuesta `null` para detalle inexistente.
- Invalidacion por `revalidateTag`.
- Conservacion de `revalidatePath` en `revalidateCourseViews`.

## Validacion ejecutada

### Tests

Comando:

```txt
npm run test:run
```

Resultado:

```txt
Test Files  31 passed (31)
Tests       125 passed (125)
```

### Build

Comando:

```txt
npm run build
```

Resultado: exitoso.

Observacion relevante:

- `/api/courses` y `/api/courses/[id]` siguen clasificadas como dinamicas porque dependen de `searchParams`/`params`, pero las lecturas Prisma internas ya delegan en helpers con `"use cache"`.
- `/api/courses/get-all` sigue request-time y fuera de alcance.

Warning persistente:

```txt
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list
```

Es el warning ya documentado de Prisma/Turbopack. No bloqueo la fase.

## Archivos modificados o creados

Creados:

- `src/libs/courses/publicCourseQueries.ts`
- `src/test/courses/publicCourseQueries.test.ts`
- `src/test/courses/courseRevalidation.test.ts`
- `doc/cache/plan-cache-produccion/fase-c-cache-cursos.md`

Modificados:

- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`
- `src/libs/cache/revalidation.ts`

## Fuera de alcance

- Migrar paginas publicas a Server Components.
- Migrar mutaciones a Server Actions.
- Usar `updateTag`.
- Cachear `courses/get-all`.
- Cachear donaciones, campanas, certificados, perfil o dashboard.

## Riesgos y puntos a validar en Preview

- Confirmar que `revalidateTag(..., "max")` desde Route Handlers invalida listado y detalle en Vercel.
- Confirmar que editar lecciones invalida correctamente el detalle.
- Confirmar que eliminar curso no deja detalle anterior visible.
- Confirmar que el estado cliente de `CourseContext` no muestra datos viejos despues de mutaciones administrativas.
- Medir variantes repetidas de `/api/courses` y `/api/courses/[id]`.
- Revisar Usage de Vercel, especialmente ISR Reads/Writes.
