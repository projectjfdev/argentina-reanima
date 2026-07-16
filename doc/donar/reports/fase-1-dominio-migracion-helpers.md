# Reporte Fase 1: dominio, migracion y helpers

## Objetivo cumplido

Se implemento exclusivamente la Fase 1 del plan tecnico de campanas de donacion DEA:

- Modelos y enums base en Prisma para campanas y donaciones.
- Migracion SQL con tablas, indices y restriccion de una sola campana activa.
- Helpers puros para dinero, progreso y validacion de payloads.
- Tipos base de interfaz.
- Tests unitarios de dominio.

No se implementaron APIs, servicios server, Cloudinary, dashboard ni cambios en `/donar`.

## Archivos creados

- `prisma/migrations/20260715133000_donation_campaigns_phase_1/migration.sql`
- `src/libs/donations/money.ts`
- `src/libs/donations/campaignProgress.ts`
- `src/libs/donations/validateDonationCampaignPayload.ts`
- `src/libs/donations/validateDonationPayload.ts`
- `src/libs/donations/index.ts`
- `src/interfaces/donations.ts`
- `src/test/donations/money.test.ts`
- `src/test/donations/campaignProgress.test.ts`
- `src/test/donations/validateDonationCampaignPayload.test.ts`
- `src/test/donations/validateDonationPayload.test.ts`
- `doc/donar/reports/fase-1-dominio-migracion-helpers.md`

## Archivos modificados

- `prisma/schema.prisma`

Tambien se ejecuto `npx prisma generate`, que regenero el cliente Prisma local bajo `src/generated/prisma`. Git no lo marco como cambio pendiente en esta revision.

## Decisiones tecnicas tomadas

- Se agregaron los enums `DonationCampaignStatus` (`ACTIVE`, `COMPLETED`, `ARCHIVED`) y `DonationStatus` (`PENDING`, `APPROVED`, `REJECTED`).
- Se agregaron los modelos `DonationCampaign` y `Donation` con montos `Decimal @db.Decimal(14, 2)`.
- La migracion incluye el indice unico parcial `DonationCampaign_single_active_idx` sobre `status = 'ACTIVE'`, porque Prisma no expresa indices parciales en el schema y la regla debe quedar garantizada en PostgreSQL.
- Los helpers de dinero normalizan formatos usuales de moneda argentina, incluyendo coma decimal y separadores de miles.
- Los helpers no dependen de Prisma ni de Cloudinary para poder testear dominio sin infraestructura.
- El progreso permite total aprobado en cero, pero las donaciones y objetivos siguen exigiendo montos mayores a cero.
- El porcentaje real puede superar 100; el porcentaje visual se limita a 100.
- En codigo fuente se evito usar literales `bigint` porque el target TypeScript actual del proyecto no los acepta en build. Se uso `BigInt("...")`.

## Diferencias respecto del plan original

- El plan mencionaba helpers como ejemplos; se implementaron cuatro helpers concretos: `money`, `campaignProgress`, `validateDonationCampaignPayload` y `validateDonationPayload`.
- El validador de campana exige `placeImageUrl` y `placeImagePublicId`. Aunque la subida real corresponde a Fase 2, el modelo requiere esos campos y el payload final persistible debe validarlos desde Fase 1.
- Se agregaron tipos base en `src/interfaces/donations.ts` sin importar tipos generados de Prisma, para mantenerlos estables antes de conectar UI/APIs.

## Problemas encontrados

- Los primeros intentos de `npm test` y `npx prisma generate` fallaron dentro del sandbox con `EPERM: operation not permitted, lstat 'C:\\Users\\PC Franco'`. Se reejecutaron con permisos escalados, como indica el flujo del entorno.
- El primer build fallo por narrowing de TypeScript al leer `data` de resultados discriminados. Se ajustaron los validadores para que TypeScript vea explicitamente los casos exitosos.
- El segundo build fallo por literales `bigint` con target inferior a ES2020. Se reemplazaron por `BigInt(...)`.
- El build final queda con una advertencia existente de Turbopack/NFT relacionada con `next.config.ts`, `src/generated/prisma/index.js` y `src/app/api/news/[id]/route.ts`. No bloquea el build y no fue introducida por esta fase.
- `git status` muestra cambios preexistentes no tocados en `src/app/(front)/donar/page.tsx`, `src/components/BannerHero/HomeHero.tsx` y `src/components/Navbar/navbar.tsx`.

## Verificaciones realizadas

- `npx prisma generate`: exitoso.
- `npm test -- src/test/donations --run`: 4 archivos, 16 tests pasados.
- `npm test -- --run`: 23 archivos, 99 tests pasados.
- `npm run build`: exitoso.

## Resultado

Fase 1 completada y verificada. La base de dominio queda preparada para Fase 2, pero no se avanzo a servicios server, endpoints, Cloudinary ni UI administrativa/publica.
