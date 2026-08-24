# Bug: edicion de noticia devuelve "ID invalido"

## Descripcion del bug

Desde `/dashboard/noticias`, al editar una noticia existente y finalizar el guardado, la API responde:

```json
{
  "error": "ID invalido",
  "success": false
}
```

El caso reportado ocurre al reemplazar la imagen de portada de la noticia "Reportaje al presidente de Argentina Reanima". El payload de datos llega con los campos esperados, incluyendo `imageBase64`, pero la actualizacion falla antes de procesar esos datos.

## Flujo analizado

### Frontend

La pagina del dashboard esta en `src/app/(front)/dashboard/noticias/page.tsx`.

- Lineas 13-20: la pagina obtiene `news`, `loadAdminNews` y `total` desde `useNews()`, y carga las noticias administrativas con `loadAdminNews(currentPage)`.
- Lineas 24-35: renderiza `FormCreateNews` y una lista de `NewsCard`.

La seleccion de la noticia a editar ocurre en `src/components/Dashboard/News/NewsCard.tsx`.

- Linea 19: cada card recibe una noticia `n: News`.
- Linea 20: obtiene `setSelectedNews` desde el contexto.
- Linea 95: el boton de editar ejecuta `setSelectedNews(n)`.

El estado de la noticia seleccionada vive en `src/context/NewsContext.tsx`.

- Linea 45: `const [selectedNews, setSelectedNews] = useState<News | null>(null)`.
- Lineas 19-22 y 137-140: `selectedNews`, `setSelectedNews` y `updateNews` se exponen por contexto.

El formulario de creacion/edicion esta en `src/components/Dashboard/News/FormCreateNews.tsx`.

- Linea 24: consume `createNews`, `selectedNews`, `setSelectedNews` y `updateNews`.
- Lineas 140-150: cuando existe `selectedNews`, carga sus datos en el formulario con `reset(...)` y setea `picture` con `selectedNews.imageUrl`.
- Lineas 59-74: avanzar y volver entre pasos solo modifica `step` e `isExpanded`; no toca `selectedNews` ni el ID.
- Lineas 30-49: reemplazar imagen lee el archivo con `FileReader` y guarda el resultado base64 en `picture`; no toca `selectedNews` ni el ID.
- Lineas 90-101: al presionar `Finalizar`, si `selectedNews` existe, llama a `updateNews(selectedNews.id, {...})`.

La request se construye en `src/context/NewsContext.tsx`.

- Lineas 109-116: `updateNews(id, singleNews)` hace `fetch(`/api/news/${id}`, { method: "PUT", body: JSON.stringify(singleNews), headers: { "Content-Type": "application/json" } })`.

Conclusion del frontend: el ID no viaja en el body. Viaja como segmento dinamico de URL. El cambio de imagen no sobrescribe ni transforma `selectedNews.id`.

### Request

Endpoint utilizado:

```text
PUT /api/news/{id}
```

Metodo HTTP:

```text
PUT
```

Formato del body:

```json
{
  "title": "...",
  "description": "...",
  "redirect": "...",
  "category": "...",
  "dateNew": "...",
  "imageBase64": "data:image/jpeg;base64,..."
}
```

El ID esperado no va en `body`, `query` ni `params` de query string. Va en la URL, construido por `src/context/NewsContext.tsx` linea 110.

Valor real que recibe el endpoint para validar: por el bug del route handler, la expresion usada por el backend es `context.params.id`, que en Next 16 resulta `undefined` porque `context.params` es una promesa y no fue esperada con `await`.

### Backend

El endpoint esta en `src/app/api/news/[id]/route.ts`.

La actualizacion se procesa en `PUT`.

- Lineas 107-109: valida sesion admin.
- Linea 111: calcula `const id = Number(context.params.id)`.
- Lineas 113-118: si `isNaN(id)`, responde `{ error: "ID invalido", success: false }` con status 400.
- Lineas 121-122: recien despues lee el JSON del request.
- Linea 124: busca la noticia con `prisma.news.findUnique({ where: { id } })`.
- Lineas 139-167: si existe `imageBase64`, elimina la imagen anterior de Cloudinary y sube la nueva.
- Lineas 169-180: actualiza la noticia.

