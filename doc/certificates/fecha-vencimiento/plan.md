# Plan breve: fecha de vencimiento opcional en certificados

## Objetivo

Agregar una fecha de vencimiento opcional como dato informativo del certificado. No debe cambiar la imagen, la preview, el PNG descargable, el estado, la disponibilidad publica ni la aparicion en `/mi-perfil`, aunque la fecha ya haya pasado.

## Plan de implementacion

1. **Modelo `Certificate` y Prisma**
   - Agregar en `prisma/schema.prisma` un campo opcional en `Certificate`, por ejemplo `expiresAt DateTime? @db.Date`.
   - Crear una migracion que agregue una columna nullable para mantener compatibles todos los certificados existentes sin fecha.
   - Regenerar Prisma Client despues de aplicar la migracion.

2. **Validaciones y tipos**
   - Extender `CertificatePayloadInput`, `ValidCertificatePayload`, `CertificateFormValues`, `CertificateSubmitPayload`, `CertificateListItem` y los tipos de respuesta que correspondan con `expiresAt` opcional.
   - En `src/libs/certificates/validateCertificatePayload.ts`, aceptar `expiresAt` como string vacio, `null` o `undefined` y normalizarlo a `null`.
   - Si viene informado desde `<input type="date" />`, validar formato `YYYY-MM-DD` y convertirlo a `Date` sin reglas de negocio por vencimiento.
   - Rechazar solo fechas mal formadas; no rechazar fechas pasadas.

3. **Creacion de certificados**
   - En `POST /api/certificates`, no cambiar el flujo: el endpoint ya guarda `...validation.data`, por lo que alcanza con que el validador incluya `expiresAt`.
   - Los certificados creados sin fecha deben persistirse con `expiresAt: null`.
   - No modificar la generacion de `publicId`, numero de serie, QR ni plantilla.

4. **Edicion de certificados**
   - En `PUT /api/certificates/[publicId]`, reutilizar el mismo `validateCertificatePayload`.
   - Permitir guardar una nueva fecha, cambiarla o eliminarla enviando string vacio/null para persistir `expiresAt: null`.
   - No modificar `status`, `deletedAt`, acceso publico ni descarga por efecto de la fecha.

5. **Formulario del panel administrador**
   - En `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`, agregar el campo al modo individual con el componente `Input` existente y `type="date"`.
   - Incluirlo en `EMPTY_FORM_VALUES`, `reset(...)` al editar, `normalizeCertificateFormValues(...)` y el payload JSON.
   - Al editar, transformar el valor recibido a `YYYY-MM-DD` para precargar el input.
   - No pasar `expiresAt` a `CertificatePreviewData` ni mostrarlo en la preview.
   - Mantener la creacion masiva por Excel sin cambios funcionales; los certificados masivos quedarian con `expiresAt: null` salvo que se defina otro requerimiento para Excel.

6. **APIs, servicios y serializacion**
   - Actualizar los `serializeCertificate(...)` de `src/app/api/certificates/route.ts` y `src/app/api/certificates/[publicId]/route.ts` para devolver `expiresAt` como ISO string o `null`.
   - Incluir `expiresAt` en los `select` publicos necesarios: `src/app/api/certificates/validate/[publicId]/route.ts`, la pagina server de validacion y `/api/me/certificates` si se mantiene como contrato consumible.
   - Si se agrega un helper de formato, ubicarlo en `src/libs/certificates` y mantenerlo simple, por ejemplo salida `dd/mm/yyyy`.

7. **Pagina publica `/certificado/validar/[publicId]`**
   - En `src/app/(front)/certificado/validar/[publicId]/page.tsx`, seleccionar `expiresAt` y pasarlo a `CertificateValidationContent`.
   - En `CertificateValidationContent`, renderizar un `ValidationItem` condicional dentro de "Datos de validacion": `Fecha de vencimiento: 15/10/2028`.
   - Si `expiresAt` es `null`, no renderizar ningun bloque, texto vacio ni placeholder.
   - No incluir esta fecha dentro de `CertificatePreview`, QR, imagen ni PNG descargable.

8. **Listado en `/mi-perfil`**
   - En `src/app/(front)/mi-perfil/page.tsx`, agregar `expiresAt` al `select`.
   - En cada card de certificado, mostrar condicionalmente `Fecha de vencimiento: dd/mm/yyyy` junto a los metadatos existentes, manteniendo las clases visuales actuales.
   - Si no hay fecha, no mostrar nada adicional.
   - No ocultar certificados vencidos ni cambiar la etiqueta "Activo".

9. **Tests afectados**
   - Actualizar fixtures de `src/test/certificates/CertificatesDashboard.test.tsx` con `expiresAt` opcional y agregar casos para crear, editar y limpiar la fecha desde el formulario.
   - Extender `src/test/certificates/validateCertificatePayload.test.ts` para cubrir fecha ausente, fecha valida, string vacio/null y formato invalido.
   - Agregar o ajustar tests de render para `CertificateValidationContent` y `/mi-perfil` si existen o se crean, verificando render condicional y ausencia de texto cuando `expiresAt` es `null`.
   - Ejecutar `npm run test:run -- src/test/certificates` y `npm run build` como verificacion minima.
