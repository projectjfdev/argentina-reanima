# Plan: plantillas seleccionables para certificados

## Objetivo

Incorporar la seleccion de una plantilla visual al flujo de certificados de Argentina Reanima, permitiendo que el administrador elija entre:

- `public/certificado-template/certificado-template_1.png`
- `public/certificado-template/certificado-template_2.png`
- `public/certificado-template/certificado-template_3.png`

La plantilla elegida debe usarse de forma consistente en la vista previa administrativa, la creacion individual, la creacion masiva, la persistencia, la validacion publica y la descarga PNG posterior.

Este plan se basa en el estado real inspeccionado del proyecto. No incluye implementacion.

## Estado actual detectado

- El modelo `Certificate` en `prisma/schema.prisma` persiste datos del destinatario, textos, numero de serie, firma dinamica, estado, vinculacion de usuario y timestamps.
- No existe actualmente un campo persistido para plantilla.
- La unica plantilla visual usada hoy esta hardcodeada en `src/components/Dashboard/Certificates/CertificatePreview.tsx`:
  - `src="/certificado-template/certificado-template_1.png"`
- `CertificatePreview` es el punto compartido para:
  - vista previa del dashboard administrativo;
  - pagina publica de validacion;
  - descarga PNG, porque `src/libs/certificates/exportCertificatePreviewToPng.ts` rasteriza el DOM renderizado.
