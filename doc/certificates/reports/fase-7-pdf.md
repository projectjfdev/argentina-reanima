# Reporte fase 7: PDF

Fecha: 2026-07-08

## Alcance ejecutado

- Se agrego la dependencia `pdf-lib`.
- Se implemento generador PDF desde:
  - `public/certificado-template/certificado-template-firmado.png`.
  - datos persistidos del certificado.
  - QR de la URL publica.
- Se agrego endpoint publico de descarga PDF.
- Se agrego boton "Descargar PDF" en la pagina publica de certificado activo.
- Se evita generar PDF para certificados eliminados.

## Archivos modificados o agregados

- `package.json`
- `package-lock.json`
- `src/libs/certificates/renderCertificatePdf.ts`
- `src/app/api/certificates/validate/[publicId]/pdf/route.ts`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/libs/certificates/index.ts`

## Detalles tecnicos

- El endpoint agregado es:
  - `GET /api/certificates/validate/[publicId]/pdf`
- El endpoint es publico y usa `publicId`, no ID interno.
- El endpoint fuerza `runtime = "nodejs"` porque el generador lee la plantilla desde `public`.
- Si el certificado no existe, devuelve `404`.
- Si el certificado esta eliminado, devuelve `410 Gone`.
- Si el certificado esta activo, devuelve:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="certificado-${serialNumber}.pdf"`
  - `Cache-Control: no-store`
- El PDF se genera bajo demanda desde la base de datos, por lo que refleja ediciones posteriores.
- El generador PDF no se exporta desde el barrel `src/libs/certificates/index.ts` para evitar que `fs/promises` entre en bundles cliente.

## Verificacion

- `npm install pdf-lib`: exitoso.
- `npm run build`: exitoso.
- Next detecto la ruta nueva:
  - `/api/certificates/validate/[publicId]/pdf`

## Observaciones

- `npm install pdf-lib` reporto las vulnerabilidades ya presentes en el arbol: 7 moderadas y 8 altas. No se ejecuto `npm audit fix` porque puede cambiar dependencias fuera del alcance de fase 7.
- El primer intento de `npm run build` fallo dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado.
- El primer build real fallo porque el generador PDF estaba exportado desde un barrel usado por componentes cliente; se corrigio importandolo solo desde el endpoint server-side.
- El build mantiene la advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No fue introducida por esta fase y no bloquea la compilacion.
- No se ejecuto hardening final completo. Eso corresponde a fase 8.

## Criterio de salida

- [x] PDF se descarga desde URL publica.
- [x] PDF refleja datos persistidos actuales.
- [x] PDF se genera desde plantilla base, datos persistidos y QR.
- [x] PDF no depende de imagen manual generada previamente.
- [x] PDF no se genera para certificados eliminados.
- [x] `npm run build` compila.