El mensaje `"ID invalido"` se origina exactamente en `src/app/api/news/[id]/route.ts`, lineas 113-118. La condicion que lo dispara es:

```ts
const id = Number(context.params.id);

if (isNaN(id)) {
  return NextResponse.json(
    { error: "ID invalido", success: false },
    { status: 400 }
  );
}
```

En Next 16, segun la documentacion oficial de Next.js para route handlers, `context.params` es una promesa y debe resolverse con `await`. El proyecto usa `next: ^16.2.10` en `package.json`, linea 37.

El mismo proyecto ya tiene handlers dinamicos que siguen ese patron:

- `src/app/api/certificates/[publicId]/route.ts`, lineas 10-16: define `params: Promise<{ publicId: string }> | { publicId: string }` y hace `const params = await context.params`.
- `src/libs/donations/adminApi.ts`, lineas 10-16: `getRouteId(context)` hace `const params = await context.params; return Number(params.id);`.
- `src/app/api/courses/[id]/route.ts`, lineas 8-10: el `GET` de cursos usa `const { id } = await context.params`.

En cambio, noticias usa acceso sincronico en `GET`, `DELETE` y `PUT`:

- `src/app/api/news/[id]/route.ts` linea 13.
- `src/app/api/news/[id]/route.ts` linea 57.
- `src/app/api/news/[id]/route.ts` linea 111.

## Modelo de datos

El modelo Prisma de noticias esta en `prisma/schema.prisma`.

