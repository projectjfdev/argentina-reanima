# Plan tecnico por fases: campanas de donacion para instalacion de DEA

## Diagnostico del proyecto actual

El proyecto es Next.js App Router con TypeScript, React 19, Tailwind CSS 4, Prisma 6 con PostgreSQL, NextAuth 4 y Cloudinary. Las rutas publicas viven en `src/app/(front)`, las APIs en `src/app/api`, el dashboard administrativo en `src/app/(front)/dashboard`, componentes reutilizables en `src/components`, helpers en `src/libs`, interfaces en `src/interfaces`, y Prisma en `prisma/schema.prisma`.

La pagina actual `/donar` esta implementada en `src/app/(front)/donar/page.tsx` como client component completo. Tiene datos hardcodeados para progreso, monto recaudado, objetivo, lugar, imagen, datos bancarios, barra de progreso y visual del DEA. El modal usa `src/components/ui/dialog.tsx`, `Input`, `Label`, `Button`, `sonner` y estado local. El formulario valida solo en cliente: comprobante requerido, y nombre/apellido requeridos solo si la donacion es publica. No envia datos al backend, no guarda archivos y no consulta base de datos.

El dashboard esta protegido por dos capas: `src/proxy.ts` limita `/dashboard/:path*` a usuarios con `role === "ADMIN"` y `src/app/(front)/dashboard/layout.tsx` redirige si la sesion no es ADMIN. Las APIs administrativas existentes usan `src/libs/auth/requireAdminSession.ts`, que devuelve 401/403 con JSON. Conviene mantener ese patron.

Prisma usa cliente generado en `src/generated/prisma` y helper singleton `src/libs/db.ts`. El schema actual contiene `User`, `Certificate`, `EmailVerificationToken`, `PasswordResetToken`, `News`, `Course` y `Lesson`. Ya existen enums (`Role`, `CertificateStatus`). No existe modelo de donaciones ni campanas, por lo que esta funcionalidad requiere migraciones.

Cloudinary ya esta centralizado en `src/libs/cloudinary.ts`. Noticias sube imagenes base64 a `folder: "images"` y guarda `imageUrl`/`imagePublicId`; al editar o borrar destruye la imagen anterior. Para esta funcionalidad se debe usar Cloudinary tambien, pero con reglas distintas: imagen del lugar puede ser publica; comprobantes de pago deben tratarse como archivos privados y solo exponerse a administradores mediante endpoint autenticado.

Los patrones de UI mas reutilizables estan en `src/components/ui`: `button`, `input`, `textarea`, `select`, `dialog`, `badge`, `card`, `pagination`, `tooltip`, `label`. Tambien existen `FileUpload` con `react-dropzone`, `SimplePagination`, formularios con `react-hook-form`, filtros y paginacion en certificados. El dashboard de certificados es la referencia mas solida para nuevos formularios administrativos porque ya concentra formulario, listado, filtros, estados de carga, validacion, toasts y paginacion.

## Decisiones de arquitectura

