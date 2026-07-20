# Plan actualizado: cache de produccion con Cache Components

Fecha de actualizacion: 2026-07-19.

Este documento reemplaza el plan original de cache de produccion a la luz del estado real posterior a las Fases 1 a 7 de migracion a Cache Components.

La aplicacion ya usa Next.js 16.2.10 con App Router, Prisma, PostgreSQL y `cacheComponents: true`. El objetivo ahora no es migrar el modelo base, sino implementar cache real de produccion de forma incremental y segura.

## Fuentes verificadas

- Next.js Cache Components: `cacheComponents: true` habilita el modelo actual de `"use cache"`, `cacheTag` y `cacheLife`. Fuente: https://nextjs.org/docs/app/api-reference/functions/cacheTag
- Next.js Revalidating: con Cache Components la revalidacion se hace con `cacheLife`, `revalidateTag`, `updateTag` y `revalidatePath`; `updateTag` esta orientado a Server Actions. Fuente: https://nextjs.org/docs/app/getting-started/revalidating
- Next.js 16 upgrade: `revalidateTag(tag, "max")` marca datos como stale y `updateTag` da read-your-writes en Server Actions. Fuente: https://nextjs.org/docs/app/guides/upgrading/version-16
- Vercel Hobby: incluye limites de uso como Function Invocations, Function Duration, ISR Reads/Writes y Deployments. Fuente: https://vercel.com/docs/plans/hobby
- Vercel ISR usage/pricing: los reads/writes de ISR se miden como uso regional; conviene evitar invalidaciones amplias innecesarias. Fuente: https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing

## Estado actual del repositorio

### Implementado

- `next.config.ts`
  - `cacheComponents: true` habilitado.
  - Headers `Cache-Control: no-store, max-age=0`, `Pragma: no-cache` y `Expires: 0` para APIs privadas o criticas.
- `src/libs/cache/cacheTags.ts`
  - Convencion inicial de tags para noticias, cursos, campanas y donaciones.
  - Todavia no se usan con `cacheTag`.
- `src/libs/cache/revalidation.ts`
  - Centraliza invalidaciones actuales con `revalidatePath`:
    - `revalidateNewsViews(newsId?)`
    - `revalidateCourseViews(courseId?)`
    - `revalidateDonationCampaignViews(campaignId?)`
- `src/libs/cache/runtime.ts`
  - `ensureRequestTimeRendering()` usa `connection()` para forzar request-time rendering en lecturas que no deben cachearse todavia.
- Rutas sensibles adaptadas con boundaries locales de `Suspense`:
  - `/auth/verify-email`
  - `/capacitaciones/[id]`
  - `/certificado/validar/[publicId]`
  - `/dashboard/*`
  - `/mi-perfil`
- APIs criticas y privadas blindadas con `no-store`:
  - `/api/admin/*`
  - `/api/auth/*`
  - `/api/me/certificates`
  - `/api/certificates*`
  - `/api/donation-campaigns*`
  - `/api/donations`
- Fetches cliente criticos con `cache: "no-store"`:
  - donaciones publicas;
  - campanas DEA;
  - dashboard de donaciones;
  - dashboard de certificados.
- Validacion local Fase 7:
  - `npm run build` exitoso con Cache Components.
  - `next start` probado localmente.
  - `npm run test:run`: 27 archivos, 112 tests pasados.

### Obsoleto del plan anterior

Quedan eliminadas como estrategia:

- cualquier arquitectura basada en APIs de cache previas a Cache Components;
- usar configuraciones de ruta heredadas como mecanismo de frescura o cache;
- planificar una migracion base a Cache Components como tarea pendiente;
- agregar headers `no-store` como tarea inicial general, porque ya esta hecho para las superficies criticas detectadas;
- corregir invalidaciones basicas de noticias/cursos/campanas como si siguieran dispersas, porque ya fueron centralizadas.

### Pendiente real

- Implementar cache real solo para los primeros candidatos:
  - listado publico de noticias;
  - ultimas noticias de la home;
  - listado publico de cursos;
  - detalle publico de curso.
