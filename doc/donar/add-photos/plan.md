# Plan tecnico: fotos adicionales en campanas DEA

## Contexto observado

El modulo de campanas DEA usa `DonationCampaign` en Prisma, servicios en `src/libs/donations/*`, route handlers en `src/app/api/admin/donation-campaigns`, API publica en `src/app/api/donation-campaigns/route.ts` y UI en `DonationCampaignDashboard` / `DonationCampaignsPageContent`. Las imagenes de campana ya se suben a Cloudinary desde `cloudinaryDonationStorage.ts`, con validacion de tipo/tamano, carpeta, transformaciones, `publicId` y limpieza con `destroyDonationAsset`.

## Plan breve

1. **Modelo de datos y Prisma**
   - Agregar un solo campo conceptual de fotos adicionales en `DonationCampaign`.
   - Usar la alternativa simple compatible con PostgreSQL y Prisma: `additionalImageUrls String[]` y `additionalImagePublicIds String[]`, o nombres equivalentes alineados con `placeImageUrl` / `placeImagePublicId`.
   - Definirlos como arreglos vacios por defecto si Prisma/PostgreSQL lo permite en el schema del proyecto; no crear tabla nueva salvo impedimento tecnico real.
   - Mantener limite de negocio de maximo dos imagenes en validacion/servicio, no en una estructura mas compleja.

2. **Cloudinary**
   - Reutilizar el flujo actual de `cloudinaryDonationStorage.ts`: mismos tipos permitidos que la imagen del lugar (`image/jpeg`, `image/png`, `image/webp`), maximo 5MB, `resource_type: "image"`, `format: "auto"` y `strip_metadata`.
   - Evitar helpers por cada foto. Como mucho, usar un helper generico para subir fotos adicionales recorriendo uno o dos archivos y guardandolos en una carpeta unica, por ejemplo `donation-campaigns/additional-images`.
   - Reutilizar `destroyDonationAsset` para rollback, reemplazos y eliminacion de imagenes adicionales.

3. **Backend, payloads y endpoints**
   - Extender los payloads de campana con `additionalImageUrls` y `additionalImagePublicIds` como arreglos opcionales, validando que el resultado final nunca supere dos elementos.
   - En `POST /api/admin/donation-campaigns`, leer un unico campo `additionalImages` desde `FormData.getAll(...)`, aceptar cero, una o dos imagenes, subirlas a Cloudinary y persistir arrays de URLs/publicIds.
   - En `PUT /api/admin/donation-campaigns/[id]`, conservar las imagenes existentes si no llega ningun cambio.
   - Para edicion, mantener una mecanica simple: aceptar nuevas `additionalImages` para reemplazar el conjunto completo y un flag tipo `removeAdditionalImages=true` para limpiar todas. Si se reemplaza o elimina, destruir los `publicId` anteriores despues de guardar; si falla el guardado, destruir las nuevas subidas.
   - No modificar endpoints ajenos a esta funcionalidad. Propagar solo en `adminApi.serializeCampaign` y en la API publica que alimenta `/campanas-dea`.

4. **Formulario administrador**
   - Agregar un solo input:
     ```html
     <input type="file" multiple />
     ```
   - Integrarlo en `CampaignFormState` como `additionalImages: File[]` y un flag simple para remover las existentes si corresponde.
   - Validar en cliente maximo dos archivos, usando el mismo estilo visual del input de imagen del lugar: label con borde punteado, `ImagePlus`, `accept="image/jpeg,image/png,image/webp"` y texto `JPG, PNG o WEBP hasta 5MB`.
   - En creacion, permitir cero, una o dos imagenes. En edicion, si no se seleccionan nuevas fotos ni se marca eliminacion, conservar las existentes.
   - Si el admin selecciona nuevas fotos, reemplazar el set completo por esas una o dos imagenes. Esto evita UI compleja de ordenar o eliminar individualmente.

5. **Tipos, validaciones y serializacion**
   - Actualizar los tipos locales `Campaign` y `PublicCampaign` con `additionalImageUrls: string[]`.
   - En respuestas admin incluir tambien `additionalImagePublicIds` porque el panel necesita conocer si existen imagenes cargadas.
   - En respuesta publica exponer solo `additionalImageUrls`.
   - Actualizar tests de payload y storage para confirmar: cero imagenes es valido, una o dos son validas, tres son invalidas, y se normalizan arrays vacios.

6. **Card publica en `/campanas-dea`**
   - En `CampaignCard`, si `additionalImageUrls.length > 0`, mostrar una grilla compacta dentro de la card, debajo del progreso y antes de las acciones.
   - Presentacion simple: una o dos miniaturas con `aspect-[4/3]`, `Image fill`, `object-cover`, borde sutil y radio consistente con la card actual.
   - No agregar carrusel, modal, galeria ni dependencias.

7. **Comportamiento sin imagenes**
   - Si no hay fotos adicionales, la card queda exactamente como esta hoy.
   - Si hay una sola, se muestra una sola miniatura.
   - Si hay dos, se muestran dos miniaturas en grilla.
   - No reservar espacios vacios ni mostrar placeholders para fotos opcionales.

## Validacion sugerida

- Actualizar tests de `validateDonationCampaignPayload` y `cloudinaryDonationStorage` para el limite de dos imagenes.
- Ejecutar `npm run build` como verificacion minima cuando se implemente.