- La fuente de verdad del monto recaudado sera la suma de donaciones `APPROVED` por campana. En v1 no conviene persistir `raisedAmount`, para evitar diferencias entre total almacenado y total calculado. Si en el futuro hay volumen alto, se puede agregar una tabla de resumen con reconciliacion.
- Cambio de negocio: el donante publico no declara el monto. El formulario publico y `POST /api/donations` solo reciben campana, visibilidad, datos opcionales y comprobante. El monto real lo ingresa un administrador al aprobar la donacion despues de verificar el comprobante.
- Los montos se guardaran como `Decimal` en Prisma/PostgreSQL, por ejemplo `@db.Decimal(14, 2)`, y nunca como `number` flotante para calculos de negocio. En `Donation.amount` el campo es nullable mientras la donacion esta `PENDING`; debe tener valor positivo al pasar a `APPROVED`. La UI formatea ARS con `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`.
- Como maximo debe existir una campana `ACTIVE`. Prisma no modela indices unicos parciales de forma portable, por lo que se debe agregar en la migracion SQL un indice unico parcial de PostgreSQL: `CREATE UNIQUE INDEX ... ON "DonationCampaign" ("status") WHERE "status" = 'ACTIVE';`. El codigo tambien debe validar, pero la base debe ser la ultima defensa ante concurrencia.
- Estados de campana: `ACTIVE`, `COMPLETED`, `ARCHIVED`. Para pausar o retirar de circulacion se usara `ARCHIVED`; no se agrega `PAUSED` en v1 porque el usuario pidio evitar estados innecesarios y `ARCHIVED` cubre retirar de circulacion e historico.
- `/donar` mostrara la campana `ACTIVE`. Si no hay activa, mostrara la ultima `COMPLETED`. Si solo hay `ARCHIVED` o no hay campanas, mostrara un estado publico sin formulario de donacion.
- Una campana `COMPLETED` se muestra como objetivo alcanzado cuando no hay otra activa, pero no permite nuevas donaciones.
- Las donaciones se pueden crear solo si la campana destino sigue `ACTIVE` al momento de guardar. Si el usuario tenia el modal abierto y la campana cambio a `COMPLETED` o `ARCHIVED`, el POST debe devolver 409.
- En v1 se recomienda bloquear cambios desde `APPROVED` hacia `REJECTED` para evitar afectar historicos sin auditoria. Si el negocio exige revertir aprobaciones, debe hacerse con una accion explicita "reabrir a pendiente" o "rechazar aprobada" y recalculo transaccional; no incluirlo en esta primera version.
- El listado publico de donantes mostrara nombre/apellido o "Anonimo", fecha y monto solo de donaciones ya aprobadas con monto administrativo cargado. Mostrar monto aporta transparencia y ya se muestra el total de campana; no se expone email, comprobante, IDs internos ni datos administrativos.

## Modelo propuesto

Agregar enums en `prisma/schema.prisma`:

```prisma
enum DonationCampaignStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum DonationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

Agregar modelos:

```prisma
model DonationCampaign {
  id                    Int                    @id @default(autoincrement())
  institutionName       String
  locality              String
  address               String
  placeImageUrl         String
  placeImagePublicId    String
  goalAmount            Decimal                @db.Decimal(14, 2)
  status                DonationCampaignStatus @default(ACTIVE)
  completedAt           DateTime?
  archivedAt            DateTime?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  donations Donation[]

  @@index([status])
  @@index([createdAt])
}