- La creacion individual vive en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx` y envia JSON a:
  - `POST /api/certificates`
  - `PUT /api/certificates/[publicId]`
- La creacion masiva vive en el mismo componente y envia `FormData` a:
  - `POST /api/certificates/bulk`
- La validacion del payload individual esta centralizada en `src/libs/certificates/validateCertificatePayload.ts`.
- La validacion del payload compartido de creacion masiva esta duplicada dentro de `src/app/api/certificates/bulk/route.ts`.
- Las consultas publicas y de perfil usan `select`, por lo que cualquier campo nuevo debe agregarse explicitamente:
  - `src/app/(front)/certificado/validar/[publicId]/page.tsx`
  - `src/app/api/certificates/validate/[publicId]/route.ts`
  - `src/app/api/me/certificates/route.ts`
  - `src/app/(front)/mi-perfil/page.tsx`, si se decide mostrar la plantilla en perfil.
- El listado administrativo de `GET /api/certificates` usa `include` y devuelve el modelo completo junto con `user`, por lo que un campo nuevo del modelo llegaria al dashboard sin `select` adicional en ese endpoint.
- Ya hay tests de dominio para certificados en `src/test/certificates`, especialmente para `validateCertificatePayload`.

## Decision tecnica propuesta

Persistir en cada certificado un identificador estable de plantilla, no una ruta arbitraria recibida del cliente.

Campo sugerido:

```prisma
templateKey String @default("template_1") @db.VarChar(40)
```

Valores permitidos:

- `template_1`
- `template_2`
- `template_3`

Motivos:

- Mantiene compatibilidad con certificados existentes usando `template_1` como valor por defecto.
- Evita que el cliente pueda inyectar rutas de archivos.
- Permite renombrar o reorganizar paths en una constante interna si hiciera falta.
- Evita crear un enum Prisma para un conjunto pequeno que podria requerir mas rigidez de migracion. Un enum tambien es viable, pero un string validado en dominio es suficiente y menos intrusivo para este cambio.

La configuracion de plantillas deberia centralizarse en un helper del dominio de certificados, por ejemplo dentro de `src/libs/certificates`, para que formulario, validaciones y preview usen la misma fuente de verdad.

## Flujo esperado luego del cambio

### Vista previa

1. El formulario administrativo incorpora un selector de plantilla.
2. `react-hook-form` observa el valor elegido junto con el resto del formulario.
3. `previewData` pasa `templateKey` a `CertificatePreview`.
4. `CertificatePreview` resuelve la ruta desde una constante controlada y renderiza la imagen base correspondiente.
5. En modo masivo, la misma plantilla elegida se usa para el ejemplo de preview con la primera fila valida del Excel.

### Creacion individual

1. `CertificatesDashboard` envia `templateKey` en el JSON.
2. `validateCertificatePayload` valida que sea una plantilla permitida.
3. `POST /api/certificates` persiste `templateKey` junto con el resto de `validation.data`.
4. La respuesta serializada incluye `templateKey`, porque viene desde Prisma.

### Edicion individual

1. Al seleccionar un certificado del listado, `handleSelectCertificate` carga `templateKey` en el formulario.
2. El admin puede cambiar la plantilla de un certificado existente.
3. `PUT /api/certificates/[publicId]` valida y persiste el nuevo valor.
4. La pagina publica y la descarga posterior reflejan la plantilla actual del registro.

### Creacion masiva

1. El selector de plantilla permanece disponible en modo Excel.
2. `handleCreateBulkCertificates` agrega `templateKey` al `FormData`.
3. `validateBulkSharedPayload` valida el valor.
4. `createCertificatesFromRows` guarda la misma `templateKey` en todos los certificados del lote.
5. La validacion preliminar del Excel, sin `intent=create`, no necesita plantilla porque solo valida columnas y filas.

### Visualizacion posterior

1. La pagina publica selecciona `templateKey` desde la base.
2. `CertificateValidationContent` pasa el certificado completo a `CertificatePreview`.
3. La descarga PNG usa el DOM de esa misma vista, por lo que no necesita una implementacion propia.
4. `GET /api/certificates/validate/[publicId]` devuelve `templateKey` para consumidores API.

## Fase 1: Modelo, migracion y compatibilidad

### Objetivo

Persistir la plantilla elegida sin romper certificados existentes.

### Analisis de impacto

El campo debe existir en `Certificate` para que la eleccion sobreviva a la creacion, edicion y visualizacion futura. Sin persistencia, todos los certificados historicos seguirian renderizando la plantilla por defecto o dependerian del estado del formulario.

### Archivos o areas involucradas

- `prisma/schema.prisma`
- nueva migracion en `prisma/migrations`
- Prisma Client generado en `src/generated/prisma`, luego de ejecutar `prisma generate`

### Cambios esperados

- Agregar `templateKey String @default("template_1") @db.VarChar(40)` al modelo `Certificate`.
- Crear una migracion que agregue la columna con default `template_1`.
- Mantener los registros existentes compatibles: todos quedan implicitamente en `template_1`, que coincide con el comportamiento actual.

### Riesgos

- Si se agrega una columna `NOT NULL` sin default, la migracion fallaria con certificados existentes.
- Si se usa un default distinto de `template_1`, certificados historicos cambiarian visualmente.

### Criterio de finalizacion

- La migracion agrega el campo sin requerir backfill manual.
- Los certificados previos conservan visualmente `certificado-template_1.png`.
- Prisma Client refleja el nuevo campo.

## Fase 2: Configuracion y validacion de plantillas

### Objetivo

Centralizar las plantillas permitidas y validar entradas de cliente en un unico criterio de dominio.

### Analisis de impacto

Hoy no existe ningun helper de plantillas. Si se hardcodean rutas en formulario, API y preview, el cambio queda duplicado y fragil. Conviene replicar el patron existente de firmas: el cliente envia una key controlada y el sistema resuelve la metadata internamente.

### Archivos o areas involucradas

- `src/libs/certificates`
- `src/libs/certificates/index.ts`
- `src/libs/certificates/validateCertificatePayload.ts`
- `src/app/api/certificates/bulk/route.ts`
- `src/test/certificates/validateCertificatePayload.test.ts`

### Cambios esperados

- Crear una constante compartida con metadata de plantillas:
  - key;
  - nombre visible;
  - ruta publica;
  - descripcion corta opcional para UI.
- Agregar helper de resolucion, por ejemplo:
  - `getCertificateTemplateByKey(key)`
  - `DEFAULT_CERTIFICATE_TEMPLATE_KEY`
- Extender `CertificatePayloadInput` y `ValidCertificatePayload` con `templateKey`.
- Validar en `validateCertificatePayload` que el valor recibido exista.
- En caso de valor ausente, usar `template_1` para compatibilidad del payload y para no romper llamados actuales.
- Extender `validateBulkSharedPayload` con la misma regla. Idealmente reutilizar un helper comun para no duplicar la validacion.

### Riesgos

- Duplicar validacion entre individual y masivo puede generar diferencias de comportamiento.
- Aceptar rutas del cliente abriria un vector de renderizado no deseado.
- Si el formulario envia `undefined` en edicion de registros viejos, debe caer a `template_1`.

### Criterio de finalizacion

- Solo se aceptan `template_1`, `template_2` y `template_3`.
- Payloads antiguos sin `templateKey` siguen siendo validos y guardan `template_1`.
- Tests de validacion cubren plantilla valida, ausente e invalida.

## Fase 3: Propagacion en APIs y consultas

### Objetivo

Hacer que el campo persistido viaje por todos los endpoints y consultas que alimentan vistas o integraciones.

### Analisis de impacto

El CRUD administrativo que usa `create`/`update` recibira el campo desde `validation.data`. Las consultas con `select` requieren cambios explicitos para que `CertificatePreview` reciba la plantilla correcta fuera del dashboard.

### Archivos o areas involucradas

- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`
- `src/app/api/certificates/bulk/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/mi-perfil/page.tsx`, solo si el perfil necesita exponer o usar la plantilla

