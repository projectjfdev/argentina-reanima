# Reporte: Correccion UI CertificatePreview QR

Fecha: 2026-07-08

## Cambio realizado

- Se reubico el QR desde la esquina inferior derecha hacia la esquina inferior izquierda.
- Se movio el numero de serie hacia el centro-izquierda, a la derecha del QR.
- Se agrego una configuracion compartida de posiciones dinamicas:
  - `src/libs/certificates/certificateLayout.ts`
- Se aplico la misma posicion en:
  - preview web `CertificatePreview`.
  - generador PDF `renderCertificatePdf`.

## Motivo

La plantilla firmada ya ocupa la zona inferior derecha con la firma y el texto "Sergio Felice - Instructor". El QR anterior interferia visualmente con esa zona fija.

## Archivos modificados

- `src/libs/certificates/certificateLayout.ts`
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
- `src/libs/certificates/renderCertificatePdf.ts`

## Verificacion

- `npm run build`: exitoso.
- Se verifico que ya no queden referencias al QR anclado con `right-[8%]` ni a `PAGE_WIDTH * 0.79`.

## Observaciones

- El primer intento de build fallo por el `EPERM` conocido del sandbox al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado y compilo correctamente.
- El build mantiene la advertencia existente de Turbopack sobre trazado NFT desde `next.config.ts` hacia Prisma. No fue introducida por este cambio.
