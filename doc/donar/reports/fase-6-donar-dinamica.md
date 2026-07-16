# Reporte Fase 6: convertir `/donar` a dinamica

## Objetivo cumplido

Se implemento exclusivamente la Fase 6 del plan tecnico:

- `/donar` deja de usar campana, montos y progreso hardcodeados.
- La pagina consume `GET /api/donation-campaigns/current`.
- El listado publico muestra donantes aprobados.
- El boton "Ver mas" consume `GET /api/donation-campaigns/[id]/donors`.
- El modal envia `FormData` a `POST /api/donations`.
- El formulario publico no pide ni envia `amount`.
- El monto mostrado publicamente sale solo de donaciones aprobadas por administracion.

No se implemento la ruta publica `/campanas-dea` ni ninguna funcionalidad de Fase 7.

## Archivos creados

- `src/components/Donations/DonationPageContent.tsx`
- `src/libs/donations/bankData.ts`
- `doc/donar/reports/fase-6-donar-dinamica.md`

## Archivos modificados

- `src/app/(front)/donar/page.tsx`

## Funcionalidad implementada

### Carga dinamica de campana

- La pagina carga la campana publica desde `/api/donation-campaigns/current`.
- Si hay campana `ACTIVE`, muestra CTA y permite abrir el modal.
- Si solo hay una campana `COMPLETED`, muestra estado de objetivo alcanzado y bloquea nuevas donaciones.
- Si no hay campana visible, muestra estado institucional sin formulario.
- La imagen del lugar, institucion, localidad, direccion, objetivo, total aprobado y porcentajes salen del backend.

### Progreso real

- El resumen usa:
  - `approvedTotal`
  - `goalAmount`
  - `percentage`
  - `visualPercentage`
- La barra y el DEA usan `visualPercentage`, limitado a 100.
- El porcentaje real puede superar 100 y se muestra como dato de transparencia.

### Modal de donacion

- El modal mantiene datos bancarios desde `src/libs/donations/bankData.ts`.
- El donante envia:
  - comprobante;
  - visibilidad;
  - nombre y apellido solo si la donacion es publica;
  - email opcional.
- No hay campo de monto.
- No se envia `amount` al backend.
- Si la campana cambio de estado mientras el modal estaba abierto, el backend devuelve error y la UI lo muestra.
- Despues de enviar correctamente, se recarga la campana actual.

### Donantes publicos

- El listado publico muestra solo datos devueltos por endpoints publicos:
  - nombre publico o `Anonimo`;
  - monto aprobado;
  - fecha.
- No muestra emails, comprobantes ni IDs internos.
- `Ver mas` carga paginas siguientes desde el endpoint publico de donantes.

## Decisiones tecnicas

- Se mantuvo `/donar` como client-side experience por el modal, animaciones y carga incremental de donantes.
- Se movio la mayor parte de la UI a `DonationPageContent` y `page.tsx` quedo como envoltorio.
- Se mantuvieron imagenes fallback solo para estados sin campana; la campana real usa `placeImageUrl`.
- Se mantuvieron animaciones existentes con duraciones cortas y transiciones `transform`/`opacity`.
- El texto del modal explica que el monto se confirma desde el comprobante por administracion.

## Diferencias respecto del plan original

- El plan sugeria multiples archivos de componentes publicos. Se implemento un componente principal con subcomponentes internos para mantener la fase contenida.
- Los datos bancarios se agregaron como constante local, tal como permitia el plan para v1.
- No se agregaron tests especificos de UI/API route en esta fase; quedan para Fase 8.

## Problemas encontrados

- `git status` normal sigue bloqueado por `dubious ownership`; se reviso con `git -c safe.directory='C:/Users/PC Franco/Desktop/arg-reanima-devjf' ...`.
- Los tests de Node se ejecutaron con permisos escalados porque el sandbox ya habia fallado en fases anteriores con `EPERM: operation not permitted, lstat 'C:\\Users\\PC Franco'`.
- `npm run build` pasa, pero mantiene una advertencia no bloqueante de Turbopack/NFT relacionada con Prisma generado y rutas API existentes.

## Verificaciones realizadas

- `npm run build`: exitoso.
- `npm test -- src/test/donations --run`: 6 archivos, 22 tests pasados.
- `npm test -- --run`: 25 archivos, 105 tests pasados.
- `npm run dev`: servidor iniciado en `http://localhost:3000`.
- `Invoke-WebRequest http://localhost:3000/donar`: 200 OK.
- Busqueda de `amount` en `/donar` y componentes publicos: no hay campo ni envio de `amount`; solo aparece como dato de donantes aprobados.

## Resultado

Fase 6 completada y verificada. `/donar` queda conectada a datos reales y el modal crea donaciones pendientes con comprobante, sin monto declarado por el donante.
