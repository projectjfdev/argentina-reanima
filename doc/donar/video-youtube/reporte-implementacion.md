# Reporte de implementacion: video de YouTube en campanas DEA

## Objetivo

Se agrego soporte para cargar opcionalmente una URL de YouTube en campanas de donacion DEA y mostrar el video en `/donar` solo cuando la campana activa tenga una URL valida.

## Cambios realizados

- Se agrego `DonationCampaign.youtubeVideoUrl` como campo nullable en Prisma.
- Se creo la migracion `20260721153000_donation_campaign_youtube_video`.
- Se actualizo la validacion de campanas para aceptar URL opcional de YouTube.
- Se agrego el helper `src/libs/donations/youtubeVideo.ts` para validar formatos habituales:
  - `youtube.com/watch?v=...`
  - `youtu.be/...`
  - `youtube.com/shorts/...`
  - `youtube.com/embed/...`
  - `youtube.com/live/...`
  - `youtube-nocookie.com/embed/...`
- Se normalizan las URLs a formato canonico `https://www.youtube.com/watch?v=VIDEO_ID`, descartando parametros extra como `list` para evitar que una playlist/radio provoque un reproductor negro.
- Se actualizaron endpoints administrativos de creacion y edicion para persistir el campo.
- Se actualizaron serializadores y endpoints publicos para exponer el campo de forma segura.
- Se actualizo el dashboard de campanas DEA con un campo opcional "Video de YouTube" y errores por campo.
- Se agrego `DonationCampaignVideo`, componente cliente que usa `react-player/youtube` con carga dinamica sin SSR.
- Se integro el video en `/donar` despues del bloque del lugar/proceso, sin renderizar espacio vacio cuando no corresponde.

## Criterios de render publico

- El reproductor se muestra solo si:
  - existe campana;
  - la campana esta `ACTIVE`;
  - `youtubeVideoUrl` existe;
  - la URL pasa la validacion local.
- Si la URL falta o es invalida, el componente retorna `null`.
- Las campanas existentes quedan compatibles porque el campo es nullable.

## Archivos principales

- `prisma/schema.prisma`
- `prisma/migrations/20260721153000_donation_campaign_youtube_video/migration.sql`
- `src/libs/donations/youtubeVideo.ts`
- `src/libs/donations/validateDonationCampaignPayload.ts`
- `src/libs/donations/adminApi.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/route.ts`
- `src/components/Dashboard/Donations/DonationCampaignDashboard.tsx`
- `src/components/Donations/DonationCampaignVideo.tsx`
- `src/components/Donations/DonationPageContent.tsx`
- `src/test/donations/validateDonationCampaignPayload.test.ts`
- `src/test/donations/youtubeVideo.test.ts`

## Validacion ejecutada

- `npx prisma generate`: correcto.
- `npm test -- src/test/donations/validateDonationCampaignPayload.test.ts src/test/donations/youtubeVideo.test.ts`: 2 archivos, 18 tests correctos.
- `npm run build`: correcto.

## Observaciones

El build informa un warning de Turbopack/NFT sobre `next.config.ts` y Prisma en rutas de certificados. La compilacion termina correctamente y el warning no esta relacionado con esta implementacion.
