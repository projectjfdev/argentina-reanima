# Bug: `instructorKey` invalido al activar firma de instructor

## 1. Descripcion clara del bug

En el dashboard administrativo de certificados, al activar la opcion **Agregar firma de instructor** y guardar sin interactuar manualmente con el selector de instructores, la API puede rechazar la creacion o edicion con:

```json
{
  "message": "Datos de certificado invalidos",
  "errors": {
    "instructorKey": "El instructor seleccionado no es valido"
  },
  "success": false
}
```

El problema observado no parece estar en la lista de instructores ni en la validacion del backend en si. La causa raiz esta confirmada por reproduccion manual: hay una desincronizacion del estado de React Hook Form. El `Select` muestra visualmente un valor derivado por fallback, pero `instructorKey` no queda materializado como valor real del formulario hasta que el usuario dispara `onValueChange`.

## 2. Pasos para reproducirlo

### Reproduccion inicial

1. Entrar al dashboard de certificados.
2. Crear un certificado individual nuevo o editar uno existente sin firma de instructor.
3. Completar los campos obligatorios.
4. Activar el checkbox **Agregar firma de instructor**.
5. No seleccionar manualmente ningun instructor.
6. Observar que el selector parece mostrar el primer instructor.
7. Observar que la firma no aparece en la vista previa.
8. Guardar.

### Segunda reproduccion manual en desarrollo

1. Abrir el formulario de creacion individual de certificados.
2. Completar nombre, email, texto principal y texto inferior.
3. Activar el checkbox **Agregar firma de instructor**.
4. No interactuar con el selector de instructor.
5. Observar que el selector muestra visualmente **Emir**, el primer instructor de la lista.
6. Observar que la firma de Emir no aparece en la vista previa.
7. Presionar **Crear certificado**.
8. Confirmar que la API responde `POST /api/certificates 400` con el mensaje `Datos de certificado invalidos`.

Resultado esperado de la reproduccion: el payload puede salir con `instructorSignatureEnabled: true` pero sin un `instructorKey` real, y el backend responde con error de validacion.

La segunda reproduccion confirma con alto nivel de certeza que el valor visible del `Select` y el valor real de `watchedValues.instructorKey` no estan sincronizados. El bug desaparece temporalmente cuando se selecciona manualmente otro instructor y luego se vuelve a seleccionar Emir, porque esa interaccion ejecuta `onValueChange` y materializa `instructorKey` en React Hook Form.

## 3. Comportamiento actual

El formulario define valores por defecto con `instructorSignatureEnabled: false` e `instructorKey: CERTIFICATE_INSTRUCTORS[0].key` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:110`.

Sin embargo, el `Select` de instructor no esta registrado con `register`; solo actualiza React Hook Form cuando se ejecuta `onValueChange` y llama a `setValue("instructorKey", ...)` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:703`.

El valor visual del select se calcula como:

```ts
const selectedInstructorKey =
  watchedValues.instructorKey ?? CERTIFICATE_INSTRUCTORS[0].key;
```

Esto esta en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:162`. Ese fallback puede hacer que el select se vea como si tuviera el primer instructor, aunque `watchedValues` o los valores enviados por `handleSubmit` no contengan efectivamente `instructorKey`.

El envio individual serializa directamente `values` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:410`. Si `handleSubmit` no incluye `instructorKey`, el backend recibe `undefined`/ausente.

El error aparece durante `onSubmit`, pero `onSubmit` no es el origen del bug. Esa funcion solo propaga el error 400 devuelto por la API cuando el backend valida un payload con `instructorSignatureEnabled: true` e `instructorKey` ausente, vacio o `undefined`.

## 4. Comportamiento esperado

Al activar **Agregar firma de instructor**, si no hay instructor seleccionado en el estado real del formulario, deberia persistirse explicitamente el primer instructor disponible como `instructorKey`.

El valor visual del select, la firma renderizada en la vista previa, el payload enviado y la validacion del backend deberian referirse al mismo `instructorKey`.

