# Fase 7 - Validacion funcional local con build/start

Fecha: 2026-07-19

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Validar el comportamiento local en modo produccion usando `next build` y `next start`, no solo `next dev`, despues de habilitar `cacheComponents: true` y limpiar configuraciones incompatibles.

## Comandos ejecutados

### Build de produccion

```txt
npm run build
```

Resultado: exitoso.

El build confirmo:

```txt
Cache Components enabled
```

Clasificacion observada:

- `○` estaticas: `/`, `/noticias`, `/capacitaciones`, `/donar`, `/campanas-dea`, institucionales.
- `◐` Partial Prerendering: `/auth/verify-email`, `/capacitaciones/[id]`, `/certificado/validar/[publicId]`, `/dashboard/*`, `/mi-perfil`.
- `ƒ` dinamicas: Route Handlers de APIs publicas criticas, privadas, admin y auth.

Warning persistente:

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

No bloqueo el build.

### Servidor local de produccion

Se levanto:

```txt
next start -p 3001
```

URL local:

```txt
http://localhost:3001
```

El servidor inicio correctamente:

```txt
Next.js 16.2.10
Ready in 210ms
```

El proceso se cerro al finalizar la validacion. No quedo listener activo en `3001`; solo una conexion `TIME_WAIT` normal despues de las pruebas.

### Tests automatizados

```txt
npm run test:run
```

Resultado:

```txt
Test Files  27 passed (27)
Tests       112 passed (112)
```

## Matriz de requests locales

Requests ejecutados contra `http://localhost:3001`, sin seguir redirecciones.

| Ruta | Status | Cache-Control | Resultado |
| --- | ---: | --- | --- |
| `/` | 200 | `s-maxage=31536000` | OK, shell publica estatica. |
| `/noticias` | 200 | `s-maxage=31536000` | OK, shell publica estatica. |
| `/capacitaciones` | 200 | `s-maxage=31536000` | OK, shell publica estatica. |
| `/capacitaciones/1` | 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | OK, ruta PPR/dinamica responde. |
| `/donar` | 200 | `s-maxage=31536000` | OK, shell publica estatica; datos criticos vienen por API no-store. |
| `/campanas-dea` | 200 | `s-maxage=31536000` | OK, shell publica estatica; datos criticos vienen por API no-store. |
| `/certificado/validar/no-existe-fase-7` | 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | OK a nivel shell PPR; requiere validacion visual/manual del estado mostrado. |
| `/mi-perfil` | 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | OK a nivel shell PPR; requiere validacion manual de redirect/contenido sin sesion. |
| `/dashboard` | 307 | sin header especifico | OK, middleware redirige a login sin sesion. |
| `/api/news` | 200 | sin header especifico | OK, API publica dinamica. |
| `/api/news/lastThreeNews` | 200 | sin header especifico | OK, API publica dinamica. |
| `/api/courses` | 200 | sin header especifico | OK, API publica dinamica. |
| `/api/donation-campaigns/current` | 200 | `no-store, max-age=0` | OK, API publica critica no-store. |
| `/api/donation-campaigns` | 200 | `no-store, max-age=0` | OK, API publica critica no-store. |
| `/api/certificates/validate/no-existe-fase-7` | 404 | `no-store, max-age=0` | OK, validacion publica no cachea inexistente. |
| `/api/me/certificates` | 401 | `no-store, max-age=0` | OK, personalizada protegida sin sesion. |
| `/api/admin/donations` | 401 | `no-store, max-age=0` | OK, admin protegida sin sesion. |
| `/api/admin/donation-campaigns` | 401 | `no-store, max-age=0` | OK, admin protegida sin sesion. |

## Observaciones importantes

### PPR y status 200 en paginas con contenido dinamico

`/mi-perfil` y `/certificado/validar/[publicId]` devuelven `200` a nivel HTTP porque Next sirve la shell PPR y stream de contenido dinamico. Esto no equivale por si solo a validar la UX final.

Pendiente para prueba manual:

- confirmar que `/mi-perfil` sin sesion termina redirigiendo o mostrando el comportamiento esperado en navegador;
- confirmar que `/certificado/validar/[publicId]` muestra correctamente inexistente, valido y desactivado;
- confirmar navegacion back/forward y cambio de sesion.

### Headers de APIs

Las APIs criticas y privadas probadas devuelven `Cache-Control: no-store, max-age=0`, como se esperaba desde Fase 2.

Las APIs publicas candidatas futuras (`news` y `courses`) siguen sin cache real y sin header no-store explicito. Esto es intencional por ahora: durante esta migracion quedaron dinamicas por `ensureRequestTimeRendering()`, pero la estrategia definitiva de cache publica queda fuera de alcance hasta una fase posterior.

### Logs del servidor

No se registraron errores en `stderr` durante las requests probadas.

## Flujos no ejecutados automaticamente

No se ejecutaron estos flujos porque requieren credenciales reales, interaccion de navegador o datos especificos:

- login admin;
- logout;
- usuario no admin;
- sesion expirada;
- navegacion real del dashboard;
- creacion/edicion/desactivacion de certificados desde UI;
- aprobacion/correccion/reapertura de donaciones desde UI;
- comprobantes y signed URLs de Cloudinary;
- navegacion cliente `router.push`, `router.refresh`, back/forward;
- modo incognito o cambio de usuario en la misma pestana.

Estos flujos deben cubrirse en validacion manual local o directamente en Fase 8 con Vercel Preview.

## Archivos creados o modificados en Fase 7

Creado:

- `doc/cache/reports-plan-migracion-cache-components/fase-7-validacion-funcional-local-build-start.md`

No se modifico codigo de aplicacion en esta fase.

## Criterios de aceptacion cubiertos

- `npm run build` pasa con `cacheComponents: true`.
- `next start` inicia correctamente.
- Rutas publicas basicas responden.
- APIs criticas y privadas probadas mantienen `no-store`.
- APIs admin y perfil rechazan requests sin sesion con `401`.
- Dashboard sin sesion redirige por middleware.
- Tests automatizados pasan.
- No quedan procesos locales de `next start` corriendo despues de la validacion.

## Riesgos restantes

- El warning de Turbopack/NFT sigue pendiente.
- Falta validacion manual en navegador de PPR, streaming y redirecciones dentro de boundaries.
- Falta validar flujos autenticados reales con cookies de sesion.
- Falta validar mutaciones criticas con datos reales.
- Falta Deploy Preview para observar comportamiento serverless/Vercel.

## Proximo paso recomendado

Ejecutar Fase 8: Deploy Preview en Vercel Hobby, con pruebas manuales de autenticacion, dashboard, certificados, donaciones y navegacion cliente.
