# Plan: firmas dinamicas en certificados

## Estado actual detectado

- El formulario administrativo vive en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx` y usa `react-hook-form`.
- Los datos actuales del certificado son: destinatario, email, DNI, texto principal, texto inferior y numero de serie.
- La persistencia esta en el modelo `Certificate` de Prisma y no guarda ningun dato de firmas.
- `POST /api/certificates` y `PUT /api/certificates/[publicId]` validan el payload con `validateCertificatePayload`.
- La vista previa, la pagina publica y la descarga PNG comparten `CertificatePreview`.
- La descarga PNG no tiene generador propio: `exportCertificatePreviewToPng` rasteriza el DOM de `CertificatePreview`.
- La plantilla usada hoy es `public/certificado-template/certificado-template-firmado.png`.
- Ya existen los assets nuevos:
  - `public/certificado-template/certificado-template.png`
  - `public/firmas/Sergio-felice.png`
  - `public/firmas/Emir.png`
  - `public/firmas/Diego-Lafalce.png`
  - `public/firmas/Santiago_Gonzalez_Goller.png`

## Decisiones necesarias

- Reemplazar la plantilla firmada por `certificado-template.png` en `CertificatePreview`.
- Renderizar las firmas como capas dinamicas dentro de `CertificatePreview`, porque ese componente alimenta preview, vista publica y descarga PNG.
- Persistir la eleccion de firma de instructor en el certificado. Sin persistencia, un certificado ya emitido podria cambiar si cambia el formulario o la opcion por defecto.
- Agregar al modelo datos minimos:
  - `instructorSignatureEnabled` booleano.
  - `instructorKey` opcional, con valores controlados para `emir`, `diego-lafalce`, `santiago-gonzalez-goller`.
- Mantener fija la firma derecha de Sergio Felice sin guardarla en DB, porque siempre debe aparecer.
- Centralizar la configuracion de firmas en un helper o constante compartida, no hardcodearla en varios componentes.
- La firma y el nombre del instructor deben salir de una unica seleccion (`instructorKey`). El admin no debe poder combinar nombre y firma por separado.
- No hay certificados emitidos ni datos productivos que preservar; la nueva plantilla y la firma fija de Sergio son el unico comportamiento valido desde el inicio.

## Fase 1: Configuracion de layout y assets

- Actualizar `src/libs/certificates/certificateLayout.ts` para agregar posiciones y estilos de:
  - firma derecha de Sergio.
  - nombre `Sergio Felice`.
  - cargo `Presidente`.
  - firma izquierda opcional de instructor.
  - nombre de instructor.
  - cargo `Instructor`.
- Agregar una constante de instructores disponibles con `key`, nombre visible y ruta de imagen:
  - Emir -> `/firmas/Emir.png`
  - Diego Lafalce -> `/firmas/Diego-Lafalce.png`
  - Santiago Gonzalez Goller -> `/firmas/Santiago_Gonzalez_Goller.png`
- Ajustar el bloque `footerText` para que quede centrado, manteniendo su posicion general salvo que la nueva zona de firmas obligue a pequenos ajustes.

## Fase 2: Modelo y validacion

- Agregar campos al modelo `Certificate` en `prisma/schema.prisma` para conservar la seleccion de instructor.
- Crear la migracion correspondiente.
- Actualizar `validateCertificatePayload.ts` para aceptar:
  - `instructorSignatureEnabled`.
  - `instructorKey`.
- Reglas:
  - Si `instructorSignatureEnabled` es `false`, `instructorKey` puede guardarse como `null`.
  - Si `instructorSignatureEnabled` es `true`, `instructorKey` debe ser uno de los instructores permitidos.
  - No aceptar rutas de imagen desde el cliente.
  - No aceptar nombres de instructor desde el cliente; el nombre se resuelve desde `instructorKey`.

## Fase 3: APIs administrativas y consultas publicas

- Extender `POST /api/certificates` y `PUT /api/certificates/[publicId]` para guardar los nuevos campos validados.
- Extender `GET /api/certificates` y `GET /api/certificates/[publicId]` para devolver esos campos al dashboard.
- Extender la consulta server-side de `src/app/(front)/certificado/validar/[publicId]/page.tsx` para seleccionar los campos de firma.
- No modificar permisos ni flujo de soft delete.

## Fase 4: Formulario administrativo

- Actualizar `CertificateFormValues`, `EMPTY_FORM_VALUES`, `CertificateListItem` y `handleSelectCertificate` en `CertificatesDashboard.tsx`.
- Agregar un control para elegir si se agrega firma de instructor.
- Agregar un `select` usando el componente existente `src/components/ui/select.tsx`.
- Mostrar el select solo cuando la firma de instructor este habilitada, o dejarlo visible pero deshabilitado cuando no aplique.
- Enviar los nuevos campos dentro del mismo payload de creacion/edicion.
- Pasar los valores observados a `CertificatePreview` para que la vista previa cambie en tiempo real.

## Fase 5: Preview, vista publica y descarga PNG

- Cambiar la imagen base de `CertificatePreview` a `/certificado-template/certificado-template.png`.
- Renderizar siempre a la derecha:
  - imagen `/firmas/Sergio-felice.png`.
  - texto `Sergio Felice`.
  - texto `Presidente`.
- Renderizar a la izquierda solo si el certificado tiene firma de instructor habilitada:
  - imagen del instructor seleccionado.
  - nombre del instructor.
  - texto `Instructor`.
- Centrar el texto inferior (`footerText`) en `CertificatePreview`.
- Verificar que `exportCertificatePreviewToPng` no requiera cambios funcionales, ya que ya inlinea todas las imagenes del DOM antes de exportar.

## Orden recomendado

1. Configurar instructores, posiciones y assets.
2. Persistir y validar la seleccion del instructor.
3. Propagar los campos por APIs y pagina publica.
4. Agregar controles al formulario administrativo.
5. Renderizar firmas dinamicas en `CertificatePreview`.
6. Revisar manualmente creacion, edicion, vista publica y descarga PNG.

## Fuera de alcance para este cambio

- No agregar PDF si el flujo actual de descarga sigue siendo PNG.
- No crear ABM de instructores; la lista inicial puede quedar como constante.
- No cambiar QR, textos principales, serializacion general, permisos ni vinculacion de usuarios.
- No definir versionado historico de plantilla.
- No agregar tests ni refactors generales salvo que aparezca una incompatibilidad directa al implementar estos campos.
