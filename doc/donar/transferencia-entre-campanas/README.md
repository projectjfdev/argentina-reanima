# Plan estrategico y tecnico: transferencia simple de excedentes entre campanas

## Objetivo

Incorporar una regla simple y transparente al sistema de donaciones: cuando una campana supera su objetivo, el dinero excedente debe aplicarse automaticamente a la campana siguiente, dejando un registro claro de esa transferencia e informando al publico antes de donar.

La solucion no debe convertirse en un sistema contable complejo. Argentina Reanima tendra pocas campanas por ano y un volumen relativamente bajo de donaciones. La prioridad es que el comportamiento sea entendible, mantenible y consistente con las reglas actuales del modulo.

## Diagnostico del comportamiento actual

El sistema ya tiene campanas y donaciones modeladas en Prisma:

- `DonationCampaign`: institucion, localidad, direccion, imagen, objetivo, estado (`ACTIVE`, `COMPLETED`, `ARCHIVED`), fechas y donaciones.
- `Donation`: campana, monto nullable, visibilidad, datos del donante, estado (`PENDING`, `APPROVED`, `REJECTED`) y comprobante.

Las reglas actuales relevantes son:

- Solo puede existir una campana `ACTIVE`, garantizado por validacion de servicio y por indice unico parcial en PostgreSQL.
- El donante publico no declara monto; sube comprobante y el administrador carga el monto real al aprobar.
- Solo las donaciones `APPROVED` con monto suman al progreso.
- Las donaciones `PENDING` y `REJECTED` no suman.
- Una campana se completa automaticamente cuando la suma aprobada alcanza o supera el objetivo.
- Una correccion posterior de monto aprobado puede hacer que una campana `COMPLETED` vuelva a `ACTIVE` si deja de alcanzar el objetivo.
- `/quiero-ser-parte` muestra la campana `ACTIVE`; si no hay activa, muestra la ultima `COMPLETED`.
- `/campanas-dea` lista campanas `ACTIVE` y `COMPLETED`, excluyendo `ARCHIVED`.

Actualmente el progreso se calcula desde `getApprovedDonationTotal(campaignId)` y `calculateCampaignProgress`:

- `approvedTotal = suma de Donation.amount donde status = APPROVED`.
- `percentage = approvedTotal / goalAmount * 100`.
- `visualPercentage = min(percentage, 100)`.
- `isCompleted = approvedTotal >= goalAmount`.

Este comportamiento debe conservarse para donaciones directas.

## Decision principal

Agregar un registro simple de transferencias de excedente, separado de `Donation`.

No conviene representar el excedente como una donacion anonima artificial porque:

- Mezclaria donaciones reales de personas con movimientos internos.
- El listado publico de donantes podria mostrar transferencias como si fueran donantes.
- Seria menos claro para administracion distinguir que monto vino de aportes directos y que monto vino de una campana anterior.

Tampoco conviene implementar una capa contable con estados, reversas, snapshots y compensaciones. Para este proyecto alcanza con registrar:

- campana origen;
- campana destino, si ya existe;
- monto excedente;
- fecha de aplicacion.

La campana origen debe seguir mostrando el total historico real recibido. Si una campana tenia objetivo de `$2.000.000` y recibio `$2.150.000`, debe mostrarse que recibio `$2.150.000`. Abajo se informa que `$150.000` fueron transferidos a la siguiente campana.

La campana destino si debe sumar el excedente recibido a su progreso, porque ese dinero esta disponible para cumplir su objetivo.

## Concepto de "campana siguiente"

Con el modelo actual, "campana siguiente" se define como la proxima campana `ACTIVE` creada despues de que la campana origen quedo completada o alcanzo su objetivo.

Justificacion:

- Solo puede existir una campana activa.
- No hay cola de campanas futuras, `sequenceNumber`, `nextCampaignId` ni campanas programadas.
- El flujo actual ya fuerza a completar o archivar una campana antes de crear otra activa.
- Para pocas campanas por ano, una regla temporal simple es suficiente.

Regla propuesta:

