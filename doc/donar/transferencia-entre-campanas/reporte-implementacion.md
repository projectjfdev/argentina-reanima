# Reporte de implementacion: transferencia simple de excedentes entre campanas

## Objetivo implementado

Se implemento la funcionalidad definida en `doc/donar/transferencia-entre-campanas/README.md`: cuando una campana supera su objetivo, el sistema registra el excedente y lo aplica automaticamente a la siguiente campana disponible, manteniendo una solucion simple y acorde al volumen esperado de Argentina Reanima.

La implementacion evita convertir el modulo en un sistema contable complejo:

- No se agregaron estados de transferencia.
- No se agregaron reversas ni transferencias compensatorias.
- No se crearon donaciones artificiales.
- No se descuenta el excedente del total historico de la campana origen.

## Comportamiento resultante

- La campana origen sigue mostrando el total real recibido por donaciones aprobadas propias.
- Si la campana origen supera el objetivo, se registra una transferencia de excedente.
- Si no existe campana siguiente, la transferencia queda pendiente con `targetCampaignId = null`.
- Al crear una nueva campana activa, se aplican automaticamente las transferencias pendientes anteriores.
- La campana destino suma las transferencias entrantes a su progreso.
- Las transferencias no aparecen en el listado publico de donantes.
- Las correcciones posteriores de montos aprobados recalculan y actualizan el excedente asociado.
- Si una correccion elimina un excedente pendiente, el registro pendiente se borra.
- Si una correccion elimina un excedente ya aplicado, el registro se conserva con monto `0.00` para no hacer desaparecer historial operativo.

## Archivos creados

- `doc/donar/transferencia-entre-campanas/README.md`
  - Plan actualizado y simplificado de la funcionalidad.

- `doc/donar/transferencia-entre-campanas/reporte-implementacion.md`
  - Este reporte.

- `prisma/migrations/20260721120000_donation_campaign_transfers/migration.sql`
  - Crea la tabla `DonationCampaignTransfer`.
  - Agrega restriccion de monto no negativo.
  - Agrega restriccion para evitar que origen y destino sean la misma campana.
  - Agrega indice unico por `sourceCampaignId`.
  - Agrega indice por `targetCampaignId`.
  - Agrega claves foraneas a `DonationCampaign`.

- `src/libs/donations/campaignTransferService.ts`
  - Nuevo servicio para:
    - calcular donaciones propias aprobadas;
    - calcular transferencias entrantes;
    - obtener resumen de fondos;
    - sincronizar excedentes salientes;
    - aplicar transferencias pendientes a una nueva campana;
    - calcular progreso incluyendo fondos transferidos hacia destino.

- `src/test/donations/campaignTransferService.test.ts`
  - Tests del nuevo servicio de transferencias.

## Archivos modificados

### Modelo y Prisma

- `prisma/schema.prisma`
  - Agregado modelo `DonationCampaignTransfer`.
  - Agregadas relaciones:
    - `DonationCampaign.outgoingTransfer`
    - `DonationCampaign.incomingTransfers`

- `src/generated/prisma/*`
  - Regenerado con `npx prisma generate` para incluir el nuevo modelo.

### Servicios de donaciones

- `src/libs/donations/campaignService.ts`
  - `getCampaignProgress` ahora usa resumen de fondos.
  - `attachCampaignProgress` adjunta tambien `funds`.
  - `createDonationCampaign` aplica transferencias pendientes al crear una nueva activa.
  - `updateActiveDonationCampaign` sincroniza excedentes cuando cambia el objetivo.
  - `markDonationCampaignCompleted` sincroniza excedentes al completar manualmente.

- `src/libs/donations/donationService.ts`
  - `approveDonation` sincroniza excedente despues de aprobar.
  - `updateApprovedDonationAmount` sincroniza excedente despues de corregir monto.
  - `reopenDonationReview` sincroniza excedente cuando reabre una donacion aprobada.

- `src/libs/donations/index.ts`
  - Exporta los helpers y tipos del nuevo `campaignTransferService`.

- `src/libs/donations/adminApi.ts`
  - `serializeCampaign` incluye `funds` cuando viene adjunto.

### APIs publicas

- `src/app/api/donation-campaigns/current/route.ts`
  - Serializa campos publicos seguros:
    - `directApprovedTotal`
    - `incomingTransferTotal`
    - `outgoingTransferAmount`
    - `hasIncomingTransfers`
    - `hasOutgoingTransfer`

- `src/app/api/donation-campaigns/route.ts`
  - Agrega los mismos campos publicos al listado de campanas.

### UI publica

- `src/components/Donations/DonationPageContent.tsx`
  - Agrega campos de transferencias al tipo de campana publica.
  - Informa que el excedente sera aplicado a la proxima campana.
  - Muestra transferencias recibidas y excedentes enviados cuando correspondan.
  - Agrega aclaracion en el modal de donacion.
  - Agrega punto informativo sobre excedentes.

- `src/components/Donations/DonationCampaignsPageContent.tsx`
  - Agrega campos de transferencias al tipo de campana publica.
  - Muestra transferencias recibidas en la campana activa destacada.
  - Muestra transferencias recibidas o excedentes enviados en cards de campanas.

### UI administrativa

- `src/components/Dashboard/Donations/DonationCampaignDashboard.tsx`
  - Agrega `funds` al tipo `Campaign`.
  - Muestra:
    - donaciones propias aprobadas;
    - transferencias recibidas;
    - excedente enviado;
    - destino o estado pendiente del excedente.
  - Muestra aviso cuando al crear una campana se aplican fondos pendientes.
  - Ajusta el mensaje de correccion de monto para indicar impacto sobre excedentes.

### Tests existentes

- `src/test/donations/donationReviewWorkflow.test.ts`
  - Actualizados mocks de transaccion para incluir `donationCampaignTransfer`.
  - Se mantiene cobertura del flujo de correccion y reapertura con la nueva sincronizacion.

## Migracion aplicada

Se ejecuto:

```bash
npx prisma generate
npx prisma migrate deploy
```

La migracion `20260721120000_donation_campaign_transfers` fue aplicada correctamente en la base configurada por `.env`.

## Verificaciones realizadas

- `npm test -- src/test/donations --run`
  - 9 archivos pasados.
  - 33 tests pasados.

- `npm test -- --run`
  - 34 archivos pasados.
  - 135 tests pasados.

- `npm run build`
  - Build exitoso.
  - TypeScript exitoso.
  - Se mantiene una advertencia preexistente de Turbopack/NFT relacionada con Prisma generado y `next.config.ts`.

## Notas de consistencia

- Las transferencias se sincronizan dentro de transacciones de Prisma.
- Hay un indice unico por `sourceCampaignId` para evitar duplicados por campana origen.
- Los calculos de dinero usan strings/Decimal y helpers existentes, no floats como fuente de verdad.
- Las APIs publicas no exponen comprobantes ni emails.
- Las transferencias no se mezclan con donantes publicos.

## Cambios no relacionados

`git status` muestra `info.txt` modificado. Ese archivo ya estaba modificado antes de esta implementacion y no forma parte del trabajo de transferencia entre campanas.