- Extraer lecturas publicas Prisma a helpers de dominio cacheables.
- Reemplazar `ensureRequestTimeRendering()` en esas lecturas puntuales cuando pasen a `"use cache"`.
- Agregar `cacheTag` y `cacheLife` dentro de los helpers cacheados.
- Cambiar invalidacion de noticias/cursos para que use `revalidateTag` despues de mutaciones exitosas.
- Mantener `revalidatePath` solo cuando el artefacto afectado sea una ruta concreta que no quede cubierta por tags.
- Validar en Vercel Preview antes de produccion.

## Clasificacion de datos

| Area                                 | Frescura requerida                                                                             | Lectura    | Escritura | Decision actual                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------- | --------- | ---------------------------------- |
| Noticias publicas                    | Deben reflejar cambios admin de forma predecible; toleran stale breve para visitantes anonimos | Alta       | Baja      | Primer candidato a cache.          |
| Ultimas noticias home                | Alta lectura, cambia al publicar/editar fecha/eliminar                                         | Alta       | Baja      | Primer candidato a cache.          |
| Cursos publicos                      | Alta lectura, cambios admin poco frecuentes                                                    | Media/alta | Baja      | Primer candidato a cache.          |
| Detalle publico de curso             | Puede ser pesado por lecciones/video metadata                                                  | Media      | Baja      | Primer candidato a cache por `id`. |
| Dashboard                            | Siempre fresco y privado                                                                       | Media      | Alta      | No cache compartida.               |
| APIs administrativas                 | Privadas, dependen de sesion/rol                                                               | Media      | Alta      | No cache compartida.               |
| Perfil y certificados del usuario    | Personalizado por sesion                                                                       | Baja/media | Media     | No cache compartida.               |
| Validacion publica de certificados   | Debe ser inmediata, no cachear 404/410 sin garantia                                            | Media      | Media     | No cachear inicialmente.           |
| Donaciones/campanas/totales/donantes | Critico, agregado, sensible a mutaciones                                                       | Media/alta | Media     | No cachear inicialmente.           |
| Comprobantes                         | Privado, signed URLs, TTL corto                                                                | Baja       | Media     | No cache compartida.               |
| Institucional hardcodeado            | Cambia por deploy                                                                              | Baja       | Baja      | SSG/shell actual suficiente.       |

## Capas de cache relevantes

- Cache Components: sera la capa de datos para helpers publicos con `"use cache"`.
- Tags de Next: `cacheTag` dentro de helpers cacheados; `revalidateTag` despues de mutaciones en Route Handlers.
- `cacheLife`: tiempo de vida por helper cacheado.
- `revalidatePath`: solo para rutas concretas cuando cambie un artefacto HTML/RSC no cubierto por tags.
- Route rendering / Partial Prerendering: ya esta habilitado por `cacheComponents`.
- Router Cache del cliente: puede conservar payloads o estado React; las mutaciones hechas por Route Handlers no limpian por si solas el estado cliente.
- CDN/Vercel: servira artefactos estaticos y cache persistente/ISR asociado al modelo de Next; hay que medir writes/reads.
- Navegador/HTTP: criticos y privados ya tienen `no-store`; no usar headers cacheables para datos privados.
- Prisma: no se cachea automaticamente. Solo queda cacheado cuando una lectura se extrae a un helper con `"use cache"`.
- Estado cliente: Context API y `useState`; no hay React Query/SWR.

## Estrategia recomendada

### Principios

1. Cachear solo lecturas publicas de alta lectura y baja escritura.
2. No cachear areas privadas, personalizadas o criticas sin evidencia y sin matriz de invalidacion exhaustiva.
3. Mantener helpers chicos y especificos por dominio.
4. Poner `"use cache"`, `cacheTag` y `cacheLife` dentro de helpers de lectura, no dispersos en Route Handlers.
5. Ejecutar invalidacion solo despues de que Prisma y operaciones externas necesarias hayan terminado correctamente.
6. Con mutaciones en Route Handlers, usar `revalidateTag`. Reservar `updateTag` para Server Actions concretas si en el futuro se migran.
7. Usar `revalidatePath` como complemento, no como mecanismo principal para datos compartidos.
8. Retirar `ensureRequestTimeRendering()` solo de los GET que queden cubiertos por cache explicita.