- Si una campana supera su objetivo y todavia no existe siguiente campana activa, se guarda una transferencia sin destino.
- Cuando se crea la proxima campana activa, se asignan a esa campana los excedentes pendientes anteriores.
- Si por algun flujo administrativo ya existiera una campana activa distinta y elegible, el excedente se aplica en la misma transaccion.

No se agregan campos de orden manual en v1.

## Modelo de datos propuesto

Agregar un modelo minimo:

```prisma
model DonationCampaignTransfer {
  id               Int      @id @default(autoincrement())
  sourceCampaignId Int
  targetCampaignId Int?
  amount           Decimal  @db.Decimal(14, 2)
  appliedAt        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  sourceCampaign DonationCampaign  @relation("TransferSource", fields: [sourceCampaignId], references: [id], onDelete: Restrict)
  targetCampaign DonationCampaign? @relation("TransferTarget", fields: [targetCampaignId], references: [id], onDelete: Restrict)

  @@unique([sourceCampaignId])
  @@index([targetCampaignId])
}
```

Agregar relaciones en `DonationCampaign`:

```prisma
outgoingTransfer DonationCampaignTransfer?  @relation("TransferSource")
incomingTransfers DonationCampaignTransfer[] @relation("TransferTarget")
```

Semantica:

- `targetCampaignId = null`: excedente detectado, pendiente de la proxima campana.
- `targetCampaignId != null`: excedente aplicado a una campana destino.
- `appliedAt`: fecha en que se asigno a destino.
- `amount`: monto actual del excedente.

No se agrega enum de estado. El estado se deriva de si tiene destino.

Restricciones recomendadas en SQL:

- `CHECK ("amount" >= 0)`.
- `CHECK ("sourceCampaignId" <> "targetCampaignId")` cuando `targetCampaignId IS NOT NULL`.
- `UNIQUE ("sourceCampaignId")`, para que una campana origen tenga como maximo un registro de excedente.

Se permite `amount = 0` para simplificar correcciones historicas cuando el excedente aplicado baja a cero. Si se prefiere no conservar esos registros, el servicio puede borrar transferencias de monto cero cuando no tienen destino.

## Calculo de progreso

### Campana origen

La campana origen conserva el criterio actual:

```txt
approvedTotal = donaciones aprobadas propias
percentage = approvedTotal / goalAmount * 100
visualPercentage = min(percentage, 100)
```

No se resta la transferencia saliente.

Motivo: historicamente la campana recibio ese dinero. La interfaz debe reflejar el total real recibido y aclarar que el excedente se aplico a otra campana.

Ejemplo publico:

```txt
Recaudado: $2.150.000
Objetivo: $2.000.000
Avance: 100%
Excedente transferido a la siguiente campana: $150.000
```

### Campana destino

La campana destino suma donaciones propias aprobadas y transferencias entrantes:

```txt
approvedTotal = donaciones aprobadas propias + transferencias entrantes
percentage = approvedTotal / goalAmount * 100
visualPercentage = min(percentage, 100)
```

Debe informarse que parte del avance puede venir de una campana anterior.

Ejemplo publico:

```txt
Recaudado: $350.000
Incluye $150.000 transferidos desde una campana anterior.
```

### Donantes publicos

Las transferencias no deben aparecer en el listado de donantes.

El listado publico sigue mostrando solo donaciones reales `APPROVED`, con nombre publico o "Anonimo", monto y fecha.

## Deteccion y actualizacion del excedente

Crear un servicio central simple, por ejemplo `syncCampaignOverflow(campaignId, tx)`.

Debe ejecutarse dentro de la misma transaccion cuando cambian datos que afectan el excedente:

- `approveDonation`
- `updateApprovedDonationAmount`
- `reopenDonationReview`
- `updateActiveDonationCampaign`, cuando cambia `goalAmount`
- `markDonationCampaignCompleted`
- `createDonationCampaign`, para aplicar excedentes pendientes

La regla de calculo es:

```txt
overflow = max(directApprovedTotal - goalAmount, 0)
```

Donde `directApprovedTotal` es solo la suma de donaciones aprobadas propias de la campana origen. Las transferencias entrantes de una campana no deben generar una transferencia saliente nueva en v1, salvo que el negocio pida encadenar excedentes automaticamente. Esta decision evita cascadas innecesarias.

