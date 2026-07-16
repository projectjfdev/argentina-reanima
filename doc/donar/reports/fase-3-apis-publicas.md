# Reporte Fase 3: APIs publicas

## Objetivo cumplido

Se implemento exclusivamente la Fase 3 del plan tecnico:

- Endpoint publico para obtener la campana visible en `/donar`.
- Endpoint publico paginado para listar donantes aprobados de una campana.
- Endpoint publico para enviar donaciones reales con `FormData` y comprobante.
- Cambio de negocio aplicado: el donante no declara monto; el monto queda para aprobacion administrativa.
- Serializacion publica sin datos privados de comprobantes, emails ni IDs internos de donaciones.
- Revalidacion de `/donar` y endpoints relacionados al recibir una donacion pendiente.

No se implementaron APIs administrativas, dashboard, refactor dinamico de `/donar` ni ruta publica `/campanas-dea`.

## Archivos creados

- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/donations/route.ts`
- `prisma/migrations/20260716102000_donation_amount_nullable_business_change/migration.sql`
- `doc/donar/reports/fase-3-apis-publicas.md`

## Archivos modificados

- `prisma/schema.prisma`
- `src/generated/prisma/*`
- `src/interfaces/donations.ts`
- `src/libs/donations/validateDonationPayload.ts`
- `src/libs/donations/donationService.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `doc/donar/plan/plan.md`
- `src/test/donations/validateDonationPayload.test.ts`

## Endpoints implementados

### `GET /api/donation-campaigns/current`

- Busca primero una campana `ACTIVE`.
- Si no existe activa, devuelve la ultima `COMPLETED`.
- Si no existe campana visible, devuelve `campaign: null` y `donors: []`.
- Incluye datos publicos de campana:
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
- Incluye los primeros 10 donantes aprobados, recientes primero.
- Solo lista donantes aprobados con monto administrativo cargado.
- No expone `placeImagePublicId`, emails, comprobantes, `receiptPublicId`, `receiptUrl` ni IDs de donaciones.

### `GET /api/donation-campaigns/[id]/donors`

- Valida `id` numerico positivo.
- Devuelve 404 si la campana no existe.
- Lista solo donaciones `APPROVED`.
- Exige que esas donaciones tengan `amount` no null.
- Ordena por `createdAt desc`.
- Soporta `page` y `pageSize`, con maximo de 50.
- Devuelve `totalDonors`, `currentPage`, `pageSize` y `totalPages`.
- Serializa cada donante como:
  - `displayName`
  - `amount`
  - `createdAt`
- Para donaciones anonimas muestra `Anonimo`.
- No expone emails, comprobantes, IDs internos ni estado administrativo.

### `POST /api/donations`

- Recibe `FormData`.
- Campos esperados:
  - `campaignId`
  - `visibility`
  - `firstName`
  - `lastName`
  - `email`
  - `receipt`
- Rechaza `amount` con 400 si viene en el `FormData`, porque el monto lo ingresa un administrador al aprobar.
- Tambien acepta `comprobante` como alias del archivo para facilitar integracion futura con UI en espanol.
- Exige comprobante antes de llamar al servicio.
- Delega validaciones de visibilidad, nombres, email, campana activa, upload Cloudinary y escritura transaccional a `createPendingDonationWithReceipt`.
- Crea donaciones en estado `PENDING`.
- Crea donaciones con `amount = null`.
- Devuelve 201 con datos publicos minimos de la donacion creada.
- Mapea `DonationServiceError` a su status HTTP correspondiente:
  - 400 validacion;
  - 404 campana inexistente;
  - 409 campana no activa;
  - 502 error de upload.

## Decisiones tecnicas tomadas

- Los tres route handlers usan `dynamic = "force-dynamic"` para evitar respuestas publicas obsoletas en esta etapa.
- La serializacion de montos usa `toString()` sobre `Decimal` para no perder precision.
- `GET current` reutiliza `attachCampaignProgress`, por lo que el total aprobado y los porcentajes siguen saliendo de los helpers/servicios de fases anteriores.
- `POST /api/donations` no devuelve `email`, `receiptUrl`, `receiptPublicId`, `receiptResourceType`, `receiptOriginalName`, `receiptBytes` ni `id`.
- `POST /api/donations` tampoco devuelve ni acepta `amount`.
- Se incluyo `campaign.id` en `GET current` porque el POST publico requiere asociar explicitamente la donacion a la campana correcta.
- `Donation.amount` paso a ser nullable en Prisma y se agrego una migracion incremental para quitar `NOT NULL`.
- `approveDonation` ahora exige un monto de entrada, lo valida con las reglas de dinero existentes y lo guarda en la misma transaccion en que marca la donacion como `APPROVED`.
- La revalidacion se hace sobre:
  - `/donar`
  - `/api/donation-campaigns/current`
  - `/api/donation-campaigns/:id/donors`

## Diferencias respecto del plan original

- La Fase 3 original pedia `amount` en el POST publico, pero el cambio de negocio lo elimina. Se actualizo el plan para que el monto exista solo al aprobar desde administracion.
- La Fase 3 pedia `receipt`/comprobante como `FormData`; se implemento `receipt` y tambien el alias `comprobante`.
- El plan de Fase 2 indicaba que los comprobantes no debian aceptar PDF, pero el helper existente de Fase 2 permite `application/pdf`. Esta fase no cambio esa regla para no reabrir alcance de Fase 2. Si se quiere cumplir estrictamente la nota original, hay que ajustar `src/libs/donations/cloudinaryDonationStorage.ts`.
- No se agrego `clientSubmissionId` ni idempotencia estricta porque el plan lo marcaba como opcional.
- No se agregaron tests especificos de route handlers. Se verifico con build y suite existente; tests de APIs quedan naturalmente para Fase 8.

## Problemas encontrados

- `git status` normal sigue bloqueado por `dubious ownership`. Para revisar el estado se uso `git -c safe.directory='C:/Users/PC Franco/Desktop/arg-reanima-devjf' ...` sin modificar configuracion global.
- `npm test` dentro del sandbox volvio a fallar con `EPERM: operation not permitted, lstat 'C:\\Users\\PC Franco'`. Se reejecuto con permisos escalados, igual que en fases anteriores.
- `npm run build` pasa, pero Turbopack muestra una advertencia NFT relacionada con `next.config.ts`, `src/generated/prisma/index.js` y el nuevo endpoint `src/app/api/donation-campaigns/current/route.ts`. No bloquea la compilacion.
- `git status` muestra cambios preexistentes no tocados en:
  - `prisma/schema.prisma`
  - `src/app/(front)/donar/page.tsx`
  - `src/components/BannerHero/HomeHero.tsx`
  - `src/components/Navbar/navbar.tsx`
  - archivos de Fase 1 y Fase 2 bajo `doc/donar`, `prisma/migrations`, `src/libs/donations`, `src/interfaces/donations.ts` y `src/test/donations`.

## Verificaciones realizadas

- `npm run build`: exitoso.
- `npx prisma generate`: exitoso.
- `npm test -- src/test/donations --run`: 6 archivos, 22 tests pasados.
- `npm test -- --run`: 25 archivos, 105 tests pasados.

## Resultado

Fase 3 completada y verificada con el cambio de negocio aplicado. El proyecto queda con APIs publicas listas para alimentar `/donar` y recibir donaciones pendientes sin monto declarado por el donante. No se avanzo a APIs administrativas, dashboard ni refactor de UI.
