# Reporte fase 1: Modelo y migracion

Fecha: 2026-07-07

## Alcance ejecutado

- Se agrego el enum `CertificateStatus` al schema Prisma.
- Se agrego el modelo `Certificate` al schema Prisma con:
  - `publicId` unico.
  - `serialNumber` unico.
  - asociacion opcional con `User`.
  - soft delete mediante `status` y `deletedAt`.
  - indices para email normalizado, DNI, usuario y estado.
- Se agrego la relacion `User.certificates`.
- Se creo la migracion `20260707130000_certificates_phase_1`.
- Se regenero Prisma Client.
- Se definieron helpers reutilizables:
  - `normalizeCertificateEmail`.
  - `generateCertificatePublicId`.
  - barrel export en `src/libs/certificates/index.ts`.

## Archivos modificados o agregados

- `prisma/schema.prisma`
- `prisma/migrations/20260707130000_certificates_phase_1/migration.sql`
- `src/generated/prisma/*`
- `src/libs/certificates/normalizeCertificateEmail.ts`
- `src/libs/certificates/generateCertificatePublicId.ts`
- `src/libs/certificates/index.ts`

## Verificacion

- `npx prisma generate`: exitoso.
- Prisma Client contiene el modelo `Certificate` y el enum `CertificateStatus`.
- `npm run build`: exitoso.

## Observaciones

- Los comandos `npx prisma generate` y `npm run build` fallaron primero dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzaron con permiso escalado y finalizaron correctamente.
- El build emitio una advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No bloqueo la compilacion.
- No se implemento vinculacion de certificados con registro por credenciales ni Google. Eso queda para fase 2 segun el plan.
- No se implementaron APIs, dashboard, QR, perfil ni PDF.

## Criterio de salida

- [x] `npm run build` compila.
- [x] Prisma Client contiene el modelo `Certificate`.
