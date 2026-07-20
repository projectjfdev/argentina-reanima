# Fase B - Helpers cacheados de noticias

Fecha: 2026-07-19

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Implementar cache real de produccion para las primeras lecturas publicas de noticias usando el modelo actual de Cache Components:

- `"use cache"`
- `cacheTag`
- `cacheLife`
- `revalidateTag`
- `revalidatePath` solo como compatibilidad para rutas concretas ya existentes

No se modificaron cursos, donaciones, campanas, certificados, dashboard, perfil ni APIs administrativas fuera de la invalidacion compartida de cache.

## Decisiones resueltas dentro de la implementacion

### Contrato serializable

Se mantiene el contrato funcional actual de las APIs:

- `GET /api/news`
  - `message`
  - `news`
  - `totalNews`
  - `currentPage`
  - `success`
- `GET /api/news/lastThreeNews`
  - `message`
  - `news`
  - `status`
  - `success`

Las fechas de noticias ahora se serializan explicitamente a strings ISO:

- `dateNew: string | null`
- `createdAt: string`
- `updatedAt: string`

Esto es compatible con el consumo HTTP actual, donde `NextResponse.json` ya serializaba fechas como strings.

### Normalizacion de argumentos

La normalizacion ocurre antes de entrar al scope cacheado para evitar entradas duplicadas por argumentos equivalentes.

Reglas:

- `category`: `trim()`, string vacio si no existe.
- `search`: `trim()`, string vacio si no existe.
- `page`: entero >= 1, fallback `1`.
- `pageSize`: fallback `6`, maximo `24`.
- `latest limit`: fallback `3`, maximo `6`.

### Tags

Se usan tags ya existentes de `src/libs/cache/cacheTags.ts`:

- `news:list`
- `news:latest`
- `news:detail:{id}` queda contemplado para futuro detalle cacheado, pero no hay lectura de detalle cacheada en esta fase.

### cacheLife

Se eligieron perfiles explicitos:

- Listado publico: `{ stale: 300, revalidate: 900, expire: 3600 }`
- Ultimas noticias: `{ stale: 300, revalidate: 300, expire: 3600 }`

La frescura despues de mutaciones no depende solo del tiempo: las mutaciones exitosas llaman invalidacion por tag.

## Cambios realizados

### Nuevo helper de lectura

Archivo creado:

- `src/libs/news/publicNewsQueries.ts`

Incluye:

- `getPublicNews(input)`
- `getLatestPublicNews(limit)`
- `normalizePublicNewsQuery(input)`
- `normalizeLatestNewsLimit(limit)`

Las funciones publicas normalizan argumentos y delegan en funciones internas con `"use cache"`.

### Route Handlers de noticias

Modificados:

- `src/app/api/news/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`

Cambios:

- `GET /api/news` usa `getPublicNews`.
- `GET /api/news/lastThreeNews` usa `getLatestPublicNews`.
- Se retiro `ensureRequestTimeRendering()` de esas dos lecturas porque ahora tienen cache explicita.
- `POST /api/news` conserva la invalidacion centralizada existente.

No se cacheo:

- `GET /api/news/[id]`
- `GET /api/news/get-all`

### Invalidacion

Modificado:

- `src/libs/cache/revalidation.ts`

Se agrego:

- `invalidateNews(newsId?)`

Comportamiento:

- `revalidateTag("news:list", "max")`
- `revalidateTag("news:latest", "max")`
- `revalidateTag("news:detail:{id}", "max")` si hay `id`

`revalidateNewsViews(newsId?)` ahora llama primero a `invalidateNews(newsId?)` y luego mantiene `revalidatePath` para compatibilidad con rutas concretas:

- `/`
- `/noticias`
- `/api/news`
- `/api/news/lastThreeNews`
- `/api/news/{id}` cuando corresponde

Esta combinacion es intencional mientras las superficies publicas siguen mezclando APIs, shells estaticas y estado cliente.

## Tests agregados

Archivos creados:

- `src/test/news/publicNewsQueries.test.ts`
- `src/test/news/newsRevalidation.test.ts`

Cobertura:

- Normalizacion de filtros, pagina, pageSize y limite de ultimas noticias.
- Uso de `cacheLife`.
- Uso de `cacheTag`.
- Serializacion explicita de fechas.
- Query Prisma esperada para listado y ultimas noticias.
- Invalidacion por `revalidateTag`.
- Conservacion de `revalidatePath` en `revalidateNewsViews`.

## Validacion ejecutada

### Tests

Comando:

```txt
npm run test:run
```

Resultado:

```txt
Test Files  29 passed (29)
Tests       118 passed (118)
```

### Build

Comando:

```txt
npm run build
```

Resultado: exitoso.

Observacion relevante del build:

- `/api/news/lastThreeNews` aparece como ruta cacheada/prerenderizada con `Revalidate 5m` y `Expire 1h`.
- `/api/news` sigue como dinamica por depender de `searchParams`, pero la lectura Prisma interna queda cacheada por helper y argumentos normalizados.

Warning persistente:

```txt
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list
Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/app/api/news/[id]/route.ts
```

Es el warning ya documentado de Prisma/Turbopack. No bloqueo la fase.

## Archivos modificados o creados

Creados:

- `src/libs/news/publicNewsQueries.ts`
- `src/test/news/publicNewsQueries.test.ts`
- `src/test/news/newsRevalidation.test.ts`
- `doc/cache/plan-cache-produccion/fase-b-cache-noticias.md`

Modificados:

- `src/app/api/news/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`
- `src/libs/cache/revalidation.ts`

## Fuera de alcance

- Cache de cursos.
- Cache de detalle de noticia.
- Migrar paginas publicas a Server Components.
- Migrar mutaciones a Server Actions.
- Usar `updateTag`.
- Cachear donaciones, campanas, certificados, perfil o dashboard.

## Riesgos y puntos a validar en Preview

- Confirmar que `revalidateTag(..., "max")` desde Route Handlers invalida correctamente las entradas en Vercel.
- Confirmar que el estado cliente de `NewsContext` no muestra datos viejos despues de mutaciones administrativas.
- Medir segunda carga de `/api/news/lastThreeNews` y variantes repetidas de `/api/news`.
- Confirmar que filtros distintos no colisionan en cache.
- Revisar Usage de Vercel, especialmente ISR Reads/Writes.