### Flujo al aprobar o corregir una donacion

1. Guardar el cambio de donacion.
2. Recalcular `directApprovedTotal`.
3. Completar o reabrir la campana segun la regla actual.
4. Calcular `overflow`.
5. Buscar transferencia existente por `sourceCampaignId`.
6. Si `overflow > 0`:
   - crear o actualizar la transferencia;
   - si existe campana siguiente, asignar `targetCampaignId` y `appliedAt`;
   - si no existe, dejar `targetCampaignId = null`.
7. Si `overflow = 0`:
   - si la transferencia no tenia destino, borrarla;
   - si ya tenia destino, actualizar `amount = 0` o borrar segun decision de implementacion; default recomendado: conservarla con `amount = 0` si ya fue visible en admin, para evitar que desaparezca historial operativo.

No se bloquean correcciones con 409 por afectar excedentes. El sistema recalcula y actualiza el registro. Dado el bajo volumen, si alguna correccion genera una situacion confusa, el administrador puede verla y resolverla manualmente en datos.

### Flujo al crear nueva campana

1. Crear la campana `ACTIVE` dentro de transaccion.
2. Buscar transferencias pendientes (`targetCampaignId = null`) de campanas anteriores, ordenadas por `createdAt ASC`.
3. Asignarlas a la nueva campana con `targetCampaignId = nuevaCampana.id` y `appliedAt = now`.
4. Recalcular progreso de la nueva campana incluyendo transferencias entrantes.
5. Si las transferencias entrantes ya hacen que la campana alcance el objetivo, marcarla `COMPLETED`.

No se genera una cadena automatica de excedentes por transferencias entrantes en v1. Si una campana nueva nace completada por excedentes previos, quedara completada y se podra crear otra campana despues; el excedente remanente se revisara administrativamente si aparece.

## Correcciones posteriores

Las correcciones deben seguir siendo simples.

### Si aumenta una donacion aprobada

- Se recalcula el excedente.
- Se actualiza la transferencia existente o se crea una nueva.
- Si ya habia destino, el monto transferido aumenta.
- El progreso de la campana destino aumenta porque suma transferencias entrantes.

### Si baja una donacion aprobada

- Se recalcula el excedente.
- Se reduce el monto de la transferencia.
- Si queda en cero, se elimina si estaba pendiente o se conserva con monto cero si ya estaba aplicada.
- El progreso de la campana destino baja si dependia de esa transferencia.

Este comportamiento es aceptable para el contexto del proyecto. La correccion refleja que el monto aprobado anterior era incorrecto.

### Si se reabre una donacion aprobada

Reabrir una donacion aprobada equivale a quitar temporalmente ese monto del total.

- Se recalcula el excedente.
- Se actualiza la transferencia.
- La campana puede volver a `ACTIVE` si deja de alcanzar el objetivo, respetando el comportamiento actual.

No se agregan reversas ni compensaciones.

## Restricciones por estado

### `ACTIVE`

- Acepta donaciones.
- Puede recibir transferencias entrantes.
- Puede generar excedente por donaciones propias aprobadas.
- Puede completarse automaticamente.
- Puede editarse con las reglas actuales.

### `COMPLETED`

- No acepta nuevas donaciones publicas.
- Puede tener excedente pendiente o aplicado.
- Sigue mostrando total historico real recibido.
- Puede cambiar a `ACTIVE` si correcciones posteriores hacen que deje de alcanzar el objetivo, como ocurre hoy.

### `ARCHIVED`

- No acepta donaciones.
- No debe recibir transferencias nuevas como destino.
- Si una campana origen archivada ya tenia excedente registrado, conservar el registro.
- Si una transferencia pendiente apunta a una campana origen archivada, se puede aplicar igualmente a la siguiente campana si el excedente existe; archivar no borra historia.

## Impacto en servicios y APIs

### Servicios

Agregar un helper/servicio en `src/libs/donations`, por ejemplo `campaignTransferService.ts`, con responsabilidades acotadas:

- Calcular donaciones aprobadas propias.
- Calcular transferencias entrantes.
- Sincronizar el excedente saliente de una campana.
- Aplicar transferencias pendientes a una nueva campana.
- Obtener un resumen simple para serializar en APIs.

Actualizar `campaignService`:

- `getCampaignProgress` debe poder incluir transferencias entrantes para campanas destino.
- `createDonationCampaign` debe aplicar transferencias pendientes despues de crear la nueva activa.
- `updateActiveDonationCampaign` debe sincronizar excedente si cambia el objetivo.

Actualizar `donationService`:

- `approveDonation`, `updateApprovedDonationAmount` y `reopenDonationReview` deben llamar a la sincronizacion de excedente despues de cambiar montos.

### APIs publicas

Extender `GET /api/donation-campaigns/current` y `GET /api/donation-campaigns` con campos seguros:

- `approvedTotal`: total mostrado como recaudado, incluyendo transferencias entrantes si corresponde.
- `directApprovedTotal`: donaciones propias aprobadas.
- `incomingTransferTotal`: transferencias recibidas.
- `outgoingTransferAmount`: excedente enviado desde esta campana, si existe.
- `hasIncomingTransfers`
- `hasOutgoingTransfer`

No exponer metadata interna innecesaria ni comprobantes.

### APIs administrativas

Extender respuestas de campanas con un resumen:

```ts
funds: {
  directApprovedTotal: string;
  incomingTransferTotal: string;
  approvedTotal: string;
  outgoingTransferAmount: string;
  outgoingTransferTargetCampaignId: number | null;
  pendingOutgoingTransfer: boolean;
}
```

No hace falta crear una pantalla contable global en v1. Si se necesita detalle, alcanza con incluir origen, destino y monto en el dashboard de campanas.

## Impacto en interfaz publica

Agregar aclaraciones visibles y concretas.

En `/quiero-ser-parte`, antes del CTA o junto al progreso:

```txt
Si la campana supera su objetivo, el excedente sera aplicado automaticamente a la proxima campana DEA.
```

En el modal:

```txt
El monto se confirma al revisar el comprobante. Si el objetivo ya fue superado, el excedente se destinara a la proxima campana.
```

En campana completada con excedente:

```txt
Esta campana recibio $X. Se transfirieron $Y de excedente a la siguiente campana.
```

En campana con fondos recibidos:

```txt
Incluye $Y transferidos desde una campana anterior.
```

## Impacto en dashboard administrador

En `DonationCampaignDashboard`, mostrar informacion suficiente sin crear una contabilidad completa:

- Total de donaciones aprobadas propias.
- Transferencias recibidas.
- Total mostrado/progreso.
- Excedente enviado.
- Destino del excedente si ya se aplico.
- Aviso de excedente pendiente si no existe campana siguiente.

Al crear una nueva campana y existir excedente pendiente, mostrar toast o aviso:

```txt
Se aplicaron fondos excedentes de campanas anteriores a esta nueva campana.
```

Al corregir montos, el mensaje debe indicar que tambien se actualizara cualquier excedente asociado.

## Consistencia, concurrencia y duplicados

Aunque el volumen sea bajo, las operaciones deben ser consistentes.

Riesgos:

- Dos administradores aprueban donaciones al mismo tiempo.
- Dos requests intentan crear o actualizar la transferencia de la misma campana origen.
- Una campana nueva se crea mientras existe excedente pendiente.
- Una correccion posterior cambia el excedente ya aplicado.

Mitigaciones:

- Mantener aprobaciones, correcciones, reaperturas y creacion de campanas dentro de transacciones.
- Usar `@@unique([sourceCampaignId])` para impedir duplicados por campana origen.
- Implementar sincronizacion como upsert por `sourceCampaignId`.
- Recalcular siempre desde la base dentro de la transaccion.
- No confiar en totales enviados por cliente.
- Usar `Decimal` o strings normalizados; no usar floats para decisiones de dinero.
- Revalidar cache de campana origen, campana destino, `/quiero-ser-parte`, `/campanas-dea` y endpoints publicos relacionados.

Si en pruebas aparecen carreras reales que Prisma no resuelve con upsert e indice unico, se puede agregar bloqueo puntual con SQL (`SELECT ... FOR UPDATE`) sobre la campana origen. No hacerlo de entrada.