```prisma
model News {
  id            Int       @id @default(autoincrement())
  title         String
  imageUrl      String?
  imagePublicId String?
  description   String
  redirect      String
  category      String
  dateNew       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

El identificador real es `Int @id @default(autoincrement())`. Conceptualmente, convertir el segmento de URL a numero es correcto. El problema no es que el modelo use UUID, CUID o `String`; el problema es que el backend esta leyendo mal el parametro dinamico.

## Causa raiz

La causa raiz es una incompatibilidad entre el endpoint dinamico de noticias y la API actual de route handlers de Next.js.

`src/app/api/news/[id]/route.ts` accede a `context.params.id` de forma sincronica. En Next 16, `context.params` debe esperarse:

```ts
const params = await context.params;
const id = Number(params.id);
```

Como no se espera, `context.params.id` evalua como `undefined`; luego `Number(undefined)` produce `NaN`, y la validacion `isNaN(id)` devuelve `true`.

Por eso el endpoint responde `"ID invalido"` antes de leer o validar el payload y antes de ejecutar cualquier logica de imagen, Cloudinary o Prisma.

## Por que devuelve "ID invalido"

La respuesta se genera porque:

1. Frontend llama a `PUT /api/news/${selectedNews.id}`.
2. El handler dinamico recibe el parametro en `context.params`, pero en Next 16 ese valor es una promesa.
3. El codigo intenta leer `context.params.id` sin `await`.
4. El valor efectivo usado para la conversion es `undefined`.
5. `Number(undefined)` da `NaN`.
6. `isNaN(id)` dispara el 400 con `{ error: "ID invalido", success: false }`.

## Relacion con el cambio de imagen

El cambio de imagen no parece ser la causa raiz.

En frontend, reemplazar la imagen solo modifica el estado local `picture` en `FormCreateNews.tsx`, lineas 30-49. No modifica `selectedNews`, no reinicia el formulario, no cambia `selectedNews.id` y no altera la URL.

En backend, la validacion del ID ocurre en `src/app/api/news/[id]/route.ts`, lineas 111-118, antes de:

- leer el body del request;
- buscar la noticia;
- comprobar `imageBase64`;
- eliminar la imagen anterior;
- subir la nueva imagen a Cloudinary;
- actualizar Prisma.

Por lo tanto, reemplazar la imagen simplemente hace visible un bug existente del flujo de actualizacion. Estaticamente, el mismo `PUT /api/news/[id]` deberia fallar tambien al editar solo texto, porque el error ocurre antes de cualquier bifurcacion por imagen.

Tambien hay riesgo de que `GET /api/news/[id]` y `DELETE /api/news/[id]` fallen por la misma razon, ya que usan el mismo patron de acceso sincronico a `context.params.id`.

## Diferencia entre creacion y edicion

Creacion:

- `src/components/Dashboard/News/FormCreateNews.tsx`, lineas 104-108, llama a `createNews(...)`.
- `src/context/NewsContext.tsx`, lineas 80-87, hace `POST /api/news`.
- `src/app/api/news/route.ts`, lineas 34-90, crea la noticia y no depende de un segmento dinamico `[id]`.

Edicion:

- `src/components/Dashboard/News/FormCreateNews.tsx`, lineas 95-101, llama a `updateNews(selectedNews.id, ...)`.
- `src/context/NewsContext.tsx`, lineas 109-116, hace `PUT /api/news/${id}`.
- `src/app/api/news/[id]/route.ts`, lineas 111-118, intenta extraer el ID desde `context.params.id` y falla.

La creacion y la edicion comparten parte del payload y del manejo de imagen, pero no comparten endpoint. La creacion no usa `[id]`, por eso no queda afectada por esta causa raiz.

## Regresiones o inconsistencias encontradas

- `package.json` usa Next `^16.2.10`, donde `context.params` debe resolverse con `await`.
- `src/app/api/news/[id]/route.ts` mantiene un patron heredado/sincronico para `context.params.id`.
- Otros endpoints del proyecto ya usan un patron compatible con Next moderno (`await context.params`), por ejemplo certificados y donaciones.
- `src/app/api/courses/[id]/route.ts` esta parcialmente migrado: el `GET` usa `await context.params`, pero `PUT` y `DELETE` todavia usan `context.params.id`. Esto no causa el bug de noticias, pero confirma una inconsistencia repetida en endpoints dinamicos.
- La validacion actual usa `isNaN(id)`. Para un modelo `Int` autoincremental, seria mas estricto validar con `Number.isInteger(id) && id > 0`, como ya hace `src/libs/donations/adminApi.ts` lineas 19-20. Esto no es la causa principal, pero seria una mejora de robustez.

## Solucion propuesta

No implementar en esta tarea. Cambio minimo recomendado:

Archivo principal:

- `src/app/api/news/[id]/route.ts`

Funciones involucradas:

- `GET`
- `DELETE`
- `PUT`

Comportamiento actual:

- Lee `context.params.id` sincronico.
- Convierte `undefined` a `NaN`.
- Responde `"ID invalido"` aunque la URL tenga un ID valido.

Comportamiento esperado:

- Resolver `context.params` con `await`.
- Convertir `params.id` a numero.
- Validar que sea un entero positivo.
- Continuar con la busqueda/actualizacion/eliminacion correspondiente.

Cambio conceptual:

```ts
type NewsRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function getNewsRouteId(context: NewsRouteContext): Promise<number> {
  const params = await context.params;
  return Number(params.id);
}
```

Luego usar ese helper en `GET`, `DELETE` y `PUT`. La validacion podria mantenerse como `isNaN(id)` para cambio minimo, o alinearse con el patron existente de donaciones:

```ts
Number.isInteger(id) && id > 0
```

No hace falta cambiar el frontend para corregir este bug, porque el frontend ya esta enviando el ID en la URL esperada.

## Riesgos

- Creacion de noticias: bajo riesgo. Usa `POST /api/news`, sin `[id]`.
- Edicion sin cambio de imagen: deberia quedar corregida por el mismo cambio.
- Edicion con cambio de imagen: deberia avanzar hasta la logica de Cloudinary y Prisma, dejando de fallar en la validacion inicial del ID.
- Eliminacion: podria cambiar de fallar por `"ID invalido"` a ejecutar realmente el delete si actualmente estaba afectada por el mismo bug. Hay que verificar permisos y confirmacion UI.
- Imagenes existentes: el cambio de ID no modifica directamente imagenes. El riesgo real aparece solo cuando `imageBase64` existe: el endpoint elimina la imagen anterior antes de subir la nueva.
- Otros endpoints: no deberia afectar otros endpoints si el cambio se limita a noticias. Conviene revisar cursos en una tarea separada porque `PUT` y `DELETE` tienen el mismo patron.

## Plan de verificacion posterior

Despues de implementar la solucion, verificar manualmente:

1. Editar solo texto de una noticia existente y confirmar respuesta exitosa.
2. Editar solo imagen de portada y confirmar que se reemplaza en dashboard y vista publica.
3. Editar texto + imagen en la misma operacion.
4. Editar una noticia y conservar la imagen existente, sin enviar una nueva imagen.
5. Cancelar una edicion y confirmar que el formulario vuelve a modo creacion sin guardar cambios.
6. Crear una noticia nueva con imagen.
7. Crear una noticia nueva sin imagen y confirmar que usa la imagen por defecto en la UI.
8. Eliminar una noticia existente desde `/dashboard/noticias`.
9. Confirmar que `/noticias`, `/api/news`, `/api/news/get-all` y `/api/news/lastThreeNews` reflejan los cambios despues de la revalidacion.
10. Ejecutar `npm run build`.

## Referencia externa

La documentacion oficial de Next.js para route handlers indica que `context.params` es una promesa y muestra el patron `const { id } = await params`. Tambien registra en el historial que desde `v15.0.0-RC` `context.params` paso a ser una promesa.

## Implementación de la solución

### Archivos modificados

- `src/app/api/news/[id]/route.ts`
- `docs/bugs/edicion-noticia-id-invalido.md`

### Cambio realizado

En `src/app/api/news/[id]/route.ts` se agrego un tipo local para el contexto dinamico de noticias:

```ts
type NewsRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};
```

Tambien se agregaron dos helpers locales:

```ts
async function getNewsRouteId(context: NewsRouteContext): Promise<number> {
  const params = await context.params;
  return Number(params.id);
}

