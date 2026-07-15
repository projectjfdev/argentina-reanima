# Reporte: Fase 1 - Modelo, migracion y compatibilidad

## Objetivo ejecutado

Se ejecuto solamente la Fase 1 del plan de plantillas seleccionables para certificados. El alcance fue agregar persistencia para la plantilla elegida, crear la migracion correspondiente y regenerar/validar Prisma Client.

No se avanzo sobre validaciones de payload, endpoints, UI, preview ni creacion masiva. Eso corresponde a fases posteriores.

## Cambios realizados

- Se agrego el campo `templateKey` al modelo `Certificate`.
- Se definio `template_1` como valor por defecto para mantener el comportamiento actual.
- Se limito el campo a `VARCHAR(40)`.
- Se creo una migracion nueva para agregar la columna en base de datos.
- Se regenero Prisma Client con `npx prisma generate`.
- Se valido el schema con `npx prisma validate`.

## Archivos creados

- `prisma/migrations/20260715120000_certificate_template_key/migration.sql`

## Archivos modificados

- `prisma/schema.prisma`

## Detalle tecnico

Campo agregado en `Certificate`:

```prisma
templateKey String @default("template_1") @db.VarChar(40)
```

Migracion creada:

```sql
ALTER TABLE "Certificate"
  ADD COLUMN "templateKey" VARCHAR(40) NOT NULL DEFAULT 'template_1';
```

## Verificacion

- `npx prisma generate`: ejecutado correctamente.
- `npx prisma validate`: ejecutado correctamente.
- Se confirmo que el cliente generado incluye `templateKey`.

Nota: los comandos de Prisma requirieron ejecucion fuera del sandbox por un error de permisos `EPERM` al resolver `C:\Users\PC Franco` dentro del entorno restringido.

## Estado final

La Fase 1 queda completa. La base del modelo ya permite persistir una plantilla por certificado, pero todavia no hay logica de validacion, seleccion en UI, propagacion en APIs ni render dinamico de plantillas.
