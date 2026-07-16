# Reporte Fase 2: servicios server y Cloudinary

## Objetivo cumplido

Se implemento exclusivamente la Fase 2 del plan tecnico:

- Servicios server para reglas transaccionales de campanas.
- Servicios server para creacion y revision de donaciones.
- Helper de almacenamiento Cloudinary para imagenes de lugar y comprobantes.
- Errores de dominio tipados y reutilizables por futuras APIs.
- Limpieza compensatoria cuando se sube un archivo y luego falla la escritura en base de datos.
- Tests unitarios para validacion de archivos y errores de servicio.

No se crearon endpoints, paginas, componentes de dashboard ni cambios en `/donar`.

## Archivos creados

- `src/libs/donations/serviceErrors.ts`
- `src/libs/donations/cloudinaryDonationStorage.ts`
- `src/libs/donations/campaignService.ts`
- `src/libs/donations/donationService.ts`
- `src/test/donations/cloudinaryDonationStorage.test.ts`
- `src/test/donations/serviceErrors.test.ts`
- `doc/donar/reports/fase-2-servicios-server-cloudinary.md`

## Archivos modificados

- `src/libs/donations/index.ts`

## Decisiones tecnicas tomadas

- Se agrego `DonationServiceError` con `code`, `status` y `details` para que las futuras APIs puedan mapear errores de dominio a respuestas HTTP sin duplicar reglas.
- Los servicios usan transacciones Prisma para operaciones que cambian estado:
  - crear campana activa;
  - editar campana activa;
  - completar manualmente;
  - archivar;
  - crear donacion pendiente;
  - aprobar;
  - rechazar.
- `createDonationCampaign` valida que no exista otra activa antes de crear, y ademas mapea errores `P2002` por el indice unico parcial de Fase 1.
- `approveDonation` solo permite aprobar donaciones `PENDING`; recalcula el progreso dentro de la misma transaccion y completa la campana si el total aprobado alcanza o supera el objetivo.
- `rejectDonation` bloquea el rechazo de una donacion `APPROVED` en esta version, siguiendo la decision del plan de no permitir reversas sin auditoria.
- `updateActiveDonationCampaign` permite que una reduccion del objetivo por debajo del total aprobado complete automaticamente la campana.
- Cloudinary queda encapsulado en `cloudinaryDonationStorage.ts`.
- Imagenes de lugar:
  - folder `donation-campaigns/places`;
  - `resource_type: "image"`;
  - assets publicos tipo `upload`;
  - transformacion con calidad, formato automatico y metadata removida.
- Comprobantes:
  - folder `donation-campaigns/receipts`;
  - `resource_type: "auto"`;
  - `type: "authenticated"`;
  - `access_mode: "authenticated"`;
  - imagenes con metadata removida;
  - PDF sin transformacion.
- `destroyDonationAsset` distingue `upload` y `authenticated` para borrar correctamente imagenes publicas o comprobantes privados.
- Se agregaron wrappers compensatorios:
  - `createDonationCampaignWithPlaceImage`;
  - `updateActiveDonationCampaignWithPlaceImage`;
  - `createPendingDonationWithReceipt`.
  Si Cloudinary sube el archivo y luego falla Prisma o una regla de negocio, se intenta destruir el asset recien subido.

## Diferencias respecto del plan original

- El plan mencionaba servicios y estrategia Cloudinary; se agregaron tambien wrappers de alto nivel que combinan upload + escritura DB para dejar resuelto desde esta fase el caso "archivo subido pero error al guardar".
- No se agrego acceso firmado o proxy para ver comprobantes. Eso queda para la Fase 4, porque requiere endpoint administrativo y autenticacion por request.
- No se agregaron tests con Prisma real ni Cloudinary real. Se mantuvieron unitarios porque el repo no tiene base de datos de test configurada y esta fase no debia crear infraestructura adicional.

## Problemas encontrados

- No hubo fallos de implementacion en la verificacion final.
- Las ejecuciones de Node se hicieron con permisos escalados porque en Fase 1 el sandbox ya habia bloqueado `lstat` sobre `C:\\Users\\PC Franco`.
- El build sigue mostrando una advertencia existente de Turbopack/NFT relacionada con `next.config.ts`, `src/generated/prisma/index.js` y `src/app/api/news/[id]/route.ts`. No bloquea y no fue introducida por esta fase.
- `git status` sigue mostrando cambios preexistentes no tocados en:
  - `src/app/(front)/donar/page.tsx`
  - `src/components/BannerHero/HomeHero.tsx`
  - `src/components/Navbar/navbar.tsx`

## Verificaciones realizadas

- `npm test -- src/test/donations --run`: 6 archivos, 22 tests pasados.
- `npm test -- --run`: 25 archivos, 105 tests pasados.
- `npm run build`: exitoso.

## Resultado

Fase 2 completada y verificada. El proyecto queda preparado para que la Fase 3 construya endpoints publicos sobre estos servicios, sin duplicar reglas de negocio ni logica Cloudinary.
