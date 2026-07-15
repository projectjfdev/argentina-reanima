# Plan: generacion masiva de certificados por Excel

## Objetivo

Agregar una segunda modalidad administrativa para emitir certificados desde un archivo Excel, manteniendo intacta la generacion individual actual. El admin debe elegir claramente entre:

- Certificado individual.
- Certificados por Excel.

El lote debe crear un certificado por cada fila valida, usando `Email` y `Nombre` desde el archivo, y compartiendo para todo el lote el texto principal, el texto inferior y la firma opcional del instructor. El numero de serie debe generarse automaticamente tanto para certificados individuales como para certificados por Excel.

## Estado actual relevante

- La pantalla administrativa vive en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`.
- El formulario actual usa `react-hook-form` y envia JSON a `POST /api/certificates` o `PUT /api/certificates/[publicId]`.
- La vista previa se renderiza con `CertificatePreview` y se alimenta con los valores observados del formulario.
- El listado de certificados emitidos esta en el mismo componente y consume `GET /api/certificates`.
- La creacion individual se valida en `src/libs/certificates/validateCertificatePayload.ts`.
- El modelo `Certificate` tiene `serialNumber @unique`, `publicId @unique`, `recipientEmailNormalized` indexado y `recipientDni` obligatorio a nivel Prisma.
- La asociacion con usuarios se hace por `recipientEmailNormalized` y por `userId` cuando existe un usuario con ese email.
- La pagina de perfil y `/api/me/certificates` muestran certificados activos por email normalizado o `userId`.
- La pagina publica `/certificado/validar/[publicId]` y la descarga PNG reutilizan `CertificatePreview`.
- No hay generacion de imagenes en servidor durante la emision; el QR y el PNG se resuelven desde la vista/public URL como hoy.
- No hay dependencia instalada para leer `.xlsx` o `.csv`. Solo existe `react-dropzone`, util para cargar archivos, pero no para parsearlos.

## Como funciona hoy el numero de serie

Hoy el numero de serie no se genera automaticamente. El admin lo escribe en el formulario individual.

El backend:

- exige `serialNumber` en `validateCertificatePayload.ts`;
- consulta `prisma.certificate.findUnique({ where: { serialNumber } })` antes de crear;
- mantiene `serialNumber` como unico en Prisma/base de datos;
- captura errores Prisma `P2002` sobre `serialNumber` como respaldo ante duplicados.

El cambio requerido es reemplazar ese ingreso manual por una generacion automatica compartida para ambos flujos. El formato nuevo es global e independiente del anio: `AR-0001`, `AR-0002`, `AR-0003`, etc.

## Fase 1: Ajuste de modelo de entrada, validaciones y DNI opcional

**Objetivo:** permitir que el DNI quede vacio sin eliminar el campo, y preparar la validacion para que el numero de serie deje de venir desde el cliente.

**Archivos probables:**

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/libs/certificates/validateCertificatePayload.ts`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`
- `prisma/schema.prisma` solo si se decide guardar `null` en vez de string vacio.
- `src/components/Dashboard/Certificates/CertificateValidationContent.tsx`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/api/certificates/validate/[publicId]/route.ts`

**Cambios principales:**

- Quitar el `required` del campo DNI en el formulario individual.
- Quitar el error backend `recipientDni = "El DNI es obligatorio"`.
- Mantener `recipientDni` dentro del payload y del modelo.
- Sacar `serialNumber` del payload de creacion enviado por el formulario individual.
- Separar la validacion de creacion y edicion si hace falta:
  - creacion: no acepta ni exige `serialNumber`, porque se genera en servidor;
  - edicion: definir si el serial queda inmutable y no editable, recomendado para no romper trazabilidad.
- Para minimizar migraciones, guardar DNI ausente como `""` y mostrarlo solo si existe.
- Ajustar textos/listado para no mostrar `DNI ` vacio.

**Riesgos o decisiones necesarias:**

- Decidir si se acepta `""` como valor sin DNI. Es el camino incremental y no requiere Prisma.
- Si se prefiere distinguir ausencia real, cambiar `recipientDni String` a `recipientDni String?`; eso requiere migracion y ajustar tipos donde hoy se asume `string`.

