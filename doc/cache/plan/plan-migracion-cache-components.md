# Plan por fases: migracion a Cache Components en Next.js 16

Fecha de analisis: 2026-07-19.

## Alcance de este documento

Este plan cubre solo la migracion del proyecto al modelo nuevo de cache de Next.js 16 mediante `cacheComponents: true`.

Quedan fuera de alcance en esta etapa:

- Implementar cache real para noticias.
- Implementar cache real para cursos.
- Cachear donaciones, campanas, certificados, dashboard o datos autenticados.
- Migrar masivamente Route Handlers a Server Actions.
- Agregar Redis, Upstash, cache handlers externos o servicios pagos.
- Cambiar base de datos, Prisma, Vercel o dependencias.

La cache futura de noticias/cursos debe planificarse despues de que la migracion base este validada.

## Fuentes oficiales verificadas

- Next.js 16.2.10 documenta Cache Components como un modo opt-in habilitado con `cacheComponents: true`; `use cache` cachea funciones/componentes async y puede combinarse con `cacheLife` y `cacheTag`: https://nextjs.org/docs/app/getting-started/caching
- Con Cache Components, el prerender genera una shell estatica y el contenido dinamico no cacheado debe ir dentro de `Suspense` o marcarse con `use cache`; si no, aparece el error `Uncached data was accessed outside of <Suspense>`: https://nextjs.org/docs/app/getting-started/caching
- Las Runtime APIs (`cookies`, `headers`, `searchParams`, `params`) no pueden leerse dentro de scopes `use cache`; se leen afuera y se pasan como argumentos serializables si corresponde: https://nextjs.org/docs/app/api-reference/directives/use-cache
- Los `GET` Route Handlers con Cache Components siguen el mismo modelo: runtime por defecto, pueden prerenderizarse si no acceden a datos runtime/no cacheados, y `use cache` debe extraerse a helpers, no usarse directamente dentro del body del handler: https://nextjs.org/docs/app/getting-started/route-handlers
- Las opciones de Route Segment Config (`dynamic`, `dynamicParams`, `revalidate`, `fetchCache`) quedan deshabilitadas con `cacheComponents` y seran deprecadas: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- La revalidacion con Cache Components usa `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag` y `revalidatePath`; `updateTag` esta orientado a Server Actions y read-your-own-writes: https://nextjs.org/docs/app/getting-started/revalidating
- Vercel Hobby tiene cuotas limitadas de Functions/ISR; la migracion debe evitar convertir rutas criticas en regeneraciones amplias o cache writes excesivos: https://vercel.com/docs/plans/hobby

## Diagnostico actual del repositorio

### Configuracion

- `package.json`
  - `next`: `^16.2.10`
  - `react`: `^19.2.7`
  - `react-dom`: `^19`
  - Prisma: `@prisma/client ^6.19.3`, `prisma ^6.19.3`
  - Scripts relevantes: `npm run dev`, `npm run build`, `npm run start`, `npm test`, `npm run test:run`.
- `next.config.ts`
  - No tiene `cacheComponents: true`.
  - Tiene `experimental.serverActions.bodySizeLimit = "20mb"`.
  - Tiene `turbopack.root = process.cwd()`.
  - `reactStrictMode = true`.
  - `images.unoptimized = true`.
  - `remotePatterns` para Cloudinary.
- App Router
  - Rutas en `src/app`.
  - Grupo publico/privado visual en `src/app/(front)`.
  - Route Handlers en `src/app/api`.
  - No hay Pages Router.

### Mecanismos de cache actuales

Inventario por busqueda en `src`, `next.config.ts` y `package.json`:

| Mecanismo | Estado actual |
| --- | --- |
| `cacheComponents` | No usado. |
| `"use cache"` | No usado. |
| `cacheTag` | No usado. |
| `cacheLife` | No usado. |
| `revalidateTag` | No usado. |
| `updateTag` | No usado. |
| `unstable_cache` | No usado. |
| `cache` de React | No usado para datos de dominio. |
| `fetchCache` | No usado. |
| `dynamicParams` | No usado. |
| `force-static` | No usado. |
| `export const revalidate` | No usado. |
| `dynamic = "force-dynamic"` | Usado en APIs de auth, donaciones y campanas. |
| `fetch(..., { cache: "no-store" })` | Usado en cliente para campana actual y listado de campanas DEA. |
| `revalidatePath` | Usado en noticias, cursos, donaciones y campanas admin. |
| Headers HTTP de cache | No hay `Cache-Control` explicito para privadas/publicas criticas. |

### Resultado de build de produccion actual

El build de referencia con el modelo anterior (`npm run build`) paso correctamente con Next.js 16.2.10.

Clasificacion relevante:

| Ruta | Build actual | Observacion |
| --- | --- | --- |
| `/` | Estatica | Shell cliente; noticias recientes via `/api/news/lastThreeNews`. |
| `/noticias` | Estatica | Shell cliente; listado via `/api/news`. |
| `/capacitaciones` | Estatica | Shell cliente; listado via `/api/courses`. |
| `/capacitaciones/[id]` | Dinamica | Pagina cliente con `useParams`; fetch cliente a `/api/courses/[id]`. |
| `/donar` | Estatica | Shell cliente; datos via `/api/donation-campaigns/current` con `no-store`. |
| `/campanas-dea` | Estatica | Shell cliente; datos via `/api/donation-campaigns` con `no-store`. |
| `/certificado/validar/[publicId]` | Dinamica | Server Component con `params`, Prisma y `notFound`. |
| `/mi-perfil` | Dinamica | Server Component con `getServerSession`, Prisma y `redirect`. |
| `/dashboard/*` | Dinamicas | Layout con `getServerSession`; paginas dashboard son cliente. |
| `/api/*` | Dinamicas | Route Handlers; varias declaran `force-dynamic`. |

Warning observado en build anterior:

- Turbopack aviso que `next.config.ts` aparece en la traza de `src/generated/prisma/index.js` desde `src/app/api/news/route.ts`. No bloquea la migracion, pero conviene vigilarlo porque puede afectar tracing/bundling de funciones.

## Inventario de accesos dinamicos

### Request APIs y parametros

- `searchParams` en paginas:
  - `src/app/(front)/auth/verify-email/page.tsx`: lee token desde `searchParams`.
  - `src/app/(front)/auth/reset-password/page.tsx`: usa `useSearchParams` en cliente.
- `params` en paginas:
  - `src/app/(front)/certificado/validar/[publicId]/page.tsx`: recibe `params.publicId`.
  - `src/app/(front)/capacitaciones/[id]/page.tsx`: usa `useParams` en cliente.
- `params` en Route Handlers:
  - `/api/news/[id]`
  - `/api/courses/[id]`
  - `/api/certificates/[publicId]`
  - `/api/certificates/validate/[publicId]`
  - `/api/donation-campaigns/[id]/donors`
  - `/api/admin/donation-campaigns/[id]`
  - `/api/admin/donations/[id]/*`
- `cookies()` y `headers()`:
  - No se detectan llamadas directas en el codigo del repo.
  - NextAuth usa cookies/headers indirectamente a traves de `getServerSession` y middleware.

### Sesion, NextAuth, roles y redirecciones

- `src/libs/auth/requireAdminSession.ts`
  - Usa `getServerSession(authOptions)`.
  - Retorna 401 si no hay sesion y 403 si no es admin.
- `src/app/(front)/dashboard/layout.tsx`
  - Usa `getServerSession`.
  - Redirige a `/auth/login` si no hay sesion.
  - Redirige a `/auth/login?error=unauthorized` si el rol no es `ADMIN`.
- `src/app/(front)/mi-perfil/page.tsx`
  - Usa `getServerSession`.
  - Redirige si no hay sesion.
  - Consulta certificados asociados al usuario/email.
- `src/app/api/me/certificates/route.ts`
  - Usa `getServerSession`.
  - Respuesta personalizada por usuario.
- `src/app/api/auth/[...nextauth]/route.ts`
  - `dynamic = "force-dynamic"`.
- `src/proxy.ts`
  - `withAuth` protege `/dashboard/:path*` con rol `ADMIN`.

### Prisma directo

Prisma se usa en:

- APIs publicas:
  - noticias, cursos, campanas, donantes, validacion de certificados.
- APIs admin:
  - certificados, donaciones, campanas.
- Server Components:
  - `/certificado/validar/[publicId]`
  - `/mi-perfil`
- Librerias de dominio:
  - auth, password reset, email verification.
  - donations/campaign services.
  - certificados bulk/generacion.

Implicacion para Cache Components:

- Prisma no se cachea automaticamente.
- Un Prisma async dentro de un componente Server que se intente prerenderizar puede disparar errores de datos no cacheados fuera de `Suspense`.
- Un Prisma dentro de una funcion con `"use cache"` solo debe usarse para datos publicos y con argumentos/resultados serializables.
- No se debe envolver Prisma privado o dependiente de sesion en `"use cache"` durante esta migracion.

### Route Handlers

Hay Route Handlers para:

- Noticias: publicos y admin mezclados en las mismas rutas (`GET`, `POST`, `PUT`, `DELETE`).
- Cursos: publicos y admin mezclados.
- Donaciones/campanas publicas.
- Donaciones/campanas admin.
- Certificados admin y validacion publica.
- Auth.
- Perfil del usuario.

Impacto de Cache Components:

- Los `GET` Route Handlers pasan al mismo modelo de prerender/runtime.
- Las opciones `dynamic = "force-dynamic"` quedan deshabilitadas/no recomendadas con `cacheComponents`.
- Para endpoints que deben permanecer frescos, no alcanza confiar en `dynamic`; hay que asegurar que accedan a runtime data/request object o usar estrategias explicitas como `connection()`/headers/no-store segun corresponda.
- Los `POST`, `PUT`, `PATCH`, `DELETE` no se cachean, pero sus `GET` hermanos en el mismo archivo deben revisarse.

### Navegacion cliente despues de mutaciones

- Login usa `router.refresh()` y luego `router.push`.
- Dashboard usa `router.push` hacia secciones.
- Noticias/cursos dashboard actualizan estado local en Context, pero las invalidaciones del servidor no limpian automaticamente estados cliente ya cargados.
- Donaciones dashboard hace refetch manual despues de acciones.
- Donar recarga campana tras enviar comprobante.

Implicacion:

- Con Cache Components, el Router Cache del cliente puede conservar payloads segun `cacheLife.stale` y minimo interno. Como esta migracion no introduce `"use cache"` para datos publicos, el mayor riesgo inicial esta en paginas dinamicas/autenticadas y en rutas visitadas antes de mutaciones.

## Clasificacion de rutas para la migracion