## 5. Archivos y componentes involucrados

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`: estado del formulario, checkbox, selector, preview y construccion del payload.
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`: render de firma segun `instructorSignatureEnabled` e `instructorKey`.
- `src/libs/certificates/certificateSignatures.ts`: listado permitido de instructores y busqueda por key.
- `src/libs/certificates/validateCertificatePayload.ts`: validacion para creacion y edicion individual.
- `src/app/api/certificates/route.ts`: POST de creacion individual.
- `src/app/api/certificates/[publicId]/route.ts`: PUT de edicion individual.
- `src/app/api/certificates/bulk/route.ts`: validacion y creacion masiva.
- `prisma/schema.prisma`: campos persistidos `instructorSignatureEnabled` e `instructorKey`.
- `src/test/certificates/validateCertificatePayload.test.ts`: tests actuales de payload, sin cobertura especifica del caso con firma habilitada.

## 6. Flujo de datos desde el formulario hasta el backend

1. `useForm` inicializa el formulario con `defaultValues: EMPTY_FORM_VALUES` y `shouldUnregister: true` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:154`.
2. El checkbox se registra con `{...register("instructorSignatureEnabled")}` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:684`.
3. El `Select` de instructor recibe `value={selectedInstructorKey}` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:703`.
4. `selectedInstructorKey` usa fallback al primer instructor si `watchedValues.instructorKey` es `null` o `undefined` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:162`.
5. El `Select` solo escribe en el form al cambiar manualmente, mediante `setValue("instructorKey", value, ...)` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:704`.
6. La vista previa se arma con `...watchedValues` en `previewData` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:166`, no con `selectedInstructorKey`.
7. `CertificatePreview` intenta resolver la firma con `getCertificateInstructorByKey(data.instructorKey)` solo si `data.instructorSignatureEnabled` es truthy en `src/components/Dashboard/Certificates/CertificatePreview.tsx:60`.
8. En modo individual, `onSubmit` envia `JSON.stringify(values)` al POST o PUT en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:410`.
9. POST `/api/certificates` valida `await request.json()` con `validateCertificatePayload` en `src/app/api/certificates/route.ts:158`.
10. PUT `/api/certificates/[publicId]` usa la misma validacion en `src/app/api/certificates/[publicId]/route.ts:86`.
11. `validateCertificatePayload` convierte `input.instructorKey` a string trimmeado; si viene ausente queda `""` en `src/libs/certificates/validateCertificatePayload.ts:63`.
12. Si la firma esta habilitada y `getCertificateInstructorByKey(instructorKey)` no encuentra coincidencia, devuelve error en `src/libs/certificates/validateCertificatePayload.ts:83`.
13. Si valida, guarda `instructorKey` solo cuando `instructorSignatureEnabled` es true; si no, guarda `null` en `src/libs/certificates/validateCertificatePayload.ts:104`.

## 7. Causa raiz confirmada por reproduccion manual

La causa raiz confirmada es que el `Select` de instructor es un componente controlado visualmente por un fallback, pero no esta sincronizado con el estado real de React Hook Form al habilitar la firma.

Evidencia:

- `EMPTY_FORM_VALUES` declara `instructorKey: CERTIFICATE_INSTRUCTORS[0].key`, pero el formulario usa `shouldUnregister: true` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:154`.
- El campo `instructorKey` no usa `register`; solo se escribe mediante `setValue` cuando el usuario cambia el selector en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:704`.
- El valor mostrado por el select puede ser `CERTIFICATE_INSTRUCTORS[0].key` por fallback aunque `watchedValues.instructorKey` no exista realmente en el submission en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:162`.
- La previsualizacion no usa `selectedInstructorKey`; usa `previewData` armado desde `watchedValues` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:166`. Por eso la firma no aparece aunque el selector parezca mostrar el primer instructor.
- El payload de ejemplo tampoco incluye `templateKey`, otro campo manejado por `Select` y `setValue` sin `register`. Esto refuerza que el problema no es exclusivo de instructores, sino de campos de select no materializados en `handleSubmit` hasta que el usuario interactua. `templateKey` no falla porque el backend lo normaliza a la plantilla default.
- La segunda reproduccion manual mostro exactamente esa divergencia: el select mostro **Emir**, la firma de Emir no aparecio en la vista previa, el guardado fallo con `POST /api/certificates 400`, y el flujo paso a funcionar al seleccionar manualmente otro instructor y volver a Emir.
- Backend normaliza `instructorKey` ausente a string vacio mediante `getTrimmedString(input.instructorKey)` y luego rechaza porque `getCertificateInstructorByKey("")` no encuentra instructor valido en `src/libs/certificates/validateCertificatePayload.ts:63` y `src/libs/certificates/validateCertificatePayload.ts:83`.

## 8. Otras causas posibles encontradas

- **Clave obsoleta en certificados antiguos:** si un certificado existente tiene `instructorSignatureEnabled: true` y un `instructorKey` que ya no existe en `CERTIFICATE_INSTRUCTORS`, la vista previa no renderizara firma y una edicion posterior fallara validacion. La busqueda permitida esta en `src/libs/certificates/certificateSignatures.ts:33`.
- **Edicion de certificados con `instructorKey: null`:** `handleSelectCertificate` rellena `certificate.instructorKey ?? CERTIFICATE_INSTRUCTORS[0].key` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:270`, pero si ese valor no queda registrado para submit, la edicion puede reproducir el mismo error al activar firma.
- **Modo masivo:** el flujo masivo usa `FormData` y hace `formData.append("instructorKey", values.instructorKey)` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:357`. Si `values.instructorKey` no esta materializado, puede enviarse como string `"undefined"` o fallar por valor invalido. La validacion masiva replica la misma regla en `src/app/api/certificates/bulk/route.ts:128`.
- **Falta de validacion frontend especifica:** el formulario no declara una regla de frontend que exija `instructorKey` cuando `instructorSignatureEnabled` es true. El error aparece recien desde backend.

No se encontro evidencia de una carga asincronica de instructores: `CERTIFICATE_INSTRUCTORS` es una constante local en `src/libs/certificates/certificateSignatures.ts:7`.

## 9. Diferencias detectadas entre creacion y edicion

- **Creacion individual:** parte de `EMPTY_FORM_VALUES`; el usuario puede activar la firma sin disparar `onValueChange` del select. El POST envia directamente `values`.
- **Edicion individual:** `handleSelectCertificate` resetea el form con datos del certificado. Si el certificado no tiene `instructorKey`, usa fallback al primer instructor. Si el certificado tiene una clave obsoleta, el formulario puede mantener una clave no valida hasta guardar.
- **Validacion backend:** creacion y edicion individual comparten `validateCertificatePayload`, por lo que el error de `instructorKey` es equivalente en POST y PUT.
- **Masivo:** no usa `validateCertificatePayload`; tiene `validateBulkSharedPayload`, pero replica la misma condicion de error cuando la firma esta habilitada y la clave no pertenece al listado.

## 10. Casos borde

- Activar firma, guardar sin tocar el select.
- Activar firma, desactivar firma y guardar: backend deberia persistir `instructorKey: null`.
- Activar firma, seleccionar segundo instructor, volver al primero y guardar: funciona porque `onValueChange` materializa `instructorKey`.
- Editar certificado sin firma, activar firma y guardar sin tocar select.
- Editar certificado con `instructorKey` antiguo que ya no existe en `CERTIFICATE_INSTRUCTORS`.
- Cambiar entre modo individual y Excel, ya que el cambio a Excel hace `reset({ ...watchedValues, recipientName: "", ... })` en `src/components/Dashboard/Certificates/CertificatesDashboard.tsx:548`, preservando lo que exista en `watchedValues`.
- Envio masivo con firma habilitada y selector no tocado.

## 11. Riesgos de la correccion

- Setear automaticamente el primer instructor al activar el checkbox puede cambiar datos guardados si el usuario solo queria previsualizar y luego guardar con firma habilitada por accidente.
- Si se corrige registrando los selects, hay que verificar tambien `templateKey`; el payload de ejemplo sugiere que actualmente tampoco se envia hasta que el usuario cambia la plantilla.
- Conservar `instructorKey` al desactivar la firma puede ser util para no perder seleccion visual, pero el backend hoy persiste `null` cuando `instructorSignatureEnabled` es false.
- Si se agrega validacion frontend, debe estar alineada con backend para no aceptar claves obsoletas ni bloquear valores validos.
- En modo masivo, `FormData.append` con valores ausentes puede introducir strings no deseados como `"undefined"` si no se normaliza antes.

## 12. Plan de solucion paso a paso

1. Definir un helper local o constante `DEFAULT_CERTIFICATE_INSTRUCTOR_KEY = CERTIFICATE_INSTRUCTORS[0]?.key`.
2. Registrar/materializar `templateKey` e `instructorKey` en React Hook Form de forma consistente, idealmente usando `Controller` para los componentes `Select` o llamando a `register`/`setValue` de manera explicita durante la inicializacion.
3. Al activar `instructorSignatureEnabled`, si el valor real de `instructorKey` esta vacio, ausente u obsoleto, hacer `setValue("instructorKey", DEFAULT_CERTIFICATE_INSTRUCTOR_KEY, { shouldDirty: true, shouldValidate: true })`.
4. Evitar que `selectedInstructorKey` o `previewData` usen fallbacks divergentes: el valor mostrado, el preview y el submit deben leer la misma fuente.
5. Agregar validacion frontend condicional: si la firma esta habilitada, `instructorKey` debe existir y pertenecer a `CERTIFICATE_INSTRUCTORS`.
6. En `onSubmit`, normalizar explicitamente el payload individual antes de `JSON.stringify`, para que el backend reciba `instructorKey: null` cuando no hay firma y una key valida cuando si la hay.
7. En modo masivo, normalizar `values.instructorKey` antes de `FormData.append`.
8. Considerar una estrategia para certificados antiguos con claves obsoletas: mostrar error visible, forzar reseleccion o hacer fallback solo si no hay clave.

## 13. Plan de pruebas manuales

1. Crear certificado individual con firma desactivada.
2. Crear certificado individual activando firma y sin tocar el select: debe mostrar firma del primer instructor, enviar `instructorKey` valido y guardar.
3. Crear certificado individual activando firma, elegir segundo instructor, volver al primero y guardar.
4. Editar certificado sin firma, activar firma y guardar sin tocar el select.
5. Editar certificado con firma existente y cambiar instructor.
6. Desactivar firma en un certificado que la tenia y guardar; verificar que la validacion no exija `instructorKey` y que la preview oculte la firma.
7. Crear lote Excel con firma desactivada.
8. Crear lote Excel con firma activada y selector no tocado.
9. Simular o cargar un certificado con `instructorKey` obsoleto y verificar que el formulario no de una falsa apariencia de seleccion valida.

## 14. Tests automatizados que deberian agregarse o modificarse

- Agregar tests a `validateCertificatePayload.test.ts` para:
  - aceptar firma habilitada con `instructorKey: "emir"`;
  - rechazar firma habilitada con `instructorKey` ausente;
  - rechazar firma habilitada con clave obsoleta;
  - persistir `instructorKey: null` cuando firma esta deshabilitada aunque venga una key.
- Agregar tests unitarios para `validateBulkSharedPayload` si se extrae desde `src/app/api/certificates/bulk/route.ts` a un helper testeable.
- Agregar test de componente para `CertificatesDashboard`:
  - activar checkbox sin tocar select y verificar que la preview renderiza la firma;
  - enviar el formulario y verificar que `fetch` recibe `instructorKey` valido;
  - verificar que `templateKey` tambien viaja en el payload sin tocar el selector.
- Agregar test de edicion:
  - certificado sin `instructorKey`, activar firma y guardar;
  - certificado con `instructorKey` obsoleto, mostrar estado invalido o requerir seleccion.

## 15. Criterios de aceptacion

- Al activar **Agregar firma de instructor**, el primer instructor disponible queda seleccionado en el estado real del formulario si no habia uno valido.
- La firma del instructor aparece inmediatamente en la vista previa despues de activar el checkbox.
- El payload de creacion individual incluye `instructorSignatureEnabled: true` e `instructorKey` valido.
- El payload de edicion individual incluye `instructorSignatureEnabled: true` e `instructorKey` valido cuando corresponde.
- El flujo masivo no envia `instructorKey` ausente, `"undefined"` ni una clave invalida cuando la firma esta habilitada.
- Si la firma esta deshabilitada, el backend guarda `instructorKey: null` y no falla por instructor.
- Una clave antigua u obsoleta no se muestra como seleccion valida silenciosamente.
- Los tests cubren el caso que reproducia el bug sin depender de seleccionar manualmente otro instructor primero.