### Cambios esperados

- `POST /api/certificates`: persistir `templateKey` desde `validation.data`.
- `PUT /api/certificates/[publicId]`: actualizar `templateKey` junto con los datos editables.
- `POST /api/certificates/bulk`: persistir `templateKey` dentro de cada `tx.certificate.create`.
- `GET /api/certificates/validate/[publicId]`: agregar `templateKey: true` al `select`.
- Pagina publica `/certificado/validar/[publicId]`: agregar `templateKey: true` al `select`.
- `GET /api/me/certificates`: agregar `templateKey: true` si ese endpoint se usa para render o futuras vistas cliente.
- Perfil server-side: no es obligatorio para la lista actual, porque solo muestra texto y link, pero incluirlo mantiene el contrato preparado si se agrega miniatura o modal.

### Riesgos

- Olvidar la pagina publica haria que certificados creados con plantilla 2 o 3 sigan mostrandose con la 1 al validar.
- Olvidar bulk crearia lotes completos con default aunque el admin haya elegido otra plantilla.
- Olvidar `PUT` impediria corregir la plantilla despues de crear.

### Criterio de finalizacion

- Un certificado creado o editado mantiene `templateKey` en DB.
- Las respuestas publicas y administrativas incluyen la plantilla cuando alimentan preview o descarga.
- El flujo masivo guarda el mismo `templateKey` para todas las filas del lote.

## Fase 4: Formulario administrativo y experiencia de seleccion

### Objetivo

Agregar seleccion de plantilla en el dashboard sin alterar el flujo actual de creacion individual y masiva.

### Analisis de impacto

`CertificatesDashboard.tsx` concentra formulario, modo individual/Excel, listado, edicion y preview. El cambio debe entrar como un campo mas de `CertificateFormValues`, con default `template_1`, y alimentar tanto el submit JSON como el `FormData` masivo.

### Archivos o areas involucradas

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- componentes UI existentes:
  - `src/components/ui/select.tsx`
  - `src/components/ui/badge.tsx`, si se quiere mostrar la plantilla en listado

### Cambios esperados

- Agregar `templateKey` a:
  - `CertificateFormValues`
  - `EMPTY_FORM_VALUES`
  - `CertificateListItem`
  - `previewData`
  - `handleSelectCertificate`
  - `handleResetForm`
- Incorporar un selector de plantilla usando el componente `Select` existente.
- Enviar `templateKey` en:
  - `JSON.stringify(values)` para individual/edicion.
  - `formData.append("templateKey", values.templateKey)` para bulk.