| Ruta | Tipo | Debe permanecer dinamica | Puede fallar con Cache Components | Accion de migracion |
| --- | --- | --- | --- | --- |
| `/` | Publica estatica shell | No | Bajo | Mantener sin cache de datos. No agregar `"use cache"` aun. |
| `/noticias` | Publica shell + fetch cliente | No | Bajo | Mantener como cliente; futura candidata a cache de datos. |
| `/api/news` | GET publico, POST admin | GET puede ser futuro cacheado; POST no | Medio | Antes de cache real, asegurar que no se prerenderice accidentalmente si usa Prisma sin cache. |
| `/api/news/[id]` | GET publico, PUT/DELETE admin | GET futuro detalle si existe | Medio | Igual que noticias; corregir invalidaciones en fase previa. |
| `/api/news/lastThreeNews` | GET publico | Futuro cacheado | Medio | Futuro `use cache` en helper, no en handler. |
| `/capacitaciones` | Publica shell + fetch cliente | No | Bajo | Mantener; futura candidata. |
| `/capacitaciones/[id]` | Publica detalle cliente | No por pagina, si por API | Bajo/medio | Mantener cliente por ahora; futuro cachear helper de detalle. |
| `/api/courses` | GET publico, POST/PUT admin | GET futuro cacheado; mutaciones no | Medio | Evitar prerender accidental; futura extraccion a helper. |
| `/api/courses/[id]` | GET publico, PUT/DELETE admin | GET futuro cacheado | Medio | Evitar prerender accidental; futura cache por id. |
| `/donar` | Publica shell + datos criticos cliente | Datos deben ser frescos | Bajo | Mantener `no-store`; no cachear. |
| `/campanas-dea` | Publica shell + datos criticos cliente | Datos deben ser frescos | Bajo | Mantener `no-store`; no cachear. |
| `/api/donation-campaigns/current` | Publica critica | Si | Alto | Quitar dependencia de `dynamic` como blindaje unico; garantizar runtime/no-store. |
| `/api/donation-campaigns` | Publica critica | Si por ahora | Alto | Igual; no cachear totales/listado. |
| `/api/donation-campaigns/[id]/donors` | Publica critica | Si | Alto | Agregar `no-store` tambien en fetch cliente de "ver mas". |
| `/api/donations` | Mutacion publica | Si | Bajo | POST no cacheado; invalidacion solo post-exito. |
| `/certificado/validar/[publicId]` | Publica critica | Si | Alto | Server Component con Prisma + params; necesitara `Suspense`/runtime boundary o reestructura. No cachear. |
| `/api/certificates/validate/[publicId]` | Publica critica | Si | Alto | No cachear 404/410/valido; garantizar runtime/no-store. |
| `/mi-perfil` | Personalizada | Si | Alto | `getServerSession` + Prisma; debe quedar en subtree dinamico con `Suspense` o page request-time. |
| `/api/me/certificates` | Personalizada | Si | Alto | Garantizar no-store y runtime. |
| `/dashboard/*` | Admin | Si | Alto | Layout con sesion/redirect. Requiere tratamiento especifico, no root Suspense global. |
| `/api/admin/*` | Admin | Si | Alto | No cache; headers no-store; revisar `dynamic` deshabilitado. |
| `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` | Publicas cliente | No | Bajo | Formularios cliente; APIs no cache. |
| `/auth/verify-email` | Publica con token | Si | Medio | `searchParams`; debe mantenerse runtime/stream si accede token server-side. |
| Institucionales | Publicas estaticas | No | Bajo | Mantener como shell estatica/deterministica. |

## Impacto esperado de habilitar `cacheComponents`

### Lo que cambia

1. El proyecto deja de depender del modelo anterior de `dynamic = "force-dynamic"` para declarar rutas frescas.
2. Las paginas intentan generar una shell estatica y deben separar contenido:
   - deterministico: prerenderizable;
   - runtime/no cacheado: dentro de `Suspense`;
   - cacheado: dentro de `"use cache"`.
3. Los `GET` Route Handlers pueden prerenderizarse si no acceden a runtime/no-cache. Esto es critico para endpoints que hoy tienen Prisma pero no request data.
4. `dynamic`, `revalidate`, `fetchCache` y `dynamicParams` quedan deshabilitados con Cache Components.
5. Prisma en Server Components publicos puede generar errores si se accede durante prerender sin `Suspense` o sin cache.
6. `params` y `searchParams` se tratan como runtime APIs salvo que haya `generateStaticParams`.
7. `use cache` exige argumentos y resultados serializables. Objetos Prisma con `Decimal`, `Date`, clases o valores no serializables deben serializarse antes o despues con cuidado.
8. El Router Cache del cliente queda coordinado por los tiempos `stale` de `cacheLife` para contenido cacheado; ademas hay minimo de 30 segundos para stale segun documentacion. En esta migracion no se debe introducir contenido cacheado nuevo que afecte frescura critica.

### Lo que no deberia cambiar si se migra correctamente

- POST/PUT/PATCH/DELETE siguen ejecutandose en runtime.
- Dashboard sigue protegido por middleware y layout.
- Datos de perfil, certificados, donaciones y comprobantes siguen frescos.
- Noticias/cursos siguen funcionando como hoy via fetch cliente y APIs dinamicas, hasta la fase posterior de cache real.

## Errores previsibles al activar Cache Components

1. `Uncached data was accessed outside of <Suspense>` en:
   - `/certificado/validar/[publicId]` por Prisma directo.
   - `/mi-perfil` por `getServerSession` + Prisma.
   - `/dashboard/layout` por `getServerSession`.
   - `/auth/verify-email` por `searchParams`.
2. Build warnings/errores por Route Segment Config deshabilitada:
   - `export const dynamic = "force-dynamic"` en APIs.
3. `GET` Route Handlers de noticias/cursos/certificados/campanas con Prisma podrian intentar prerender/runtime de forma distinta a la esperada.
4. Cache accidental de Route Handlers publicos si se agrega `"use cache"` demasiado arriba o si quedan deterministas sin runtime guard.
5. Fallbacks pobres si se agregan `Suspense` genericos alrededor de grandes layouts.
6. Datos privados filtrados si alguien intenta resolver errores envolviendo funciones autenticadas con `"use cache"`.
7. Fallos por serializacion al cachear en el futuro:
   - `Date`
   - `Decimal`
   - objetos Prisma complejos
   - `File`
   - `FormData`
   - `NextRequest`
   - `Session`

## Estrategia tecnica recomendada

### Principio central

Migrar primero el modelo de render/cache sin introducir caches de negocio nuevas.

Eso significa:

- Activar `cacheComponents` solo despues de preparar rutas dinamicas y privadas.
- Eliminar dependencia conceptual de `dynamic = "force-dynamic"`.
- No usar `"use cache"` en datos del dominio durante la migracion, salvo que el build lo exija para una shell puramente estatica y no sensible. En este repo no parece necesario para la primera migracion.
- Usar `Suspense` solo en limites donde haya contenido realmente runtime/no-cache.
- Agregar `Cache-Control: no-store` en respuestas privadas/criticas para blindaje HTTP.

### Como mantener rutas frescas sin `dynamic`

Para paginas Server Components con datos frescos:

- Separar la pagina en shell y componente runtime.
- Envolver el componente runtime con `Suspense`.
- El componente runtime lee sesion/params y consulta Prisma.
- No agregar `"use cache"`.

Para Route Handlers criticos:

- Mantener acceso a `request.url`, `request.headers` o usar una estrategia explicita de runtime segun corresponda.
- Agregar headers `Cache-Control: no-store`.
- No usar `"use cache"` en helpers de donaciones/certificados/admin.

Para componentes cliente:

- Mantener fetch cliente.
- Usar `cache: "no-store"` en fetches publicos criticos y privados.
- Para noticias/cursos, dejar comportamiento actual hasta la fase posterior.

## Plan por fases

### Fase 0: baseline y preparacion

Riesgo: bajo.

Objetivo:

- Congelar el comportamiento actual antes de tocar `cacheComponents`.
- Documentar rutas, build output, tests existentes y flujos criticos.

Tareas:

- Ejecutar `npm run build` en rama limpia.
- Guardar salida de rutas `○/ƒ` como baseline.
- Ejecutar `npm run test:run` si el entorno lo permite.
- Registrar warning de Turbopack actual.
- Identificar pruebas faltantes para auth, certificados, donaciones y rutas privadas.

Archivos revisados:

- `package.json`
- `next.config.ts`
- `src/app/**/*`
- `src/libs/auth/*`
- `src/libs/donations/*`
- `src/libs/certificates/*`
- `src/context/*`
- `src/components/Dashboard/*`

Criterios de aceptacion:

- Baseline reproducible.
- Lista de rutas criticas acordada.
- No hay cambios funcionales.

### Fase 1: corregir invalidaciones actuales y centralizarlas antes de la migracion

Riesgo: bajo/medio.

Motivo:

- Aunque esta fase no implementa cache nueva, reduce incertidumbre antes de cambiar el modelo.
- Evita que errores existentes se mezclen con problemas propios de Cache Components.

Tareas:

- Corregir `revalidatePath("/api/lastThreeNews")` a `/api/news/lastThreeNews`.
- Agregar invalidacion faltante en:
  - `PUT /api/news/[id]`
  - `DELETE /api/news/[id]`
  - `PUT /api/courses/[id]`
  - `DELETE /api/courses/[id]`
- Incluir rutas publicas afectadas cuando corresponda:
  - `/`
  - `/noticias`
  - `/capacitaciones`
  - `/capacitaciones/[id]` con tipo si se invalida path dinamico.
- Centralizar strings en un helper simple:
  - `src/libs/cache/revalidation.ts`
  - `src/libs/cache/cacheTags.ts` solo como nombres futuros, sin usarlos todavia para cache real.

Decision sobre `revalidatePath`:

- Se mantiene para compatibilidad y rutas concretas.
- No se reemplaza por `revalidateTag` hasta que existan caches tagueadas.

Pruebas:

- Tests unitarios con mock de `next/cache`.
- Verificar que no se invalida cuando una mutacion falla.

Criterios de aceptacion:

- Las invalidaciones actuales son correctas aunque sigan siendo redundantes en algunas APIs dinamicas.
- No hay strings incorrectos dispersos.

### Fase 2: blindar contenido privado, personalizado y critico

Riesgo: medio.

Objetivo:

- Antes de habilitar `cacheComponents`, asegurar que nada privado dependa de heuristicas antiguas.

Tareas:

- Agregar o planificar headers `Cache-Control: no-store` en:
  - `src/app/api/admin/**`
  - `src/app/api/me/certificates/route.ts`
  - `src/app/api/certificates/route.ts`
  - `src/app/api/certificates/[publicId]/route.ts`
  - `src/app/api/certificates/bulk/route.ts`
  - `src/app/api/admin/donations/[id]/receipt/route.ts`
- Agregar `no-store` en fetch cliente que hoy falta:
  - `DonationPageContent.loadMoreDonors`.
  - fetches dashboard privados si se quiere blindaje cliente adicional.
- Mantener sin cache:
  - donaciones/campanas publicas criticas;
  - certificados publicos;
  - `/mi-perfil`;
  - `/dashboard/*`;
  - auth.

No hacer:

- No usar `"use cache: private"` como atajo inicial. Es mas complejo y no necesario para esta app.
- No cachear perfiles por userId/email.

Pruebas:

- Tests de headers para APIs privadas/criticas.
- Verificar que respuestas con sesion expirada devuelven 401/redirect y no se reutilizan.

Criterios de aceptacion:

- Los endpoints privados y personalizados declaran claramente no-store.
- Las rutas criticas no dependen de `dynamic = "force-dynamic"` como unica proteccion.

### Fase 3: adaptar paginas Server Components runtime antes de activar la bandera

Riesgo: medio/alto.

Objetivo:

- Preparar las paginas que seguramente fallaran con `cacheComponents`.

Rutas afectadas:

- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/mi-perfil/page.tsx`
- `src/app/(front)/dashboard/layout.tsx`
- `src/app/(front)/auth/verify-email/page.tsx`

Estrategia por ruta:

#### `/certificado/validar/[publicId]`

- Dividir en:
  - shell de pagina;
  - componente runtime que recibe/resuelve `params`, consulta Prisma y genera QR.
- Envolver el componente runtime con `Suspense` con fallback especifico: estado de validacion cargando.
- No usar `"use cache"` para el certificado.
- Asegurar que un certificado inexistente no queda cacheado como 404.

#### `/mi-perfil`

- Dividir en shell de perfil y contenido runtime autenticado.
- `getServerSession` y Prisma quedan dentro del componente runtime.
- `Suspense` con fallback de perfil cargando.
- No cachear lista de certificados del usuario.

#### `/dashboard/layout`

- No poner `Suspense` global en root layout.
- Evaluar si el propio dashboard layout debe delegar la validacion de sesion a un componente async runtime envuelto en `Suspense`.
- Mantener middleware `src/proxy.ts` como primera barrera.
- La verificacion de rol server-side debe seguir existiendo.

#### `/auth/verify-email`

- La pagina usa `searchParams` server-side.
- Mantener runtime; si falla build, envolver el flujo de token en `Suspense`.
- No cachear resultado de token.

Pruebas:

- Build local con `cacheComponents` aun sin activar mediante rama experimental o commit temporal en una rama.
- Login/logout/dashboard.
- Certificado creado/editado/desactivado.
- Token de verificacion valido/invalido.

Criterios de aceptacion:

- Las paginas runtime quedan aisladas.
- No hay `Suspense` en root layout con fallback vacio que convierta toda la app en request-blocking.
- No hay `"use cache"` alrededor de sesion, permisos o certificados.

### Fase 4: revisar Route Handlers bajo el modelo nuevo

Riesgo: alto.

Objetivo:

- Evitar prerender accidental o cache accidental de APIs con Prisma.

Categorias:

#### Mantener siempre dinamicas/no-store

- `src/app/api/admin/**`
- `src/app/api/auth/**`
- `src/app/api/me/certificates/route.ts`
- `src/app/api/certificates/**`
- `src/app/api/donations/route.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`

Acciones:

- No usar `"use cache"`.
- Agregar `Cache-Control: no-store`.
- Asegurar que GET publicos criticos acceden a request/runtime si Next intenta prerenderizar por no detectar dinamismo.
- Revisar uso de `request.url`, `NextRequest`, `searchParams` y `params`.

#### Futuros candidatos a cache, pero no en esta migracion

- `src/app/api/news/route.ts`
- `src/app/api/news/lastThreeNews/route.ts`
- `src/app/api/news/[id]/route.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/[id]/route.ts`

Acciones en esta migracion:

- Mantener comportamiento actual.
- Si con `cacheComponents` el build exige resolver Prisma no cacheado, forzar runtime/no-store temporalmente antes que meter `"use cache"`.
- Dejar preparado un comentario/documento de futura extraccion a servicios de lectura.

Pruebas:

- Requests directos a APIs con `curl`/browser despues de build/start.
- Verificar status, payload y headers.
- Confirmar que los POST/PUT/PATCH/DELETE siguen funcionando y no fueron afectados por wrappers de cache.

Criterios de aceptacion:

- Ninguna API privada/critica queda prerenderizada.
- Las APIs candidatas siguen funcionando sin introducir cache real.

### Fase 5: habilitar `cacheComponents: true` en rama exclusiva

Riesgo: alto.

Objetivo:

- Activar la bandera y resolver errores de build de forma controlada.

Tareas:

- Crear rama dedicada, por ejemplo `cache-components-migration`.
- Cambiar solo `next.config.ts` para agregar:
  - `cacheComponents: true`
- Ejecutar `npm run build`.
- Clasificar errores:
  - Server Component con runtime API fuera de `Suspense`.
  - Prisma/async data fuera de `Suspense`.
  - Route Segment Config deshabilitada.
  - serializacion/cache accidental.
- Resolver uno por uno con cambios pequenos.

Reglas de resolucion:

- Si el dato debe ser fresco: `Suspense` + runtime/no-store, no `"use cache"`.
- Si el dato es privado: nunca `"use cache"`.
- Si el dato es noticia/curso: no cachear aun; mantener runtime temporalmente si hace falta.
- Si el error ocurre en un layout compartido: no envolver toda la app; crear boundary especifico o multiple root layout si fuese necesario.

Criterios de aceptacion:

- `npm run build` pasa con `cacheComponents`.
- No hay cache real nueva en datos de dominio.
- No se eliminaron protecciones de auth.
- No se agregaron boundaries globales innecesarios.

### Fase 6: limpiar configuraciones incompatibles/deprecadas

Riesgo: medio.

Objetivo:

- Quitar o reemplazar configuraciones que ya no tienen efecto con Cache Components.

Configuraciones actuales afectadas:

- `export const dynamic = "force-dynamic"` en:
  - `src/app/api/donations/route.ts`
  - `src/app/api/donation-campaigns/route.ts`
  - `src/app/api/donation-campaigns/current/route.ts`
  - `src/app/api/donation-campaigns/[id]/donors/route.ts`
  - `src/app/api/admin/donations/**`
  - `src/app/api/admin/donation-campaigns/**`
  - `src/app/api/auth/[...nextauth]/route.ts`

Decision:

- No depender de esos exports.
- Removerlos si Next los advierte como deshabilitados/deprecados.
- Reemplazar su intencion con:
  - `Cache-Control: no-store`;
  - runtime data/request access;
  - `Suspense` en UI;
  - no uso de `use cache`.

Pruebas:

- Build sin warnings nuevos relevantes.
- Tests auth/admin/donaciones.

Criterios de aceptacion:

- No quedan Route Segment Configs usadas como mecanismo de frescura.
- Si se conservan temporalmente, quedan documentadas como redundantes y con tarea de eliminacion.

### Fase 7: validacion funcional local con build/start

Riesgo: medio.

Objetivo:

- Validar comportamiento de produccion local, no solo `next dev`.

Comandos:

- `npm run build`
- `npm run start`
- `npm run test:run`

Flujos:

- Home carga y muestra ultimas noticias.
- `/noticias` lista, busca y pagina.
- `/capacitaciones` lista, busca y pagina.
- `/capacitaciones/[id]` abre detalle.
- `/donar` carga campana fresca.
- `/campanas-dea` carga listado fresco.
- Certificado publico:
  - inexistente;
  - creado;
  - editado;
  - desactivado.
- Auth:
  - login;
  - logout;
  - rol no admin;
  - sesion expirada.
- Dashboard:
  - noticias;
  - cursos;
  - certificados;
  - campanas;
  - donaciones;
  - comprobantes.

Criterios de aceptacion:

- Sin datos cruzados entre usuarios.
- Sin stale visible en areas criticas al recargar.
- Sin errores de streaming/hydration.

### Fase 8: Deploy Preview en Vercel Hobby

Riesgo: medio/alto.

Objetivo:

- Validar diferencias reales de serverless, cache y regiones.

Tareas:

- Crear Deploy Preview desde rama de migracion.
- Revisar build logs completos.
- Revisar Function logs durante flujos criticos.
- Medir respuesta inicial y navegacion cliente.
- Revisar Usage:
  - Function Invocations.
  - Function Duration.
  - ISR reads/writes si aparecen.
  - errores 500/timeout.

Validaciones:

- No depender exclusivamente de headers como `x-vercel-cache`.
- Usarlos solo como indicio auxiliar.
- Confirmar con cambios reales de DB que datos criticos se refrescan.

Criterios de aceptacion:

- Preview completa todos los flujos criticos.
- No hay cache compartida de datos privados.
- No aparecen ISR writes inesperados por donaciones/certificados/dashboard.
- No se exceden limites del plan Hobby.

### Fase 9: documentar compatibilidad futura para cache de noticias/cursos

Riesgo: bajo.

Objetivo:

- Dejar lista la arquitectura minima para la fase posterior sin implementarla.
- Actualizado luego de Fases 1 a 7: esta fase quedo parcialmente adelantada por la centralizacion hecha en Fase 1 y por el blindaje/runtime aplicado en Fases 2 a 7. No debe considerarse completa todavia porque no existen servicios de lectura publica cacheables ni invalidacion por tags.

Estado actual despues de Fases 1 a 7:

| Pieza | Estado | Detalle |
| --- | --- | --- |
| `src/libs/cache/cacheTags.ts` | Implementado parcialmente | Existe una convencion inicial de tags para noticias, cursos, campanas y donaciones. Todavia no se usa con `cacheTag`, `revalidateTag` ni `updateTag`. |
| `src/libs/cache/revalidation.ts` | Implementado parcialmente | Centraliza invalidaciones actuales con `revalidatePath`: `revalidateNewsViews`, `revalidateCourseViews` y `revalidateDonationCampaignViews`. Todavia no tiene helpers semanticos finales `invalidateNews`/`invalidateCourse` basados en tags. |
| `src/libs/cache/runtime.ts` | Implementado como soporte de migracion | Centraliza `connection()` mediante `ensureRequestTimeRendering()` para mantener endpoints dinamicos bajo Cache Components. No es parte de la cache futura de noticias/cursos, pero evita prerender accidental mientras no haya `"use cache"`. |
| `src/libs/news/publicNewsQueries.ts` | Pendiente | No existe. Las lecturas publicas siguen dentro de Route Handlers con Prisma directo y runtime forzado. |
| `src/libs/courses/publicCourseQueries.ts` | Pendiente | No existe. Las lecturas publicas siguen dentro de Route Handlers con Prisma directo y runtime forzado. |
| `"use cache"` | Pendiente | No hay uso en el proyecto. Correcto para Fases 1 a 7; debe introducirse recien en una fase posterior de cache real. |
| `cacheTag` / `cacheLife` | Pendiente | No hay uso real. Los nombres de tags existen, pero no se adjuntan a lecturas cacheadas. |
| `revalidateTag` | Pendiente | No hay caches tagueadas que invalidar todavia. |
| `updateTag` | Pendiente / fuera de alcance inmediato | No hay Server Actions para estas mutaciones. Con Route Handlers, la opcion futura natural sigue siendo `revalidateTag`; `updateTag` solo aplica si una mutacion concreta se migra a Server Action. |

Estructura futura recomendada:

- `src/libs/cache/cacheTags.ts`
  - `news.list`
  - `news.latest`
  - `news.detail(id)`
  - `courses.list`
  - `courses.detail(id)`
  - Estado actual: existe.
- `src/libs/news/publicNewsQueries.ts`
  - `getPublicNews({ category, search, page })`
  - `getLatestPublicNews(limit)`
  - Estado actual: pendiente.
- `src/libs/courses/publicCourseQueries.ts`
  - `getPublicCourses({ category, search, page })`
  - `getPublicCourseById(id)`
  - Estado actual: pendiente.
- `src/libs/cache/revalidation.ts`
  - Actual: `revalidateNewsViews(newsId?)`, `revalidateCourseViews(courseId?)`, `revalidateDonationCampaignViews(campaignId?)`.
  - Futuro pendiente: `invalidateNews(id?)` e `invalidateCourse(id?)` como helpers semanticos que combinen tags y rutas solo si corresponde.

Partes ya implementadas que ayudan a Fase 9:

- Se evito acoplar la migracion a `unstable_cache`.
- `cacheComponents: true` ya esta activo y validado por build local.
- Las APIs de noticias y cursos quedaron dinamicas temporalmente con `ensureRequestTimeRendering()`, por lo que no hay cache accidental antes de disenar los helpers publicos.
- Las invalidaciones actuales de noticias/cursos ya no estan dispersas como strings manuales dentro de cada mutacion.
- Los tags futuros estan nombrados en un archivo central, aunque todavia no tienen efecto runtime.

Partes pendientes para completar Fase 9 antes de implementar cache real:

- Definir el contrato exacto de datos serializables que devolveran `getPublicNews`, `getLatestPublicNews`, `getPublicCourses` y `getPublicCourseById`.
- Decidir si el detalle publico de noticia sera cacheado ahora o solo listado/ultimas noticias, porque actualmente no hay pagina publica de detalle de noticia equivalente a cursos.
- Extraer Prisma desde los Route Handlers publicos hacia helpers de lectura de dominio.
- Definir claves/argumentos serializables para filtros, busqueda, paginacion e IDs.
- Definir perfiles iniciales de `cacheLife` para listado, ultimas noticias y cursos.
- Definir invalidacion futura con `revalidateTag` desde Route Handlers despues de mutacion exitosa.
- Evaluar si se conservan tambien `revalidatePath` para shells publicas (`/`, `/noticias`, `/capacitaciones`) cuando esas shells dependan de Server Components cacheados. Hoy las shells siguen siendo mayormente cliente.
- Agregar tests especificos de serializacion, tags e invalidacion cuando se implemente la cache real.
- Documentar el rollback de la cache de noticias/cursos separado del rollback de `cacheComponents`.

Reglas futuras:

- `"use cache"` dentro de helpers async, no en Route Handler body.
- `cacheTag` dentro del mismo helper cacheado.
- `cacheLife` con perfiles chicos al principio.
- Serializar `Date`/`Decimal` antes de devolver desde funciones cacheadas, o garantizar que el resultado sea serializable.
- `revalidateTag` desde Route Handlers tras mutacion exitosa.
- `updateTag` solo si una mutacion concreta se migra a Server Action.

Criterios de aceptacion:

- Para considerar completa la Fase 9 documental, debe existir una descripcion cerrada de helpers, contratos serializables, tags, `cacheLife`, invalidaciones y pruebas para noticias/cursos.
- Para considerar completa la implementacion futura de cache real, el equipo debe poder cachear noticias/cursos sin tocar dashboard/donaciones/certificados.
- La API de dominio debe quedar desacoplada de detalles de Next tanto como sea razonable para el tamano del proyecto.

## Route Handlers vs Server Actions

### Mantener Route Handlers ahora

Conviene mantener Route Handlers para:

- Formularios existentes que usan `fetch`.
- Subida de archivos:
  - comprobantes de donacion;
  - imagenes de campana;
  - imagenes de noticias;
  - certificados bulk Excel.
- APIs consumidas por componentes cliente existentes.
- Flujos ya testeados.

### Limitacion para `updateTag`

- `updateTag` esta orientado a Server Actions para read-your-own-writes.
- Como las mutaciones actuales son Route Handlers, la opcion natural futura es `revalidateTag`.
- En Route Handlers, la revalidacion no necesariamente limpia el Router Cache del cliente que ejecuto la accion como lo hace una Server Action con `refresh`/`updateTag`.

### Candidatas futuras a Server Action

Solo evaluar despues de la migracion:

- Crear/editar noticia si se quiere que el admin vea inmediatamente el resultado en una navegacion RSC sin fetch manual.
- Crear/editar curso por el mismo motivo.

No conviene migrar inicialmente:

- Donaciones con archivos.
- Certificados bulk.
- Comprobantes.
- Auth.

## Pruebas requeridas por area

### Build

- Comparar output antes/despues de `cacheComponents`.
- Registrar:
  - rutas prerendered;
  - rutas dynamic;
  - errores de `Suspense`;
  - warnings de segment config;
  - warnings de Turbopack/Prisma.
- No aceptar solo `next dev`.

### Autenticacion

- Login correcto admin.
- Login usuario no admin.
- Logout y navegacion hacia atras.
- Sesion expirada durante navegacion.
- Sesion expirada durante mutacion.
- Cambio de usuario en la misma pestana.
- Dashboard directo por URL sin sesion.

### Contenido privado

- `/mi-perfil` con usuario A y luego usuario B.
- `/api/me/certificates` no reutiliza respuesta.
- `/api/admin/donations` no visible para usuario comun.
- `/api/admin/donations/[id]/receipt` no cachea signed URL.
- Certificados admin no compartidos.

### Contenido publico critico

- Crear certificado y validar inmediatamente.
- Validar certificado inexistente, crearlo despues y volver a validar.
- Desactivar certificado ya visitado y recargar.
- Aprobar donacion.
- Corregir monto aprobado.
- Reabrir donacion aprobada.
- Completar/archivar campana.
- Verificar `/donar`, `/campanas-dea`, donantes, total y porcentaje.

### Navegacion

- Hard reload.
- Navegacion cliente con `Link`.
- `router.push`.
- `router.replace` si se agrega.
- `router.refresh`.
- Back/forward.
- Pestana nueva.
- Modo incognito.
- Dashboard -> pagina publica ya visitada.
- Pagina publica -> dashboard -> mutacion -> volver.

### APIs

- GET publicos con parametros distintos.
- GET privados con y sin sesion.
- Mutaciones con error 400/401/403/404/409/500.
- Mutacion exitosa con invalidacion posterior.
- Fallos de Cloudinary antes/despues de DB segun flujo.

## Edge cases y border cases

- Usuario cambia de sesion sin cerrar la pestana.
- Contenido privado cargado previamente y navegacion hacia atras.
- Certificado consultado antes de existir y creado despues.
- Certificado desactivado despues de haber sido validado.
- Sesion expirada durante una mutacion.
- Route Handler modifica datos pero falla antes de invalidar.
- Mutacion exitosa con fallo posterior de Cloudinary.
- Navegacion hacia ruta publica previamente visitada.
- Datos Prisma dentro de funcion cacheada futura.
- Argumentos no serializables en `"use cache"` futura.
- Busquedas/paginacion con parametros diferentes.
- Rutas dinamicas con `params`.
- Paginas con `searchParams`.
- Dashboard dentro de layout compartido.
- Cookies/headers accedidos desde zona cacheada.
- Diferencias entre `next dev`, `next start` y Vercel.
- `Date.now`, `Math.random`, `crypto.randomUUID` en componentes que pasan a prerender.
- `notFound()` en certificado inexistente bajo Cache Components.
- Signed URL de Cloudinary de comprobantes con TTL corto.

## Riesgos de regresion

| Riesgo | Probabilidad | Impacto | Mitigacion |
| --- | --- | --- | --- |
| Build falla por Prisma fuera de `Suspense` | Alta | Medio | Fase 3 antes de activar bandera. |
| Dashboard queda parcialmente prerenderizado | Media | Alto | No usar `"use cache"`; headers no-store; tests auth. |
| Certificado publico sirve estado viejo | Media | Alto | Mantener runtime/no-store; no cachear 404/410. |
| Route Handler GET se prerenderiza accidentalmente | Media | Alto | Revisar todos los GET criticos y agregar runtime/no-store. |
| `dynamic = "force-dynamic"` deja de proteger rutas | Alta | Alto | Reemplazar intencion por patrones Cache Components. |
| `Suspense` global degrada toda la app | Media | Medio | Boundaries locales, fallbacks especificos. |
| Router Cache muestra contenido viejo al admin | Media | Medio | `router.refresh`/refetch despues de mutaciones criticas. |
| Vercel Hobby consume mas funciones | Media | Medio | Medir Preview antes de produccion. |

## Estrategia de rollback

- Mantener la migracion en rama separada hasta validar Preview.
- El rollback primario es remover `cacheComponents: true` y revertir cambios de adaptacion que dependan de ese modelo.
- Cambios seguros que pueden conservarse aun con rollback:
  - centralizacion de invalidaciones;
  - headers `Cache-Control: no-store`;
  - correccion de rutas `revalidatePath`;
  - tests nuevos.
- No desplegar cache real de noticias/cursos en el mismo release de migracion. Esto reduce el rollback a una sola variable conceptual: modelo de render/cache.

## Observabilidad

Local:

- `npm run build` y guardar output.
- `npm run start` para reproducir produccion local.
- Logs de Route Handlers criticos durante pruebas.

Vercel Preview:

- Function logs por endpoint.
- Revisar errores 500, timeouts y warnings de render.
- Revisar Usage del plan Hobby:
  - Function Invocations.
  - Function Duration.
  - ISR Reads/Writes.
- Usar headers de Vercel/Next solo como apoyo, no como contrato.
- Validar con dos navegadores o incognito para detectar datos cruzados.

## Archivos probablemente afectados en la migracion

Configuracion:

- `next.config.ts`

Paginas/layouts:

- `src/app/(front)/dashboard/layout.tsx`
- `src/app/(front)/mi-perfil/page.tsx`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/auth/verify-email/page.tsx`

APIs criticas:

- `src/app/api/admin/**`
- `src/app/api/auth/**`
- `src/app/api/me/certificates/route.ts`
- `src/app/api/certificates/**`
- `src/app/api/donation-campaigns/**`
- `src/app/api/donations/route.ts`

APIs candidatas futuras:

- `src/app/api/news/**`
- `src/app/api/courses/**`

Cliente/navegacion:

- `src/components/Donations/DonationPageContent.tsx`
- `src/components/Donations/DonationCampaignsPageContent.tsx`
- `src/components/Dashboard/Donations/DonationCampaignDashboard.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/context/NewsContext.tsx`
- `src/context/CourseContext.tsx`

Helpers futuros:

- `src/libs/cache/revalidation.ts`
- `src/libs/cache/cacheTags.ts`
- `src/libs/news/publicNewsQueries.ts`
- `src/libs/courses/publicCourseQueries.ts`

## Criterios de aceptacion finales

- `cacheComponents: true` puede activarse sin romper `npm run build`.
- Las opciones antiguas incompatibles quedan eliminadas o documentadas como redundantes.
- Dashboard sigue protegido y dinamico.
- APIs administrativas no se cachean.
- Datos autenticados no se comparten entre sesiones.
- `/mi-perfil` no se cachea de forma compartida.
- Validacion publica de certificados sigue fresca.
- Donaciones/campanas criticas siguen frescas.
- No se introduce cache real en donaciones/certificados.
- No se introduce cache real en noticias/cursos durante esta migracion.
- No se depende de `unstable_cache`.
- No se agregan boundaries `Suspense` globales o sin razon.
- Las rutas publicas existentes siguen funcionando.
- La navegacion cliente no deja datos incorrectamente obsoletos en flujos criticos.
- Deploy Preview completa los flujos definidos.
- Queda preparada una capa futura para `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag` y, si se migra alguna mutacion a Server Action, `updateTag`.

## Recomendacion final de viabilidad

La migracion es viable en este momento, pero no debe tratarse como un cambio aislado en `next.config.ts`.

El mayor riesgo no esta en paginas publicas estaticas como `/`, `/noticias` o `/capacitaciones`, porque hoy son mayormente cliente y no consultan Prisma server-side. El riesgo real esta en:

- `/dashboard/layout` por `getServerSession`;
- `/mi-perfil` por sesion + Prisma;
- `/certificado/validar/[publicId]` por `params` + Prisma + `notFound`;
- `GET` Route Handlers criticos que hoy se protegen conceptualmente con `dynamic = "force-dynamic"`;
- respuestas privadas sin `Cache-Control: no-store`.

Orden recomendado:

1. Corregir y centralizar invalidaciones actuales.
2. Blindar privado/critico con no-store y patrones runtime.
3. Preparar paginas Server Components con boundaries locales.
4. Activar `cacheComponents` en rama exclusiva.
5. Resolver errores de build sin introducir caches de dominio.
6. Validar local con `next build`/`next start`.
7. Validar en Vercel Preview.
8. Recien despues planificar cache real de noticias y cursos.

No conviene construir nada nuevo sobre `unstable_cache`. Tampoco conviene meter `"use cache"` de forma prematura durante la migracion. La salida correcta es migrar el modelo primero, estabilizarlo y luego implementar cache publica de noticias/cursos con helpers pequenos y tags centralizados.