**Verificacion:**

- Crear un certificado individual sin DNI.
- Crear un certificado individual y confirmar que recibe automaticamente el siguiente `AR-000N`.
- Editar un certificado existente con DNI.
- Confirmar que la edicion no permite cambiar el numero de serie desde el formulario.
- Confirmar que listado, validacion publica, perfil y descarga PNG siguen funcionando.

## Fase 2: Selector de modalidad individual o Excel

**Objetivo:** hacer explicita la eleccion de modalidad sin eliminar el formulario individual.

**Archivos probables:**

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- Opcional: extraer subcomponentes internos si el archivo queda dificil de mantener, sin refactor general.

**Cambios principales:**

- Agregar estado local de modalidad, por ejemplo `mode: "single" | "bulk"`.
- Mostrar controles tipo tabs o selector segmentado al inicio del formulario.
- En modo individual, mantener los campos actuales:
  - Nombre.
  - Email.
  - DNI opcional.
  - Texto principal.
  - Texto inferior.
  - Firma opcional del instructor.
- En modo individual, eliminar el campo editable de numero de serie. El admin debe ver, como ayuda o texto informativo, que la serie se asigna automaticamente al guardar.
- En modo Excel, ocultar:
  - Nombre.
  - Email.
  - DNI.
- En modo Excel, mantener visibles:
  - Texto principal.
  - Texto inferior.
  - Firma opcional del instructor.
  - Control para cargar archivo.
- Si se esta editando un certificado existente, deshabilitar o forzar modo individual para no mezclar edicion con creacion masiva.

**Riesgos o decisiones necesarias:**

- La preview en modo Excel no tiene un destinatario unico. Conviene mostrar preview generica con textos/firma compartidos y un serial placeholder, mas una tabla de filas parseadas aparte.

**Verificacion:**

- Alternar modalidades sin perder el flujo individual.
- Confirmar que editar un certificado existente sigue usando el formulario individual.
- Confirmar que no existe ningun input editable para `serialNumber` en creacion individual ni en carga por Excel.
- Confirmar que los campos ocultos no bloquean validacion en modo Excel.

## Fase 3: Lectura, validacion y previsualizacion del archivo

**Objetivo:** validar el archivo antes de crear certificados y evitar lotes parciales inesperados.

**Archivos probables:**

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- Nuevo helper probable: `src/libs/certificates/validateCertificateImportRows.ts`
- Nueva API probable: `src/app/api/certificates/bulk/route.ts`

**Cambios principales:**

- Instalar una dependencia para leer Excel, preferentemente `xlsx` o `exceljs`.
- Aceptar formatos soportados de forma explicita, por ejemplo `.xlsx` y, si se decide, `.csv`.
- Leer la primera hoja del archivo.
- Detectar columnas obligatorias exactas o normalizadas:
  - `Email`
  - `Nombre`
- Ignorar columnas extra.
- Validar por fila:
  - email presente;
  - email con formato valido;
  - nombre presente.
- Generar una previsualizacion con:
  - cantidad de filas validas;
  - lista compacta de errores por numero de fila;
  - emails/nombres que se van a crear.
- No llamar a la creacion si hay errores.

**Riesgos o decisiones necesarias:**

- Decidir si el parseo se hace en cliente o servidor. Para 60 filas, cualquiera sirve.
- Recomendacion: parsear y validar en servidor en la API bulk para que la regla real no dependa del navegador. El cliente puede limitar extension/tamano y mostrar la respuesta de validacion.
- Definir si `.csv` queda incluido desde el inicio. El pedido menciona Excel; soportar solo `.xlsx` reduce superficie.

**Verificacion:**

- Cargar archivo valido con columnas `Email` y `Nombre`.
- Cargar archivo con columnas extra y confirmar que se ignoran.
- Cargar archivo sin columna obligatoria.
- Cargar filas con email vacio, email invalido y nombre vacio.
- Confirmar que no se crea ningun certificado si hay errores.

## Fase 4: Generacion segura de numeros de serie

**Objetivo:** asignar seriales automaticos para creacion individual y lotes, sin duplicados, respetando el formato global `AR-0001`.

**Archivos probables:**