### Alcance inicial de cache real

Implementar cache para:

- `GET /api/news`
- `GET /api/news/lastThreeNews`
- `GET /api/courses`
- `GET /api/courses/[id]`

Mantener request-time/no-store o sin cache de negocio:

- `/api/news/get-all` y `/api/courses/get-all`, salvo que se confirme uso publico real;
- certificados;
- donaciones;
- campanas;
- perfil;
- dashboard;
- auth;
- APIs admin.

## Helpers recomendados

### Noticias

Archivo futuro:

```txt
src/libs/news/publicNewsQueries.ts
```

Funciones:

- `getPublicNews({ category, search, page, pageSize })`
- `getLatestPublicNews(limit)`
- opcional futuro: `getPublicNewsById(id)` solo si aparece una pagina publica real de detalle.

Normalizacion de argumentos:

- `category`: `trim()`, string vacio si no hay filtro.
- `search`: `trim()`, string vacio si no hay busqueda.
- `page`: entero >= 1.
- `pageSize`: entero acotado, inicialmente 6.
- `limit`: entero acotado, inicialmente 3.

Resultado serializable:

- Convertir `Date` a ISO string.
- No devolver instancias Prisma especiales.
- Mantener shape compatible con respuestas actuales:
  - `news`
  - `totalNews`
  - `currentPage`
  - `success`

Tags minimos:

- `cacheTags.news.list`
- `cacheTags.news.latest`
- `cacheTags.news.detail(id)` solo si se cachea detalle.

`cacheLife` recomendado:

- Listado: perfil corto o medio. Inicio conservador: 5 a 15 minutos.
- Ultimas noticias: perfil corto. Inicio conservador: 5 minutos.

La frescura despues de mutaciones la da `revalidateTag`, no el TTL.

### Cursos

Archivo futuro:

```txt
src/libs/courses/publicCourseQueries.ts
```

Funciones:

- `getPublicCourses({ category, search, page, pageSize })`
- `getPublicCourseById(id)`

Normalizacion de argumentos:

- `category`: `trim()`, string vacio si no hay filtro.
- `search`: `trim()`, string vacio si no hay busqueda.
- `page`: entero >= 1.
- `pageSize`: entero acotado, inicialmente 6.
- `id`: entero positivo.

Resultado serializable:

- Convertir `createdAt` y `updatedAt` a ISO string.
- Incluir `lessons` con campos planos.
- No devolver `Date` crudos.

Tags minimos:

- `cacheTags.courses.list`
- `cacheTags.courses.detail(id)`

`cacheLife` recomendado:

- Listado: 15 a 30 minutos.
- Detalle: 30 minutos o mas, porque cambia con menor frecuencia.

La invalidacion al editar/eliminar/publicar curso debe expirar tags de listado y detalle puntual.

## Convencion de invalidacion

Mantener `src/libs/cache/revalidation.ts`, pero evolucionarlo sin crear una abstraccion grande.

Estado actual:

- `revalidateNewsViews(newsId?)` usa `revalidatePath`.
- `revalidateCourseViews(courseId?)` usa `revalidatePath`.
- `revalidateDonationCampaignViews(campaignId?)` usa `revalidatePath`.

Evolucion recomendada:

- Agregar helpers semanticos para datos cacheados:
  - `invalidateNews(newsId?)`
  - `invalidateCourse(courseId?)`
- Internamente:
  - usar `revalidateTag` para datos con `cacheTag`;
  - conservar `revalidatePath` solo para shells/rutas concretas cuando haya dependencia real.

No reemplazar inmediatamente las invalidaciones de donaciones/campanas con tags porque esas areas no se cachean.

## Uso justificado de revalidatePath

Con Cache Components, `revalidatePath` sigue siendo util cuando la dependencia es una ruta concreta o cuando se quiere invalidar shell/artefacto de pagina.

Mantenerlo o evaluarlo en:

- `/`: si en el futuro la home consume `getLatestPublicNews()` desde Server Components cacheados.
- `/noticias`: si el listado pasa a Server Component o si se quiere refrescar shell relacionada.
- `/capacitaciones`: si el listado pasa a Server Component.
- `/capacitaciones/[id]`: si el detalle deja de ser puramente cliente y la pagina contiene datos RSC cacheados.

No usarlo como sustituto de tags para:

- variantes filtradas/paginadas de noticias;
- variantes filtradas/paginadas de cursos;
- ultimas noticias compartidas entre home y API;
- detalle de curso por `id`.

## updateTag y Server Actions

Estado actual: las mutaciones principales son Route Handlers.

Decision:

- No migrar masivamente a Server Actions.
- Usar `revalidateTag` desde Route Handlers para noticias/cursos.
- No usar `updateTag` mientras las mutaciones sigan en Route Handlers.

Caso concreto que podria justificar Server Action futura:

- Crear/editar curso o noticia desde dashboard si se decide renderizar el dashboard con RSC y se necesita read-your-own-writes inmediato sin depender de refetch cliente.

No justifica Server Action ahora:

- donaciones con comprobantes;
- certificados bulk;
- comprobantes/signed URLs;
- auth.

## Matriz de lecturas cacheables

| Lectura          | Archivo actual                            | Helper futuro         | Tags                  | `cacheLife` inicial | Cambio al implementar                                                       |
| ---------------- | ----------------------------------------- | --------------------- | --------------------- | ------------------- | --------------------------------------------------------------------------- |
| Listado noticias | `src/app/api/news/route.ts`               | `getPublicNews`       | `news:list`           | 5-15 min            | Quitar `ensureRequestTimeRendering()` del GET y delegar en helper cacheado. |
| Ultimas noticias | `src/app/api/news/lastThreeNews/route.ts` | `getLatestPublicNews` | `news:latest`         | 5 min               | Quitar `ensureRequestTimeRendering()` del GET y delegar en helper cacheado. |
| Listado cursos   | `src/app/api/courses/route.ts`            | `getPublicCourses`    | `courses:list`        | 15-30 min           | Quitar `ensureRequestTimeRendering()` del GET y delegar en helper cacheado. |
| Detalle curso    | `src/app/api/courses/[id]/route.ts`       | `getPublicCourseById` | `courses:detail:{id}` | 30 min              | Quitar `ensureRequestTimeRendering()` del GET y delegar en helper cacheado. |

## Matriz de mutaciones e invalidaciones

| Mutacion                          | Archivo actual                                                       | Datos obsoletos                              | Invalidacion futura                                                    | `revalidatePath`                                                                       |
| --------------------------------- | -------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Crear noticia                     | `src/app/api/news/route.ts`                                          | listado, ultimas noticias                    | `revalidateTag(news:list, "max")`, `revalidateTag(news:latest, "max")` | `/` y `/noticias` solo si contienen RSC cacheado dependiente.                          |
| Editar noticia                    | `src/app/api/news/[id]/route.ts`                                     | listado, ultimas noticias, detalle si existe | `news:list`, `news:latest`, `news:detail:{id}` si se cachea            | Igual anterior.                                                                        |
| Eliminar noticia                  | `src/app/api/news/[id]/route.ts`                                     | listado, ultimas noticias, detalle si existe | `news:list`, `news:latest`, `news:detail:{id}` si se cachea            | Igual anterior.                                                                        |
| Crear curso                       | `src/app/api/courses/route.ts`                                       | listado cursos                               | `courses:list`                                                         | `/capacitaciones` solo si contiene RSC cacheado dependiente.                           |
| Editar curso                      | `src/app/api/courses/route.ts` y `src/app/api/courses/[id]/route.ts` | listado y detalle                            | `courses:list`, `courses:detail:{id}`                                  | `/capacitaciones/[id]` solo si la pagina contiene datos RSC cacheados.                 |
| Eliminar curso                    | `src/app/api/courses/[id]/route.ts`                                  | listado y detalle                            | `courses:list`, `courses:detail:{id}`                                  | `/capacitaciones/[id]` solo si hay artefacto de pagina que limpiar.                    |
| Aprobar/corregir/reabrir donacion | APIs admin donaciones                                                | totales, porcentaje, donantes                | Ninguna cache de negocio por ahora; conservar flujo fresco/no-store    | Mantener helpers actuales si aportan compatibilidad con shells, pero no ampliar cache. |
| Crear/editar campana              | APIs admin campanas                                                  | campana actual, listado, progreso            | Ninguna cache de negocio por ahora                                     | Mantener helper actual.                                                                |
| Crear/editar/eliminar certificado | APIs certificados                                                    | validacion publica, perfil                   | Ninguna cache de negocio por ahora                                     | No agregar cache; mantener fresco.                                                     |