model Donation {
  id                    Int            @id @default(autoincrement())
  campaignId            Int
  amount                Decimal?       @db.Decimal(14, 2)
  isAnonymous           Boolean        @default(true)
  firstName             String?
  lastName              String?
  email                 String?
  status                DonationStatus @default(PENDING)
  receiptUrl            String?
  receiptPublicId       String
  receiptResourceType   String
  receiptOriginalName   String?
  receiptBytes          Int?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  reviewedAt            DateTime?

  campaign DonationCampaign @relation(fields: [campaignId], references: [id], onDelete: Restrict)

  @@index([campaignId, status, createdAt])
  @@index([status])
  @@index([createdAt])
}
```

Notas:

- `receiptUrl` debe ser nullable o no expuesto publicamente. Si se usa Cloudinary `authenticated`, la URL persistida no debe enviarse a APIs publicas.
- No se agrega `reviewedByUserId` porque v1 excluye registro visible del administrador. Se puede agregar en una fase futura con auditoria.
- No se agrega slug todavia. Para preparar `/campanas-dea/[slug]` sin implementarlo, se puede agregar `publicId` o `slug` luego. Si se quiere evitar migracion futura, agregar `publicId String @unique @default(uuid())` desde v1, pero no exponerlo como identificador sensible.

## Fase 1: Dominio, migracion y helpers

Objetivo: crear la base de datos y helpers puros para campanas, donaciones, dinero y progreso.

Alcance:

- Modificar `prisma/schema.prisma`.
- Crear migracion Prisma con el indice unico parcial para una sola campana activa.
- Agregar helpers en `src/libs/donations`, por ejemplo `money.ts`, `campaignProgress.ts`, `validateDonationCampaignPayload.ts`, `validateDonationPayload.ts`.
- Agregar tipos de payload en `src/interfaces/donations.ts` o cerca de los helpers, siguiendo el patron actual.

Cambios de datos:

- Nuevos enums y modelos `DonationCampaign`, `Donation`.
- Indices por estado, campana y fecha.
- Indice unico parcial PostgreSQL para `ACTIVE`.

Reglas de negocio:

- `goalAmount > 0`.
- `amount > 0` solo al aprobar administrativamente una donacion. Las donaciones `PENDING` pueden tener `amount = null`.
- Monto maximo configurable por constante para evitar valores absurdos, por ejemplo `999999999.99` hasta que negocio defina limite. Esta validacion aplica al monto ingresado por el administrador al aprobar.
- Porcentaje real = `approvedTotal / goalAmount * 100`.
- Porcentaje visual = `Math.min(realPercentage, 100)`.
- Si `approvedTotal >= goalAmount`, la campana pasa a `COMPLETED`.

Validaciones:

- Strings requeridos con `trim`, longitudes maximas razonables: institucion 120, localidad 80, direccion 180, nombres 80, email 254.
- Decimal ARS acepta coma o punto en UI, pero se normaliza antes de enviar o en helper server.
- Prohibir NaN, infinito, cero, negativo y mas de dos decimales.

Riesgos:

- Prisma no conserva el indice parcial en schema; debe documentarse en la migracion SQL.
- Si se usa `Decimal` directamente en JSON, hay que serializar a string para no perder precision.

Casos de prueba:

- Validacion de monto administrativo cero, negativo, decimal con coma, decimal con punto, monto alto.
- Calculo de porcentaje con 0 donaciones, con objetivo exacto, con excedente.
- Intento de crear dos `ACTIVE` a nivel DB.

Criterios de aceptacion:

- `npx prisma generate` funciona.
- La migracion crea los modelos y el indice unico parcial.
- Helpers de calculo no usan floats como fuente de verdad.

Dependencias:

- Ninguna fase funcional debe avanzar sin esta base.

## Fase 2: Servicios server y Cloudinary

Objetivo: encapsular operaciones de campanas, donaciones y archivos para no duplicar reglas en endpoints.

Alcance:

- Crear `src/libs/donations/campaignService.ts`.
- Crear `src/libs/donations/donationService.ts`.
- Crear `src/libs/donations/cloudinaryDonationStorage.ts`.
- Reutilizar `src/libs/cloudinary.ts`.

Cambios de datos:

- Sin nueva migracion, salvo ajustes descubiertos en fase 1.

Reglas de negocio:

- Crear campana como `ACTIVE` solo si no existe otra activa. La transaccion y el indice DB deben resolver carreras.
- Editar solo campanas `ACTIVE`; si se reduce `goalAmount` por debajo de lo recaudado aprobado, marcar automaticamente `COMPLETED` o bloquear la reduccion. Recomendacion v1: permitirlo y completar automaticamente, mostrando confirmacion en UI.
- Archivar retira de circulacion. Si se archiva una activa, `/donar` cae a ultima completada o estado vacio.
- Completar manualmente bloquea nuevas donaciones.
- Aprobar donacion debe ejecutarse en transaccion: validar y guardar el monto real verificado por el administrador, cambiar estado de `PENDING` a `APPROVED`, recalcular total aprobado, completar campana si corresponde.
- Rechazar solo desde `PENDING`.
- Bloquear cambios de estado desde `APPROVED` en v1.

Validaciones:

- Imagen del lugar: solo imagen, maximo recomendado 5 MB, transformar con `quality`, `format: "auto"`, `strip_metadata`.
- Comprobante: permitir `image/jpeg`, `image/png`, `image/webp` (no se debe poder subir PDF); maximo recomendado 5 MB. Rechazar otros MIME aunque el nombre parezca valido.
- Manejar error de carga: si Cloudinary falla, no crear donacion.
- Si Cloudinary sube comprobante pero falla Prisma, destruir el asset subido en catch compensatorio.

Estrategia Cloudinary:

- Imagen de lugar: folder `donation-campaigns/places`, publica, guardar `secure_url` y `public_id`.
- Comprobantes: folder `donation-campaigns/receipts`, `resource_type: "auto"`, preferentemente `type: "authenticated"` o configuracion equivalente. Guardar `public_id`, `resource_type`, bytes y nombre original. El acceso debe hacerse mediante endpoint admin que genere URL firmada o proxy server.
- Al reemplazar imagen de lugar, subir nueva, actualizar DB y luego destruir anterior. Si falla DB, destruir nueva.
- No borrar comprobantes al rechazar donaciones; son evidencia administrativa.

Riesgos:

- Operaciones compensatorias con Cloudinary no son transaccionales con DB.

Casos de prueba:

- Falla Cloudinary antes de DB.
- Falla DB despues de Cloudinary y se intenta limpiar asset.
- Archivo demasiado grande o MIME invalido.
- Reemplazo de imagen del lugar.

Criterios de aceptacion:

- Reglas de estado y calculo viven en servicios o helpers, no en componentes.
- Ningun endpoint publico puede serializar `receiptUrl`, `receiptPublicId`, `email` ni IDs internos innecesarios.

Dependencias:

- Fase 1.

## Fase 3: APIs publicas

Objetivo: alimentar `/donar` y permitir envio real de donaciones.

Alcance:

- `src/app/api/donation-campaigns/current/route.ts`: GET publico.
- `src/app/api/donation-campaigns/[id]/donors/route.ts`: GET publico paginado o con cursor para donantes aprobados.
- `src/app/api/donations/route.ts`: POST publico con `FormData`.
- Revalidacion de `/donar` cuando cambian campanas o aprobaciones.

Cambios de datos:

- Sin migracion adicional.

Reglas de negocio:

- `current` devuelve `ACTIVE`; si no hay, ultima `COMPLETED`; si no hay, `null`.
- `current` incluye datos publicos de campana, total aprobado calculado, porcentaje real, porcentaje visual, `canDonate`, y primeros 10 donantes aprobados con monto administrativo cargado.
- `POST /api/donations` exige `campaignId`, `visibility` y comprobante. No acepta `amount`. Si `visibility=public`, exige nombre y apellido.
- Antes de guardar, reconsultar campana y exigir `status === ACTIVE`.
- Al enviar donacion queda `PENDING`; no afecta totales.

Validaciones:

- Parsear `FormData`.
- Doble envio: deshabilitar boton en cliente y considerar `clientSubmissionId` opcional unico en backend si se quiere idempotencia estricta.
- Email opcional pero si existe debe tener formato valido y normalizarse lower/trim.
- Nombres largos se aceptan hasta limite y UI debe truncar.

Riesgos:

- Endpoint publico con archivos puede ser abusado. Debe limitar tamano, MIME y responder temprano.
- Si el usuario mantiene modal abierto y la campana cambia de estado, devolver 409 con mensaje claro.

Casos de prueba:

- Sin campana activa.
- Campana completada visible pero `canDonate=false`.
- Donacion anonima sin nombre y sin monto declarado.
- Donacion publica sin apellido rechazada.
- Si el cliente envia `amount`, el backend lo rechaza con 400 para evitar que una UI publica vieja siga declarando montos.
- Donacion enviada para campana archivada/completada devuelve 409.
- Listado publico trae solo aprobadas, orden desc, limite 10 y pagina siguiente.

Criterios de aceptacion:

- `/api/donation-campaigns/current` no expone datos privados.
- `/api/donations` crea donacion `PENDING` asociada explicitamente a la campana correcta.
- Errores devuelven status adecuados: 400 validacion, 404 campana inexistente, 409 campana no activa, 500 inesperado.

Dependencias:

- Fases 1 y 2.

## Fase 4: APIs administrativas

Objetivo: gestionar campanas y revisar donaciones desde el dashboard.

Alcance:

- `src/app/api/admin/donation-campaigns/route.ts`: GET listado con filtros/paginacion, POST crear.
- `src/app/api/admin/donation-campaigns/[id]/route.ts`: GET detalle, PUT editar, PATCH estado.
- `src/app/api/admin/donations/route.ts`: GET listado con filtros por campana y estado.
- `src/app/api/admin/donations/[id]/route.ts`: GET detalle admin sin datos publicos.
- `src/app/api/admin/donations/[id]/approve/route.ts`: POST aprobar.
- `src/app/api/admin/donations/[id]/reject/route.ts`: POST rechazar.
- `src/app/api/admin/donations/[id]/receipt/route.ts`: GET comprobante o URL firmada.

Cambios de datos:

- Sin migracion adicional salvo que se decida agregar `publicId` para no operar por `id` en URLs admin. Si se mantiene `id`, proteger estrictamente con `requireAdminSession`.

Reglas de negocio:

- Todos los endpoints admin llaman `requireAdminSession`.
- Crear `ACTIVE` usa transaccion y captura violacion de indice unico como 409.
- Editar activa: institucion/localidad/direccion/imagen/objetivo.
- Completar manualmente: cambia `ACTIVE` a `COMPLETED` y setea `completedAt`.
- Archivar: cambia `ACTIVE` o `COMPLETED` a `ARCHIVED`, setea `archivedAt`; si era activa, no queda activa.
- Aprobar/rechazar solo donaciones `PENDING`. Aprobar exige que el administrador ingrese el monto real verificado en el comprobante. Intentar aprobar una ya aprobada puede ser idempotente 200 o conflicto 409; recomendacion: 409 con estado actual para evitar dobles clicks confusos.
- Dos aprobaciones simultaneas deben recalcular total dentro de transaccion; si se supera el objetivo, guardar total real por suma y completar campana.

Validaciones:

- Filtros: `campaignId`, `status`, `page`, `pageSize` con limites maximos.
- No aceptar cambios de estado no definidos.
- No permitir reactivar desde `ARCHIVED` en v1 salvo que se implemente accion especifica que respete unica activa.

Riesgos:

- Mezclar rutas publicas y admin puede filtrar datos por accidente. Por eso se recomienda prefijo `/api/admin/...` para todas las operaciones sensibles.
- Ver comprobantes por URL directa puede exponer privados; usar endpoint con sesion admin.

Casos de prueba:

- Usuario no logueado recibe 401.
- USER recibe 403.
- ADMIN lista donaciones y filtra por estado/campana.
- Aprobar donacion con monto valido cambia total visible.
- Rechazar donacion no cambia total.
- Aprobar dos donaciones que superan objetivo completa una vez la campana.
- Intentar crear segunda activa devuelve 409 aunque haya dos requests concurrentes.

Criterios de aceptacion:

- Ninguna API admin responde sin `requireAdminSession`.
- Cambios de estado son transaccionales.
- Comprobantes solo accesibles autenticado como ADMIN.

Dependencias:

- Fases 1, 2 y 3.

## Fase 5: Dashboard administrativo

Objetivo: agregar gestion visual de campanas y donaciones al panel existente.

Alcance:

- Agregar enlace "Campanas DEA" en `src/components/Dashboard/SidebarContent.tsx`.
- Agregar tarjeta en `src/app/(front)/dashboard/page.tsx`.
- Crear `src/app/(front)/dashboard/campanas-dea/page.tsx`.
- Crear componentes en `src/components/Dashboard/Donations`, por ejemplo:
  - `DonationCampaignDashboard.tsx`
  - `DonationCampaignForm.tsx`
  - `DonationCampaignList.tsx`
  - `DonationProgressCard.tsx`
  - `DonationReviewTable.tsx`
  - `DonationStatusBadge.tsx`
  - `ReceiptPreviewDialog.tsx`

Cambios de datos:

- Ninguno.

Reglas de negocio:

- Formulario de campana: institucion, localidad, direccion, imagen del lugar, monto objetivo.
- No hay borrador: al crear queda activa si no hay otra activa.
- Si ya existe activa, el formulario debe explicar que hay que completar/archivar la actual antes de crear otra activa.
- Editar solo activa.
- Mostrar progreso: total aprobado, objetivo, porcentaje visual capped 100, cantidad de donaciones pendientes/aprobadas/rechazadas.
- Acciones: completar manualmente, archivar, ver historicas.
- Donaciones: listar, filtrar por campana, filtrar por estado, ver monto si ya fue aprobado, nombre/apellido si corresponde, anonima/publica, fecha, comprobante, aprobar ingresando monto real, rechazar.

Validaciones:

- `react-hook-form` como certificados.
- Imagen con previsualizacion y limite de tamano antes de enviar.
- Confirmaciones para completar/archivar/aprobar/rechazar. La aprobacion debe incluir input de monto validado.
- Botones deshabilitados durante submit para evitar doble accion.

Riesgos:

- El dashboard actual tiene mezcla de estilos antiguos y nuevos. Conviene seguir el estilo de `CertificatesDashboard` para densidad, filtros y tarjetas, y no el wizard de noticias.
- Los comprobantes pueden ser PDF; el preview debe manejar abrir en nueva pestana protegida o descarga autorizada.

Casos de prueba:

- Crear primera campana.
- Intentar crear con campos vacios.
- Intentar crear segunda activa.
- Editar monto objetivo con donaciones aprobadas.
- Reducir objetivo por debajo del total y verificar completada.
- Ver tabla con nombres largos sin romper layout.
- Aprobar con monto, rechazar desde tabla y recargar datos.

Criterios de aceptacion:

- Un ADMIN puede operar toda la v1 desde `/dashboard/campanas-dea`.
- El sidebar y home del dashboard incluyen la nueva seccion.
- Estados y totales mostrados coinciden con APIs.

Dependencias:

- Fases 3 y 4.

## Fase 6: Convertir `/donar` a dinamica

Objetivo: reemplazar hardcode por datos reales y conectar el modal al backend.

Alcance:

- Refactor de `src/app/(front)/donar/page.tsx`.
- Extraer componentes publicos en `src/components/Donations`, por ejemplo:
  - `DonationPageContent.tsx`
  - `DonationProgressSummary.tsx`
  - `DonationDeaProgress.tsx`
  - `DonationPlaceCard.tsx`
  - `DonationModal.tsx`
  - `PublicDonorList.tsx`
- Consumir `GET /api/donation-campaigns/current` y `GET donors`.
- Enviar `FormData` a `POST /api/donations` sin monto declarado por el donante.

Cambios de datos:

- Ninguno.

Reglas de negocio:

- Todo lo hardcodeado pasa a datos dinamicos: institucion, localidad, direccion, imagen, objetivo, recaudado aprobado, porcentaje, barra, DEA, estado de completada, donantes.
- Datos bancarios quedan como configuracion global de app. En v1 puede ser constante en `src/libs/donations/bankData.ts` o variable de entorno/config server. No modelarlos por campana.
- Si `canDonate=false`, el CTA final debe mostrarse deshabilitado o reemplazado por mensaje de objetivo alcanzado/no hay campana activa.
- Si campana `COMPLETED`, indicar claramente "Objetivo alcanzado" y bloquear modal.
- Si no existe campana, mostrar estado vacio institucional sin formulario.
- Si solo hay archivadas, no mostrar una archivada en `/donar`.
- El modal publico no debe pedir ni enviar monto. El monto informado publicamente sale solo de donaciones aprobadas por administracion.

Validaciones:

- Revalidar estado de campana al enviar, manejar 409.
- Barra y DEA usan porcentaje visual capped 100.
- Si monto real supera objetivo, mostrar monto real recaudado y porcentaje visual 100.
- Listado de donantes: primeras 10, "Ver mas", recientes primero.

Riesgos:

- La pagina actual es client component por animaciones y modal. Puede mantenerse client-side fetch inicialmente, o dividir server component para datos iniciales y client components para modal/interacciones. Recomendacion: server component para carga inicial y client component para modal/listado incremental si el esfuerzo lo permite.
- Evitar que el listado publico reciba payload admin por reutilizar tipos internos.

Casos de prueba:

- Campana activa sin donaciones.
- Campana activa con mas de 10 aprobadas y boton "Ver mas".
- Donacion pendiente no aparece.
- Donacion rechazada no aparece ni suma.
- Donacion anonima muestra "Anonimo".
- Donacion publica muestra nombre y apellido.
- Email y comprobante nunca aparecen en HTML/API publica.
- Usuario abre modal, admin completa campana, usuario envia: recibe mensaje de campana cerrada.

Criterios de aceptacion:

- `/donar` ya no tiene montos ni campana hardcodeados.
- Solo aprobadas afectan recaudacion y visual del DEA.
- El modal crea donaciones pendientes con comprobante en Cloudinary y sin monto.

Dependencias:

- Fases 3 y 4. Puede hacerse antes del dashboard completo si las APIs ya existen, pero conviene despues de tener revision admin.

## Fase 7: Ruta publica `/campanas-dea`

Objetivo: crear una base publica simple para historico y expansion futura.

Alcance:

- Crear `src/app/(front)/campanas-dea/page.tsx`.
- Crear endpoint publico opcional `src/app/api/donation-campaigns/route.ts` con listado publico limitado.
- Mostrar campanas `ACTIVE` y `COMPLETED`; evaluar si mostrar `ARCHIVED` solo si representa historico publico validado. Recomendacion v1: no mostrar `ARCHIVED` publicamente.

Cambios de datos:

- Ninguno.

Reglas de negocio:

- No implementar `/campanas-dea/[slug]`.
- No implementar filtros avanzados ni estadisticas complejas.
- Preparar componentes para recibir cards de campana con progreso y estado.

Validaciones:

- API publica no expone comprobantes, emails, IDs internos sensibles ni donaciones individuales salvo resumen permitido.

Riesgos:

- Si se quiere linkear detalle futuro, conviene haber definido `publicId` o `slug`. Si no se agrega en Fase 1, documentar migracion futura.

Casos de prueba:

- Sin campanas muestra estado vacio.
- Activa aparece primero.
- Completadas aparecen como historicas.
- Archivadas no aparecen, salvo decision explicita contraria.

Criterios de aceptacion:

- Existe `/campanas-dea` con arquitectura lista para crecer, sin detalle individual.

Dependencias:

- Fase 3 y modelo de campanas.

## Fase 8: Seguridad, pruebas y validacion final

Objetivo: cerrar riesgos de privacidad, concurrencia y regresion.

Alcance:

- Tests unitarios de helpers en `src/test/donations`.
- Tests de APIs administrativas y publicas con mocks de Prisma/Cloudinary siguiendo patrones de `src/test/auth` y `src/test/certificates`.
- Revision manual en `npm run dev`.
- `npm run build` como check minimo del repo.

Cambios de datos:

- Ninguno esperado.

Reglas de negocio a verificar:

- Una sola activa.
- Donaciones aprobadas suman; pendientes/rechazadas no.
- Completar automatico al alcanzar/superar objetivo.
- Excedente se conserva en monto real, visual capped 100.
- Completada visible si no hay activa, pero sin nuevas donaciones.

Validaciones:

- Sanitizacion de payloads publicos.
- Proteccion de endpoints admin.
- Acceso a comprobantes solo admin.
- Manejo de errores Cloudinary/DB.

Riesgos:

- Tests de route handlers con `File`/`FormData` pueden requerir setup especifico de Vitest/jsdom o entorno Node compatible.
- Concurrencia real es dificil de simular con mocks; al menos cubrir indice unico y transacciones en integracion local si hay DB de test.

Casos de prueba principales:

- Intento de segunda activa.
- Dos admins creando activa al mismo tiempo: uno gana, otro 409.
- Dos aprobaciones simultaneas superan objetivo: total real correcto y campana `COMPLETED`.
- Monto administrativo cero/negativo/extremadamente alto al aprobar.
- Decimal ARS con coma/punto.
- Archivo invalido, grande o MIME no permitido.
- Error al subir comprobante.
- Comprobante subido y error al guardar: limpieza compensatoria.
- Campana archivada/completada durante modal.
- Edicion de objetivo con aprobadas y reduccion bajo total.
- Cambio de aprobada a rechazada bloqueado.
- Imagen faltante o rota: fallback visual.
- Mas de 10 donantes y "Ver mas".
- Doble submit y reintento de red.
- Acceso no autorizado a admin APIs.
- API publica no expone email, comprobante ni internos.
- Sin campana, solo completada, solo archivadas.

Criterios de aceptacion:

- `npm run test:run` pasa si se agregan tests.
- `npm run build` pasa.
- No hay rutas publicas que expongan datos privados.
- La documentacion del plan queda actualizada si alguna decision cambia durante implementacion.

Dependencias:

- Todas las fases anteriores.

## Archivos probablemente afectados

- `prisma/schema.prisma`
- `prisma/migrations/*/migration.sql`
- `src/libs/donations/*`
- `src/interfaces/donations.ts`
- `src/libs/cloudinary.ts` si hace falta helper adicional, aunque idealmente se importa sin modificarlo.
- `src/app/api/donation-campaigns/current/route.ts`
- `src/app/api/donation-campaigns/[id]/donors/route.ts`
- `src/app/api/donations/route.ts`
- `src/app/api/admin/donation-campaigns/route.ts`
- `src/app/api/admin/donation-campaigns/[id]/route.ts`
- `src/app/api/admin/donations/route.ts`
- `src/app/api/admin/donations/[id]/route.ts`
- `src/app/api/admin/donations/[id]/approve/route.ts`
- `src/app/api/admin/donations/[id]/reject/route.ts`
- `src/app/api/admin/donations/[id]/receipt/route.ts`
- `src/app/(front)/donar/page.tsx`
- `src/app/(front)/campanas-dea/page.tsx`
- `src/app/(front)/dashboard/page.tsx`
- `src/app/(front)/dashboard/campanas-dea/page.tsx`
- `src/components/Dashboard/SidebarContent.tsx`
- `src/components/Dashboard/Donations/*`
- `src/components/Donations/*`
- `src/test/donations/*`

## Orden recomendado

1. Modelo, migracion, helpers y tests de dominio.
2. Servicios server y estrategia Cloudinary.
3. APIs publicas y administrativas.
4. Dashboard administrativo para crear campanas y aprobar/rechazar donaciones.
5. Refactor dinamico de `/donar`.
6. Ruta publica `/campanas-dea`.
7. Pruebas, build, revision de privacidad y edge cases.

Este orden reduce riesgo: primero se asegura la integridad de datos y concurrencia, despues se habilita la operacion administrativa, y recien entonces se reemplaza la pagina publica estatica por datos reales.