- Nuevo helper probable: `src/libs/certificates/generateCertificateSerialNumbers.ts`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/bulk/route.ts`
- Opcional: helpers compartidos para serializacion/errores si se quiere evitar duplicacion entre endpoints.

**Cambios principales:**

- Usar el prefijo fijo `AR-`.
- Buscar los seriales existentes con formato `AR-0001`, `AR-0002`, `AR-0003`, etc.
- Parsear el sufijo numerico y obtener el maximo real entre todos los certificados existentes, sin separar por anio.
- Para creacion individual, asignar `max + 1`.
- Para un lote de N filas validas, asignar `max + 1` hasta `max + N`, con padding de 4 digitos.
- Crear el certificado individual y el lote dentro de una transaccion que incluya el lock y la asignacion del serial.
- En PostgreSQL, proteger la asignacion con un lock transaccional simple, por ejemplo `pg_advisory_xact_lock` con una clave fija global para certificados. Asi dos lotes concurrentes no leen el mismo maximo.
- Mantener `serialNumber @unique` como defensa final.
- Usar la misma funcion/helper desde `POST /api/certificates` y desde el endpoint bulk para evitar dos implementaciones de secuencia.
- En `POST /api/certificates`, eliminar el chequeo previo sobre un `serialNumber` recibido del cliente y reemplazarlo por la asignacion automatica server-side.

**Riesgos o decisiones necesarias:**

- El padding de 4 digitos alcanza para el volumen actual; si se supera `9999`, definir si se expande automaticamente a 5 digitos o se informa error.
- Prisma no ofrece locks de alto nivel; el lock seria con `$executeRaw` dentro de la transaccion PostgreSQL.
- Si existen certificados historicos con el formato anterior `AR-2026-0001`, definir si se ignoran para el maximo global nuevo o si se migran/normalizan antes de activar la generacion masiva.

**Verificacion:**

- Con ultimo serial `AR-0040`, crear un certificado individual y confirmar `AR-0041`.
- Luego importar 3 filas y confirmar `AR-0042` a `AR-0044`.
- Confirmar que los seriales quedan unicos.
- Simular requests cercanos entre individual e importacion masiva y confirmar que no se pisan; si no se automatiza, al menos revisar manualmente y confiar en el indice unico como fallback.

## Fase 5: Creacion masiva de certificados

**Objetivo:** crear todos los certificados validos del archivo como una unidad, asociando usuarios por email cuando existan.

**Archivos probables:**

- `src/app/api/certificates/bulk/route.ts`
- `src/libs/certificates/validateCertificatePayload.ts`
- `src/libs/certificates/normalizeCertificateEmail.ts`
- Nuevo helper probable: `src/libs/certificates/validateCertificateImportRows.ts`

**Cambios principales:**

- Crear endpoint administrativo protegido con `requireAdminSession()`.
- Recibir `multipart/form-data` con:
  - archivo Excel;
  - `certificateText`;
  - `footerText`;
  - `instructorSignatureEnabled`;
  - `instructorKey`.
- Validar textos y firma con las mismas reglas del flujo individual.
- Validar filas del Excel antes de abrir la creacion.
- Si hay errores, responder `400` con detalle por fila y no crear nada.
- Buscar usuarios existentes por emails normalizados del lote.
- Crear certificados con:
  - `publicId` unico por fila;
  - `recipientName` desde `Nombre`;
  - `recipientEmail` desde `Email`;
  - `recipientEmailNormalized`;
  - `recipientDni: ""`;
  - textos y firma compartidos;
  - `serialNumber` generado;
  - `userId` si existe usuario.
- Ejecutar la creacion en transaccion y devolver resumen:
  - cantidad creada;
  - rango de seriales;
  - certificados creados o al menos datos suficientes para refrescar listado.

**Riesgos o decisiones necesarias:**

- `createUniquePublicId()` hoy vive dentro de `route.ts`; para reutilizarlo en bulk conviene moverlo a un helper compartido o duplicar una version pequena. Mejor helper compartido.
- `createMany` no devuelve todos los registros en todos los contextos; si se necesita devolver URLs publicas, usar `createManyAndReturn` si se confirma soporte en Prisma/PostgreSQL actual, o crear en loop dentro de la transaccion para 60 filas.
- Para este volumen, un loop transaccional con `create` es simple y aceptable.

**Verificacion:**

- Importar un Excel de alrededor de 60 participantes.
- Confirmar que todos aparecen en el listado.
- Confirmar que usuarios existentes ven sus certificados en `/mi-perfil`.
- Confirmar que cada certificado tiene URL publica, QR y descarga PNG como los individuales.
- Confirmar rollback si una creacion falla por duplicado u otro error.

## Fase 6: Integracion con listado y revision manual

**Objetivo:** cerrar el flujo administrativo sin agregar infraestructura extra.

**Archivos probables:**

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/app/api/certificates/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/(front)/mi-perfil/page.tsx`

