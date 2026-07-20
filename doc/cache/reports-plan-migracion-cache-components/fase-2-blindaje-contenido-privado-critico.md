# Fase 2: blindaje de contenido privado, personalizado y critico

Fecha: 2026-07-19

## Objetivo

Implementar la Fase 2 del plan `doc/cache/plan/plan-migracion-cache-components.md`: blindar contenido privado, personalizado y critico antes de activar `cacheComponents`.

No se activo `cacheComponents`, no se agrego cache real, no se uso `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag`, `updateTag` ni `unstable_cache`.

## Cambios realizados

### Headers HTTP no-store

Archivo modificado:

- `next.config.ts`

Se agrego una configuracion centralizada de headers para rutas API privadas o criticas:

- `Cache-Control: no-store, max-age=0`
- `Pragma: no-cache`
- `Expires: 0`

Patrones cubiertos:

- `/api/admin/:path*`
- `/api/auth/:path*`
- `/api/me/certificates`
- `/api/certificates`
- `/api/certificates/:path*`
- `/api/donation-campaigns`
- `/api/donation-campaigns/:path*`
- `/api/donations`

Motivo:

- Cubrir respuestas exitosas y de error sin tener que tocar manualmente cada `NextResponse.json`.
- Reducir riesgo de cache compartida en contenido autenticado o critico.
- Preparar el proyecto para `cacheComponents`, donde `dynamic = "force-dynamic"` deja de ser el mecanismo adecuado para expresar frescura.

### Fetches cliente criticos con no-store

Archivos modificados:

- `src/components/Donations/DonationPageContent.tsx`
- `src/components/Dashboard/Donations/DonationCampaignDashboard.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`

Cambios:

- Se agrego `cache: "no-store"` en la carga paginada de donantes publicos de una campana.
- Se agrego `cache: "no-store"` en el envio publico de donaciones.
- Se agrego `cache: "no-store"` en fetches privados del dashboard de donaciones/campanas:
  - listar campanas admin;
  - listar donaciones admin;
  - crear/editar campana;
  - completar/archivar campana;
  - aprobar donacion;
  - rechazar donacion;
  - reabrir donacion;
  - corregir monto;
  - abrir comprobante firmado.
- Se agrego `cache: "no-store"` en fetches privados del dashboard de certificados:
  - listar certificados;
  - validar Excel bulk;
  - crear certificados bulk;
  - crear/editar certificado;
  - eliminar certificado.

## Archivos modificados

- `next.config.ts`
- `src/components/Donations/DonationPageContent.tsx`
- `src/components/Dashboard/Donations/DonationCampaignDashboard.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`

## Archivos creados

- `doc/cache/reports-plan-migracion-cache-components/fase-2-blindaje-contenido-privado-critico.md`

## Verificacion ejecutada

- `npm run test:run`
  - Resultado: paso.
  - 27 archivos de test, 112 tests.
- `npm run build`
  - Resultado: paso.
  - La clasificacion de rutas se mantiene compatible con el estado anterior.
  - Se mantiene el warning previo de Turbopack sobre tracing de `next.config.ts` desde Prisma. No fue introducido por esta fase.

## Estado final

La Fase 2 queda completada.

Las APIs privadas, personalizadas y publicas criticas quedan cubiertas por headers `no-store`, y los fetches cliente sensibles quedan marcados explicitamente como `cache: "no-store"`.

Esto no introduce cache nueva ni cambia la estrategia funcional de datos. El proyecto queda mejor preparado para la Fase 3, donde se deben aislar paginas Server Components runtime antes de activar `cacheComponents`.
