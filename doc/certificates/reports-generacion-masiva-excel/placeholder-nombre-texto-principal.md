# Reporte breve: placeholder de nombre en texto principal

Fecha: 2026-07-14

## Cambios realizados

- Se agrego el placeholder `{{nombre}}` para el texto principal del certificado.
- Se agrego una plantilla por defecto:
  - `Se deja constancia que {{nombre}} ha participado de la actividad indicada por Argentina Reanima.`
- Al iniciar, limpiar o reiniciar el formulario, el texto principal vuelve a la plantilla por defecto.
- El administrador puede editar el texto alrededor del placeholder.
- Si se elimina `{{nombre}}`, se muestra error y no se permite crear certificados individuales ni masivos.
- En preview individual, `{{nombre}}` se reemplaza por el nombre cargado.
- En preview masiva, `{{nombre}}` se reemplaza por el primer participante validado o por un nombre de ejemplo.
- En certificados creados por Excel, cada certificado conserva la plantilla y se renderiza con el nombre de su fila.
- En listado administrativo, vista publica, descarga PNG y perfil, se muestra el texto renderizado con el nombre real.
- Se agrego una ayuda breve debajo del campo: el nombre del participante se insertara automaticamente.

## Archivos modificados

- `src/libs/certificates/certificateTextTemplate.ts`
  - Nuevo helper reutilizable para plantilla, validacion y renderizado.
- `src/libs/certificates/index.ts`
  - Exporta los helpers de plantilla.
- `src/libs/certificates/validateCertificatePayload.ts`
  - Valida que el texto principal incluya `{{nombre}}`.
- `src/app/api/certificates/bulk/route.ts`
  - Valida que el texto compartido del lote incluya `{{nombre}}`.
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
  - Usa la plantilla por defecto.
  - Valida el placeholder en frontend.
  - Renderiza texto dinamico en preview y listado.
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
  - Renderiza el texto reemplazando `{{nombre}}`.
- `src/components/Dashboard/Certificates/CertificateValidationContent.tsx`
  - Muestra y comparte el texto renderizado.
- `src/app/(front)/mi-perfil/page.tsx`
  - Muestra el texto renderizado en certificados del usuario.
- `src/test/certificates/certificateTextTemplate.test.ts`
  - Tests del helper de plantilla.
- `src/test/certificates/validateCertificatePayload.test.ts`
  - Tests de validacion del placeholder.

## Verificaciones realizadas

- `npm run build`
  - Exitoso.
  - Se mantiene la advertencia no bloqueante ya conocida de Turbopack sobre tracing desde `next.config.ts`/Prisma.
- `npm run test:run`
  - Exitoso.
  - 18 archivos de test pasaron.
  - 74 tests pasaron.