- Opcionalmente mostrar una etiqueta en el listado administrativo para identificar la plantilla usada.
- Mantener el selector disponible en modo Excel, porque la plantilla es un dato compartido del lote.

### Riesgos

- Si el selector queda dentro de un bloque que se desmonta por `shouldUnregister: true`, podria perderse al cambiar entre modo individual y Excel.
- Si `handleSelectCertificate` no carga el valor persistido, editar un certificado podria sobreescribir su plantilla con `template_1`.
- Si el selector usa rutas como value en vez de keys, se acopla la UI al asset path.

### Criterio de finalizacion

- La vista previa cambia en tiempo real al seleccionar otra plantilla.
- Cambiar entre modo individual y Excel conserva una plantilla valida.
- Editar un certificado muestra la plantilla persistida.
- Crear lote envia la plantilla elegida.

## Fase 5: Preview, pagina publica y descarga PNG

### Objetivo

Hacer que `CertificatePreview` renderice la imagen base segun `templateKey` y que todos los consumidores hereden ese comportamiento.

### Analisis de impacto

Este es el punto de mayor reutilizacion. Como la descarga PNG usa `exportCertificatePreviewToPng` sobre el DOM y `inlineImages`, no deberia necesitar cambios funcionales si la imagen de plantilla queda como un `img` normal dentro de `CertificatePreview`.

### Archivos o areas involucradas

- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
- `src/components/Dashboard/Certificates/CertificateValidationContent.tsx`
- `src/libs/certificates/exportCertificatePreviewToPng.ts`, solo para verificacion

### Cambios esperados

- Agregar `templateKey?: string | null` a `CertificatePreviewData`.
- Resolver la plantilla con el helper compartido, usando `template_1` como fallback.
- Reemplazar el `src` hardcodeado por la ruta resuelta.
- Ajustar `alt` para reflejar que es la plantilla seleccionada, sin depender de texto visible extra.
- Verificar visualmente que las tres plantillas tienen el mismo ratio esperado por `CERTIFICATE_CANVAS`.

### Riesgos

- Si alguna plantilla nueva no respeta el mismo tamano o zonas libres, los textos, firmas, QR o serie podrian quedar mal alineados.
- Si una imagen falla al cargar, la descarga PNG tambien fallara o saldra incompleta.
- Si las plantillas tienen contenido de fondo distinto en areas donde hoy se renderizan textos, puede requerirse layout por plantilla. No conviene introducirlo de entrada salvo que la inspeccion visual lo confirme.

### Criterio de finalizacion

- `CertificatePreview` no contiene paths hardcodeados a una unica plantilla.
- Dashboard, pagina publica y PNG usan la misma plantilla persistida.
- La exportacion PNG sigue inlineando correctamente la imagen base.

## Fase 6: Tests y verificacion

### Objetivo

Cubrir la validacion de dominio y verificar manualmente los flujos que dependen de renderizado.

### Analisis de impacto

El proyecto ya tiene Vitest configurado y tests de certificados. El render visual y la descarga PNG no tienen tests automatizados actuales, por lo que la verificacion manual sigue siendo necesaria.

### Archivos o areas involucradas

- `src/test/certificates/validateCertificatePayload.test.ts`
- posibles tests nuevos para helper de plantillas
- `npm run test:run`
- `npm run build`

### Cambios esperados

- Agregar tests para:
  - plantilla ausente usa default compatible;
  - plantilla valida se acepta;
  - plantilla invalida se rechaza;
  - si se extrae helper comun, validar sus fallbacks.
- Ejecutar tests existentes de certificados.
- Ejecutar build final.
- Verificar manualmente:
  - creacion individual con cada plantilla;
  - edicion cambiando plantilla;
  - creacion masiva con plantilla 2 o 3;
  - pagina publica posterior;
  - descarga PNG desde pagina publica.

### Riesgos

