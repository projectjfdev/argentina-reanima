# Reporte Fase 7: ruta publica `/campanas-dea`

## Objetivo cumplido

Se implemento exclusivamente la Fase 7 del plan tecnico:

- Ruta publica `/campanas-dea`.
- Endpoint publico `GET /api/donation-campaigns`.
- Listado publico de campanas `ACTIVE` y `COMPLETED`.
- Campanas `ARCHIVED` excluidas del payload publico.
- Cards publicas con imagen, institucion, localidad, direccion, progreso y estado.
- Paginacion simple con boton "Ver mas".

No se implemento `/campanas-dea/[slug]`, no se agregaron filtros avanzados y no se avanzo a Fase 8.

## Archivos creados

- `src/app/api/donation-campaigns/route.ts`
- `src/components/Donations/DonationCampaignsPageContent.tsx`
- `src/app/(front)/campanas-dea/page.tsx`
- `doc/donar/reports/fase-7-ruta-publica-campanas-dea.md`

## Endpoint publico

### `GET /api/donation-campaigns`

- Devuelve solo campanas con estado:
  - `ACTIVE`
  - `COMPLETED`
- No devuelve campanas `ARCHIVED`.
- Soporta:
  - `page`
  - `pageSize`
- Limita `pageSize` a 24.
- Ordena activas primero y luego completadas.
- Serializa solo datos publicos:
  - `id`
  - `institutionName`
  - `locality`
  - `address`
  - `placeImageUrl`
  - `goalAmount`
  - `status`
  - fechas publicas
  - `approvedTotal`
  - `percentage`
  - `visualPercentage`
  - `canDonate`
- No expone emails, comprobantes, `receiptUrl`, `receiptPublicId`, `placeImagePublicId` ni datos administrativos.

## Pagina publica

### `/campanas-dea`

- Muestra una cabecera publica con la campana activa destacada si existe.
- Muestra cards de campanas activas y completadas.
- La campana activa incluye CTA hacia `/donar`.
- Las completadas aparecen como historicas con estado "Objetivo alcanzado".
- Si no hay campanas publicas, muestra estado vacio.
- Usa imagen real de la campana (`placeImageUrl`) y fallback solo para cabecera sin activa.
- El progreso se calcula con donaciones aprobadas por administracion.

## Decisiones tecnicas

- Se implemento la API publica aunque el plan la marcaba opcional, para mantener la pagina desacoplada de Prisma y preparada para crecimiento.
- Se mantuvo una pagina client-side para permitir carga incremental con "Ver mas".
- No se agrego slug ni detalle individual porque el plan lo excluia explicitamente.
- Se mantuvo `id` en el payload publico porque ya se usa en APIs publicas existentes, pero no se implementaron links de detalle.

## Problemas encontrados

- La primera verificacion de `GET /api/donation-campaigns` devolvio 500 porque la base local configurada no tenia aplicadas las migraciones de donaciones (`DonationCampaign` no existia).
- Se ejecuto `npx prisma migrate deploy` y se aplicaron:
  - `20260715133000_donation_campaigns_phase_1`
  - `20260716102000_donation_amount_nullable_business_change`
- Despues de aplicar migraciones, `/api/donation-campaigns` y `/campanas-dea` respondieron 200 OK.
- `git status` normal sigue bloqueado por `dubious ownership`; se reviso con `git -c safe.directory='C:/Users/PC Franco/Desktop/arg-reanima-devjf' ...`.
- Los tests de Node se ejecutaron con permisos escalados porque el sandbox ya habia fallado en fases anteriores con `EPERM: operation not permitted, lstat 'C:\\Users\\PC Franco'`.
- `npm run build` pasa, pero mantiene una advertencia no bloqueante de Turbopack/NFT relacionada con Prisma generado y rutas API existentes.
- `git status` muestra cambios preexistentes no tocados en:
  - `public/images/dea.png`
  - `src/app/(front)/donar/page.tsx`
  - `src/components/BannerHero/HomeHero.tsx`
  - `src/components/Navbar/navbar.tsx`

## Verificaciones realizadas

- `npm run build`: exitoso.
- `npm test -- src/test/donations --run`: 6 archivos, 22 tests pasados.
- `npm test -- --run`: 25 archivos, 105 tests pasados.
- Busqueda en la nueva API/pagina publica: no hay exposicion de email, comprobantes ni IDs de Cloudinary.
- `Invoke-WebRequest http://localhost:3000/api/donation-campaigns`: 200 OK.
- `Invoke-WebRequest http://localhost:3000/campanas-dea`: 200 OK.

## Resultado

Fase 7 completada y verificada. Existe una base publica simple para listar campanas DEA activas y completadas, lista para crecer en una futura ruta de detalle si se agrega slug o identificador publico.