function isValidNewsRouteId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}
```

Los handlers `GET`, `DELETE` y `PUT` ahora reciben `context: NewsRouteContext`, obtienen el ID con `await getNewsRouteId(context)` y validan que sea un entero positivo con `isValidNewsRouteId(id)`.

No se modifico el frontend, `NewsContext`, `FormCreateNews`, Prisma, Cloudinary, el flujo de creacion de noticias ni otros endpoints.

### Por que corrige el problema

Next.js 16 entrega `context.params` como una promesa en route handlers dinamicos. Antes, `src/app/api/news/[id]/route.ts` intentaba leer `context.params.id` sincronico, por lo que el valor efectivo del ID era `undefined`; `Number(undefined)` generaba `NaN` y la API devolvia `"ID invalido"`.

Con el cambio, el handler primero resuelve `context.params` con `await`, luego convierte `params.id` a numero y recien despues valida el valor. Para URLs como `/api/news/123`, el backend pasa a validar `123` en lugar de `undefined`.

### Verificaciones ejecutadas

- Revision estatica de `GET`, `PUT` y `DELETE`: los tres handlers usan `await getNewsRouteId(context)` y `isValidNewsRouteId(id)`.
- Tests relacionados de noticias: `npm run test:run -- src/test/news`.
- Build de produccion: `npm run build`.

### Resultado de tests/build

- `npm run test:run -- src/test/news`: pasa. Resultado: 3 archivos de test, 9 tests exitosos.
- `npm run build`: pasa. Next.js compilo correctamente, ejecuto TypeScript, genero paginas estaticas y finalizo la optimizacion.
- Observacion del build: Turbopack emitio una advertencia no bloqueante en `./next.config.ts` sobre un archivo inesperado en la lista NFT, con traza hacia `src/generated/prisma/index.js` y `src/app/api/certificates/route.ts`. No esta relacionada con este cambio de noticias y no se modifico en esta tarea.

### Observaciones

La logica de `imageBase64` y Cloudinary quedo sin cambios. La correccion solo afecta la obtencion y validacion del parametro dinamico `id` en noticias.