- Los tests de dominio no garantizan alineacion visual.
- Si la migracion requiere base de datos local disponible, `npm run build` puede pasar aunque falte aplicar migracion en entorno real.

### Criterio de finalizacion

- Tests de certificados pasan.
- `npm run build` pasa.
- Checklist manual completado para los tres templates.

## Edge cases y border cases

- Certificados existentes sin `templateKey`: deben renderizar `template_1`.
- Payload individual antiguo sin `templateKey`: debe seguir creando certificados con `template_1`.
- Payload con `templateKey` vacio, `null` o desconocido: debe caer a default solo si el campo esta ausente por compatibilidad; si llega un string invalido desde UI/API, conviene devolver error de validacion.
- Edicion de certificado historico: al abrirlo debe mostrar `template_1`, no un selector vacio.
- Modo Excel sin archivo: el selector no debe interferir con el error actual de archivo obligatorio.
- Validacion preliminar de Excel: no debe exigir plantilla, porque no crea certificados.
- Creacion masiva con Excel valido y plantilla invalida: debe fallar antes de crear cualquier registro.
- Certificado eliminado: si se consulta publicamente, el estado desactivado no necesita renderizar preview ni descargar PNG, por lo que la plantilla no cambia ese flujo.
- Firma de instructor y firma presidencial: deben mantenerse como capas dinamicas sobre cualquier plantilla.
- QR y numero de serie: deben conservar posiciones actuales mientras las tres plantillas mantengan el mismo diseno base.
- Cache de navegador: si se reemplazan imagenes con el mismo nombre en el futuro, el navegador podria cachear assets; no afecta la seleccion actual, pero es relevante para QA.

## Restricciones tecnicas

- Las tres plantillas deben ser assets publicos servidos desde `/certificado-template/...`.
- No se debe aceptar una ruta libre desde el cliente.
- La descarga PNG depende del DOM y de que las imagenes sean accesibles desde el navegador.
- El layout actual usa porcentajes sobre `CERTIFICATE_CANVAS` y asume el mismo aspect ratio para todas las plantillas.
- No hay generador backend de imagen final; la "generacion" actual es la rasterizacion cliente de `CertificatePreview`.
- Las consultas con `select` no reciben campos nuevos automaticamente.

## Riesgos de regresion

- Sobreescribir plantillas existentes en edicion por no cargar `templateKey` en el form.
- Crear lotes con plantilla incorrecta por olvidar agregar `templateKey` al `FormData`.
- Inconsistencia entre preview administrativa y pagina publica por no propagar el campo en los `select`.
- Ruptura de compatibilidad si la columna nueva no tiene default.
- Duplicacion de listas de plantillas con keys distintas entre UI y servidor.
- Desalineacion visual si las plantillas 2 y 3 no son compatibles con el layout actual.

## Oportunidades de reutilizacion

- Seguir el patron existente de firmas dinamicas:
  - key persistida;
  - metadata centralizada;
  - resolucion interna de imagen y nombre.
- Reutilizar `CertificatePreview` como unico render visual para preview, validacion publica y PNG.
- Extraer validacion de `templateKey` a un helper compartido para individual y bulk.
- Mantener `exportCertificatePreviewToPng` sin cambios funcionales, ya que ya inlinea todas las imagenes del DOM.

## Orden recomendado

1. Agregar campo persistido con default compatible.
2. Crear configuracion/validacion compartida de plantillas.
3. Propagar `templateKey` por APIs, bulk y consultas publicas.
4. Agregar selector al dashboard y conectarlo al preview/submits.
5. Parametrizar `CertificatePreview`.
6. Agregar tests de dominio y verificar manualmente los flujos visuales.

## Fuera de alcance

- Crear ABM de plantillas.
- Permitir subir plantillas nuevas desde el dashboard.
- Cambiar posiciones de textos por plantilla, salvo que QA visual demuestre que es imprescindible.
- Cambiar el mecanismo de descarga PNG.
- Introducir generacion backend de certificados.
- Modificar reglas de firmas, QR, seriales, vinculacion de usuarios o soft delete.
