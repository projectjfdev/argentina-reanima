# Reporte Fase 4: APIs administrativas

## Objetivo cumplido

Se implemento exclusivamente la Fase 4 del plan tecnico:

- APIs administrativas protegidas con `requireAdminSession`.
- Gestion de campanas DEA desde endpoints admin.
- Listado y detalle administrativo de donaciones.
- Aprobacion de donaciones con monto ingresado por el administrador.
- Rechazo de donaciones pendientes.
- Endpoint autenticado para obtener URL firmada del comprobante.

No se implemento dashboard visual, sidebar, tarjetas de UI, refactor dinamico de `/donar` ni ruta `/campanas-dea`.

## Archivos creados

- `src/libs/donations/adminApi.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/admin/donations/route.ts`
- `src/app/api/admin/donations/[id]/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/reject/route.ts`
- `src/app/api/admin/donations/[id]/receipt/route.ts`
- `doc/donar/reports/fase-4-apis-administrativas.md`

## Endpoints Implementados

### `GET /api/admin/donation-campaigns`

- Requiere ADMIN.
- Lista campanas con paginacion.
- Filtros:
  - `status`
  - `search`
  - `page`
  - `pageSize`
- Devuelve progreso calculado y conteos de donaciones por estado.

### `POST /api/admin/donation-campaigns`

- Requiere ADMIN.
- Recibe `FormData`.
- Campos:
  - `institutionName`
  - `locality`
  - `address`
  - `goalAmount`
  - `placeImage`
- Usa `createDonationCampaignWithPlaceImage`.
- Respeta la restriccion de una sola campana activa.
- Revalida `/donar` y `/api/donation-campaigns/current`.

### `GET /api/admin/donation-campaigns/[id]`

- Requiere ADMIN.
- Devuelve detalle de campana con progreso calculado.
- Responde 400 para IDs invalidos y 404 si no existe.

### `PUT /api/admin/donation-campaigns/[id]`

- Requiere ADMIN.
- Recibe `FormData`.
- Edita solo campanas `ACTIVE`, usando el servicio existente.
- Permite reemplazar imagen del lugar con limpieza compensatoria por servicio.
- Revalida vistas publicas relacionadas.

### `PATCH /api/admin/donation-campaigns/[id]`

- Requiere ADMIN.
- Cambia estado a:
  - `COMPLETED`
  - `ARCHIVED`
- No permite reactivar ni estados fuera de v1.
- Usa servicios transaccionales.

### `GET /api/admin/donations`

- Requiere ADMIN.
- Lista donaciones con paginacion.
- Filtros:
  - `campaignId`
  - `status`
  - `search`
  - `page`
  - `pageSize`
- Incluye datos de campana asociados.
- Devuelve email y metadata de comprobante porque es endpoint admin.

### `GET /api/admin/donations/[id]`

- Requiere ADMIN.
- Devuelve detalle administrativo completo de una donacion.
- Responde 400 para IDs invalidos y 404 si no existe.

### `POST /api/admin/donations/[id]/approve`

- Requiere ADMIN.
- Recibe JSON con `amount`.
- El monto es obligatorio en aprobacion, porque el donante publico no lo declara.
- Valida monto con las reglas existentes de dinero.
- Cambia `PENDING` a `APPROVED`, guarda `amount`, setea `reviewedAt` y recalcula progreso en transaccion.
- Si se alcanza o supera el objetivo, completa la campana.
- Revalida `/donar`, `current` y donantes publicos de la campana.

### `POST /api/admin/donations/[id]/reject`

- Requiere ADMIN.
- Rechaza solo donaciones pendientes por servicio.
- Bloquea rechazo de donaciones aprobadas, siguiendo la decision v1.

### `GET /api/admin/donations/[id]/receipt`

- Requiere ADMIN.
- No expone comprobantes a endpoints publicos.
- Devuelve una URL firmada de Cloudinary para el asset `authenticated`.
- TTL de la URL: 5 minutos.
- Incluye nombre original, bytes y `resourceType`.

## Decisiones Tecnicas

- Se agrego `src/libs/donations/adminApi.ts` para centralizar:
  - parsing de IDs de rutas;
  - serializacion admin de campanas y donaciones;
  - filtros de enums;
  - mapeo de `DonationServiceError` a respuestas HTTP;
  - helpers de `FormData`.
- Las respuestas admin serializan `Decimal` como string o `null`.
- Se mantuvo `dynamic = "force-dynamic"` en los endpoints admin.
- La aprobacion exige monto y lo guarda en la transaccion de aprobacion.
- Los comprobantes se entregan por URL firmada generada server-side y solo despues de autenticacion ADMIN.
- Los endpoints admin pueden devolver emails y datos de comprobante; los endpoints publicos siguen sin exponerlos.

## Errores y Status

- 400: IDs invalidos, estado no soportado, payload invalido o monto de aprobacion invalido.
- 401: no autenticado.
- 403: usuario no ADMIN.
- 404: campana o donacion inexistente.
- 409: conflictos de negocio, por ejemplo segunda campana activa o aprobar/rechazar estados no permitidos.
- 500: errores inesperados.

## Diferencias Respecto Del Plan

- `POST /api/admin/donations/[id]/approve` exige `amount` por el cambio de negocio posterior a Fase 3.
- `GET /api/admin/donations/[id]/receipt` devuelve URL firmada JSON en lugar de proxyear el binario. Esto mantiene el endpoint simple y conserva la proteccion por sesion admin.
- No se agrego `publicId` administrativo para campanas o donaciones. Se mantuvieron IDs internos, protegidos por `requireAdminSession`, como permitia el plan.

## Problemas Encontrados

- `git status` normal sigue bloqueado por `dubious ownership`; se reviso con `git -c safe.directory='C:/Users/PC Franco/Desktop/arg-reanima-devjf' ...`.
- Los tests de Node se ejecutaron con permisos escalados porque el sandbox ya habia fallado en fases anteriores con `EPERM: operation not permitted, lstat 'C:\\Users\\PC Franco'`.
- `npm run build` pasa, pero mantiene una advertencia no bloqueante de Turbopack/NFT relacionada con Prisma generado y rutas API existentes.
- `git status` muestra cambios preexistentes no tocados en:
  - `src/app/(front)/donar/page.tsx`
  - `src/components/BannerHero/HomeHero.tsx`
  - `src/components/Navbar/navbar.tsx`

## Verificaciones Realizadas

- `npm run build`: exitoso.
- `npm test -- src/test/donations --run`: 6 archivos, 22 tests pasados.
- `npm test -- --run`: 25 archivos, 105 tests pasados.

## Resultado

Fase 4 completada y verificada. El proyecto queda con APIs administrativas listas para que una futura Fase 5 construya el dashboard visual sobre estos endpoints.