La invalidacion debe ejecutarse solo despues de que la operacion de DB haya finalizado correctamente. En operaciones con Cloudinary, la decision depende del orden real:

- si Cloudinary falla antes de persistir cambios, no invalidar;
- si DB ya cambio y luego falla una limpieza no critica de Cloudinary, invalidar porque el dato visible cambio.

## Navegacion y estado cliente

El proyecto usa Context API para noticias/cursos y `useState` en dashboards. Las mutaciones desde Route Handlers no actualizan automaticamente estados cliente ya cargados.

Recomendaciones:

- Despues de crear/editar/eliminar noticia o curso, mantener actualizacion local del Context como hoy.
- Si el admin navega inmediatamente a una pagina publica ya visitada, preferir:
  - refetch explicito del listado antes de mostrar confirmacion o al volver;
  - `router.refresh()` en botones de navegacion administradores si se introduce RSC cacheado;
  - abrir pagina publica con hard navigation si se necesita verificacion manual estricta.
- No confiar en `revalidateTag` para limpiar estado React ya montado.
- Para fetch cliente a APIs cacheadas, revisar headers de respuesta y comportamiento del navegador; los datos cacheados viven del lado Next/Vercel, no del estado local.

## Plan por fases

### Fase A: preparacion documental y contrato de datos

Riesgo: bajo.

Tareas:

- Definir tipos serializables para noticias y cursos.
- Decidir si se cachea o no `news/[id]`; hoy no hay pagina publica de detalle de noticia.
- Definir `pageSize` constantes centralizadas.
- Definir nombres finales de helpers:
  - `getPublicNews`
  - `getLatestPublicNews`
  - `getPublicCourses`
  - `getPublicCourseById`
- Definir tags exactos y perfiles `cacheLife`.

Criterios:

- No hay cambios de runtime.
- El equipo acuerda contratos y tags.

### Fase B: implementar helpers cacheados de noticias

Riesgo: medio.

Tareas:

- Crear `src/libs/news/publicNewsQueries.ts`.
- Mover Prisma de listados/ultimas noticias a helpers con `"use cache"`.
- Agregar `cacheTag` y `cacheLife`.
- Serializar fechas.
- Actualizar Route Handlers para usar helpers.
- Retirar `ensureRequestTimeRendering()` de los GET cacheados de noticias.
- Actualizar `revalidation.ts` para `invalidateNews(newsId?)` con `revalidateTag`.

Pruebas:

- Listado sin filtros.
- Listado con categoria, busqueda y pagina.
- Ultimas 3 ordenadas por `dateNew`.
- Crear/editar/eliminar noticia invalida tags correctos.
- Mutaciones fallidas no invalidan.

Criterios:

- Menos consultas repetidas a Prisma en requests equivalentes.
- Publicar noticia se refleja despues de invalidacion.
- Home y listado no quedan desincronizados.

codex resume 019f7b47-e435-7d11-9873-ce3a69c6fca9

### Fase C: implementar helpers cacheados de cursos

Riesgo: medio.

Tareas:

- Crear `src/libs/courses/publicCourseQueries.ts`.
- Mover Prisma de listado/detalle a helpers con `"use cache"`.
- Agregar `cacheTag` y `cacheLife`.
- Serializar curso y lecciones.
- Actualizar Route Handlers.
- Retirar `ensureRequestTimeRendering()` de los GET cacheados de cursos.
- Actualizar `revalidation.ts` para `invalidateCourse(courseId?)`.

Pruebas:

- Listado sin filtros.
- Listado con categoria, busqueda y pagina.
- Detalle con lecciones.
- Editar curso actualiza listado y detalle.
- Eliminar curso invalida detalle anterior.

Criterios:

- `/capacitaciones` y `/capacitaciones/[id]` muestran datos coherentes tras mutacion.
- No se cachean datos admin.

### Fase D: revisar integracion cliente y UX admin

Riesgo: medio.

Tareas:

- Revisar `NewsContext` y `CourseContext`.
- Confirmar que create/update/delete actualizan estado local o recargan listados.
- Agregar `router.refresh()` solo donde haya una navegacion RSC que lo justifique.
- Evitar `cache: "no-store"` en fetches publicos de noticias/cursos si deben beneficiarse de la cache de Next.

Pruebas:

- Admin edita curso y abre detalle publico.
- Admin publica noticia y abre home/listado.
- Back/forward despues de mutacion.
- Navegacion en pestana nueva e incognito.

Criterios:

- El admin no ve datos viejos por estado cliente.
- El visitante anonimo recibe datos consistentes despues de invalidacion.

### Fase E: medicion local y Vercel Preview

Riesgo: medio/alto.

Tareas:

- `npm run build`.
- `npm run start`.
- Pruebas HTTP y navegador.
- Deploy Preview en Vercel.
- Revisar Function logs.
- Revisar Usage:
  - Function Invocations;
  - Function Duration;
  - ISR Reads/Writes;
  - errores 500/timeouts.
- Comparar antes/despues:
  - tiempo de `/api/news`;
  - tiempo de `/api/news/lastThreeNews`;
  - tiempo de `/api/courses`;
  - tiempo de `/api/courses/[id]`;
  - cantidad aproximada de consultas Prisma por flujo.

Criterios:

- No hay aumento abrupto de writes.
- No se filtran datos privados.
- No se rompen flujos criticos no cacheados.
- La advertencia Turbopack/NFT queda monitoreada en logs de build.

### Fase F: decidir si ampliar cache fuera de noticias/cursos

Riesgo: alto si se hace sin evidencia.

Decision actual:

- No cachear donaciones/campanas/certificados/perfil/dashboard.

Solo reconsiderar con evidencia de:

- alto trafico en endpoints criticos;
- costo DB medible;
- matriz de invalidacion completa;
- tolerancia explicita a stale;
- pruebas de concurrencia y rollback.

## Pruebas y criterios de aceptacion

### Build y tests

- `npm run build` debe pasar.
- `npm run test:run` debe pasar.
- Comparar output de rutas antes/despues.
- No deben aparecer nuevas rutas criticas cacheadas accidentalmente.

### Cache de noticias

- Dos requests iguales al listado deben reutilizar la entrada cacheada cuando aplique.
- Filtros distintos no deben colisionar:
  - categoria;
  - busqueda;
  - pagina;
  - pageSize.
- Crear noticia invalida listado y ultimas noticias.
- Editar `dateNew` puede cambiar ultimas 3.
- Eliminar noticia desaparece del listado despues de invalidacion.

### Cache de cursos

- Dos requests iguales al listado/detalle deben reutilizar cache cuando aplique.
- Filtros distintos no colisionan.
- Editar curso invalida listado y detalle.
- Editar lecciones invalida detalle.
- Eliminar curso no deja detalle anterior visible.

### Privado y critico

- Dashboard sigue protegido.
- `/api/admin/*` devuelve `no-store` y requiere sesion admin.
- `/api/me/certificates` no comparte datos entre usuarios.
- Certificados publicos se validan frescos.
- Donaciones/campanas/totales/donantes siguen frescos.
- Comprobantes no se cachean.

### Navegacion

- Hard reload.
- Navegacion cliente.
- Back/forward.
- Pestana nueva.
- Incognito.
- Dashboard -> pagina publica despues de mutacion.
- Cambio de usuario en misma pestana.

## Edge cases