**Cambios principales:**

- Refrescar el listado despues de crear un lote.
- Mostrar toast/resumen: cantidad creada y rango de seriales.
- Mantener busqueda actual por nombre, email, DNI, texto o serie.
- Ajustar el placeholder de busqueda si DNI ya no siempre existe.
- En listado, mostrar DNI solo si esta presente.
- No agregar colas ni jobs: el volumen esperado de 60 filas permite request sin infraestructura extra.

**Riesgos o decisiones necesarias:**

- Si el administrador necesita descargar todos los certificados del lote inmediatamente, eso seria otro alcance. El pedido actual solo requiere generarlos, no crear PNG/PDF masivos.

**Verificacion:**

- Crear lote y verificar que la pagina vuelve a estado usable.
- Buscar por nombre/email/serie los certificados importados.
- Abrir un certificado creado por lote desde el listado.
- Verificar manualmente vista publica, QR y perfil de usuario.

## Prisma

No hace falta modificar Prisma por el cambio de numero de serie: `serialNumber` debe seguir siendo `String @unique`, solo deja de venir desde el formulario y pasa a asignarse en servidor.

Tampoco hace falta modificar Prisma para la generacion masiva si se guarda el DNI ausente como string vacio (`""`), porque `recipientDni` ya existe y no es unico. Si se quiere representar ausencia como `null`, entonces si hace falta migracion:

```prisma
recipientDni String?
```

Recomendacion incremental: no migrar inicialmente, guardar `""`, quitar la obligatoriedad en validaciones y ajustar las vistas para no mostrar DNI vacio.

## Dependencias

No existe una dependencia instalada para leer Excel o CSV.

- Existe `react-dropzone`, que puede servir para el control de carga.
- No existen `xlsx`, `exceljs` ni `papaparse` en `package.json`.

Recomendacion: agregar una sola dependencia para `.xlsx` cuando se implemente. Para este alcance inicial, soportar `.xlsx` es suficiente salvo que se confirme necesidad de `.csv`.

## Archivos inspeccionados

- `package.json`
- `prisma/schema.prisma`
- `src/app/(front)/dashboard/certificados/page.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
- `src/components/Dashboard/Certificates/CertificateValidationContent.tsx`
- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/mi-perfil/page.tsx`
- `src/app/api/auth/register/route.ts`
- `src/libs/authOptions.ts`
- `src/libs/db.ts`
- `src/libs/certificates/validateCertificatePayload.ts`
- `src/libs/certificates/normalizeCertificateEmail.ts`
- `src/libs/certificates/linkCertificatesToUserByEmail.ts`
- `src/libs/certificates/generateCertificatePublicId.ts`
- `src/libs/certificates/exportCertificatePreviewToPng.ts`
- `src/libs/certificates/certificateLayout.ts`
- `doc/certificates/plan/README.md`
- `doc/certificates/plan/firmas-dinamicas-certificado.md`

## Decisiones a confirmar antes de implementar

- Si el DNI ausente se guarda como `""` o se migra a `String?`.
- Si inicialmente se soporta solo `.xlsx` o tambien `.csv`.
- Si ante emails duplicados dentro del mismo Excel se permite crear mas de un certificado o se informa como advertencia/error.
- Si despues del lote alcanza con refrescar el listado o se necesita una vista/resumen persistente del lote.
- Que hacer si ya hay certificados existentes con formato viejo con anio, porque el nuevo maximo global debe calcularse sobre seriales `AR-0001`, `AR-0002`, etc.