## Edge cases

- Donacion alcanza exactamente el objetivo: no se crea transferencia.
- Donacion supera el objetivo y no hay siguiente campana: se crea transferencia pendiente.
- Se crea nueva campana con transferencia pendiente: se asigna automaticamente.
- Correccion aumenta excedente: se actualiza monto.
- Correccion baja excedente: se actualiza monto.
- Correccion elimina excedente: se borra si estaba pendiente o se conserva aplicada con monto cero.
- Reapertura de donacion aprobada: recalcula campana y transferencia.
- Campana origen muestra siempre lo recibido realmente por donaciones propias.
- Campana destino suma transferencias recibidas.
- Transferencias no aparecen en listado de donantes.
- Campana `ARCHIVED` no recibe transferencias nuevas.
- Si una transferencia pendiente existe y no hay campana siguiente, queda visible en admin.
- Si varias campanas anteriores tienen excedentes pendientes, se aplican a la nueva campana en orden de creacion.

## Migracion y compatibilidad

Migracion:

1. Agregar `DonationCampaignTransfer`.
2. Agregar relaciones en `DonationCampaign`.
3. Agregar indices y checks necesarios.
4. Ejecutar `npx prisma generate`.

Datos existentes:

- No retroaplicar excedentes historicos automaticamente.
- La regla aplica hacia adelante desde la implementacion.
- Si el cliente quiere transferir excedentes de campanas ya completadas antes de informar esta regla, hacerlo con una accion/script administrativo revisado caso por caso.

## Fases de implementacion recomendadas

### Fase 1: Modelo y helpers

- Agregar modelo y migracion.
- Crear helpers para calcular donaciones propias, transferencias entrantes y excedente.
- Agregar tests unitarios.

### Fase 2: Servicios

- Implementar sincronizacion de excedente.
- Integrarla en aprobacion, correccion, reapertura, edicion de objetivo y creacion de campana.
- Mantener la logica dentro de transacciones.

### Fase 3: APIs

- Extender serializacion publica y admin con resumen de fondos.
- Mantener privadas las metadata internas.

### Fase 4: UI

- Agregar avisos publicos.
- Mostrar excedente enviado/recibido en campanas.
- Agregar resumen simple en dashboard.

### Fase 5: Validacion

- Tests de dominio y servicios.
- Tests de APIs publicas/admin.
- `npm run build`.
- Revision manual de `/quiero-ser-parte`, `/campanas-dea` y dashboard.

## Pruebas necesarias

Unitarias:

- Progreso sin transferencias.
- Progreso con transferencia entrante.
- Campana origen con excedente mantiene total real recibido.
- Calculo de excedente en cero, exacto y positivo.

Servicios:

- Aprobar donacion que no alcanza objetivo.
- Aprobar donacion que alcanza exacto.
- Aprobar donacion que supera objetivo sin destino.
- Crear nueva campana y aplicar pendiente.
- Corregir monto hacia arriba.
- Corregir monto hacia abajo.
- Reabrir aprobada.
- Evitar duplicados con upsert e indice unico.

APIs/UI:

- APIs publicas no exponen comprobantes ni emails.
- Transferencias no aparecen como donantes.
- `/quiero-ser-parte` informa la regla del excedente antes de donar.
- `/campanas-dea` muestra fondos transferidos de forma clara.
- Dashboard muestra excedente pendiente, enviado y recibido.

## Criterios de aceptacion

- Una campana que supera objetivo genera un excedente trazable.
- Si no existe campana siguiente, el excedente queda pendiente.
- Al crear la siguiente campana, el excedente se aplica automaticamente.
- La campana origen sigue mostrando el total historico real recibido.
- La campana destino suma transferencias recibidas al progreso.
- No se crean donaciones artificiales.
- No se generan transferencias duplicadas.
- Las correcciones posteriores recalculan el excedente sin bloquear innecesariamente al administrador.
- La UI publica informa claramente la regla antes de donar.
- El dashboard muestra la informacion suficiente para entender origen, destino y monto.
- `npm run build` pasa.