- Noticia con `dateNew` futura, nula o editada: afecta ultimas 3.
- Busqueda con espacios, mayusculas, acentos o string vacio: normalizar keys.
- Pagina invalida o negativa: normalizar a 1.
- Curso eliminado mientras un usuario esta en detalle: invalidar detalle.
- Curso editado desde cualquiera de las dos rutas de mutacion existentes: invalidar igual.
- Lecciones reordenadas o reemplazadas: detalle debe cambiar.
- Mutacion admin exitosa pero refetch cliente falla: mostrar error de recarga sin repetir mutacion.
- Cloudinary falla antes de DB: no invalidar.
- DB cambia y limpieza de Cloudinary falla: invalidar si el dato visible cambio.
- Route Handler modifica datos pero falla antes de responder: invalidar solo si la operacion persistida fue exitosa y controlada.
- Datos privados cargados previamente y navegacion hacia atras: no-store y refresh/logout deben evitar exposicion.
- Certificado consultado antes de existir y creado despues: no cachear validacion para evitar 404 persistente.
- Donacion aprobada/corregida/reabierta: no introducir cache hasta tener estrategia especifica.

## Medicion antes y despues

Antes de cache real:

- Medir tiempos de respuesta local y Preview para:
  - `/api/news`
  - `/api/news/lastThreeNews`
  - `/api/courses`
  - `/api/courses/[id]`
- Registrar Function Duration en Vercel Preview.
- Registrar logs de Prisma si se habilitan temporalmente en entorno de prueba.

Despues de cache real:

- Repetir mediciones con mismos parametros.
- Medir primera visita, segunda visita y visita despues de invalidacion.
- Revisar ISR Reads/Writes en Vercel.
- Revisar que donaciones/certificados/dashboard no generen writes inesperados.

No depender exclusivamente de headers de Vercel/Next no garantizados publicamente; usarlos solo como senal auxiliar.

## Estrategia de rollback

Rollback de cache de noticias/cursos:

- Quitar llamadas a helpers cacheados en Route Handlers y volver a Prisma request-time.
- Reponer `ensureRequestTimeRendering()` en GET afectados.
- Mantener `cacheComponents: true`.
- Mantener `no-store` en areas criticas.
- Mantener centralizacion de invalidaciones si no causa errores.

Rollback completo de migracion base no es el objetivo de este plan; ya fue validada localmente. Si Vercel Preview expone un problema grave, revertir la rama de migracion completa antes de produccion.

## Archivos probablemente afectados

Nuevos:

- `src/libs/news/publicNewsQueries.ts`
- `src/libs/courses/publicCourseQueries.ts`

Existentes:

- `src/libs/cache/cacheTags.ts`
- `src/libs/cache/revalidation.ts`
- `src/libs/cache/runtime.ts`
- `src/app/api/news/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`
- `src/app/api/news/[id]/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`
- `src/context/NewsContext.tsx`
- `src/context/CourseContext.tsx`
- tests de noticias/cursos existentes o nuevos bajo `src/test`.

No deberian tocarse para la cache inicial:

- `src/app/api/admin/**`, salvo reemplazar invalidacion de noticias/cursos en mutaciones existentes si aplica.
- `src/app/api/donation-campaigns/**`
- `src/app/api/donations/**`
- `src/app/api/certificates/**`
- `src/app/(front)/mi-perfil/page.tsx`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- dashboard, salvo pruebas de no regresion.

## Recomendacion final

La implementacion de cache real debe empezar por noticias y cursos, no por donaciones ni certificados.

Orden recomendado:

1. Noticias: listado y ultimas noticias.
2. Cursos: listado y detalle.
3. Validacion local con build/start y tests.
4. Vercel Preview con medicion de funciones y cache.
5. Recién con evidencia, evaluar si conviene ampliar cache a otras areas.

Mantener sin cache de negocio por ahora:

- dashboard;
- APIs administrativas;
- perfil;
- certificados y validacion publica;
- donaciones;
- campanas;
- totales, porcentaje y donantes;
- comprobantes;
- datos dependientes de sesion o permisos.

La estrategia debe ser deliberadamente chica: helpers publicos, tags minimos, `cacheLife` conservador, `revalidateTag` despues de mutaciones exitosas y `revalidatePath` solo cuando una ruta concreta lo necesite.
