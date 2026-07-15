# Reporte: Fase 3 - Propagacion en APIs y consultas

## Objetivo ejecutado

Se ejecuto la Fase 3 del plan `doc/certificates/plan/plantillas-seleccionables-certificado.md`.

El objetivo fue propagar `templateKey` por los puntos de persistencia y consulta que alimentan el flujo de certificados, sin avanzar sobre UI ni render dinamico en `CertificatePreview`.

## Cambios realizados

- Se confirmo que la creacion y edicion individual ya quedan preparadas para persistir `templateKey` porque `POST /api/certificates` y `PUT /api/certificates/[publicId]` guardan `...validation.data`.
- Se agrego `templateKey` al `create` efectivo de certificados masivos.
- Se agrego `templateKey` a la API publica de validacion.
- Se agrego `templateKey` a la consulta server-side de la pagina publica de validacion.
- Se agrego `templateKey` a la API de certificados del usuario autenticado.
- Se agrego `templateKey` a la consulta server-side del perfil.

## Archivos modificados

- `src/app/api/certificates/bulk/route.ts`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/api/me/certificates/route.ts`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`
- `src/app/(front)/mi-perfil/page.tsx`

## Detalle tecnico

### Creacion masiva

Se agrego el campo persistido en cada certificado creado desde Excel:

```ts
templateKey: sharedData.data.templateKey,
```

Esto usa el valor ya validado en Fase 2 dentro de `validateBulkSharedPayload`.

### API publica de validacion

Se agrego `templateKey: true` al `select` de:

```ts
GET /api/certificates/validate/[publicId]
```

### Pagina publica de validacion

Se agrego `templateKey: true` al `select` de:

```ts
/certificado/validar/[publicId]
```

### Certificados del usuario

Se agrego `templateKey: true` al `select` de:

```ts
GET /api/me/certificates
```

### Perfil

Se agrego `templateKey: true` al `select` server-side de:

```ts
/mi-perfil
```

## Verificacion

Se ejecutaron:

```bash
npm run test:run -- src/test/certificates
```

Resultado:

- 5 archivos de test pasaron.
- 15 tests pasaron.

Tambien se ejecuto:

```bash
npm run build
```

Resultado:

- Build exitoso.
- TypeScript paso correctamente.
- Persistio un warning existente de Turbopack/NFT relacionado con `next.config.ts`, Prisma y `src/app/api/news/[id]/route.ts`. No bloqueo el build.

## Estado final

La Fase 3 queda completa.

`templateKey` ya se persiste en creacion individual, edicion individual y creacion masiva, y viaja en las consultas que alimentan API publica, pagina publica y datos del usuario.

Todavia no se avanzo sobre:

- selector de plantilla en dashboard;
- carga de `templateKey` en el formulario administrativo;
- render dinamico de la plantilla en `CertificatePreview`;
- descarga PNG usando la plantilla elegida.
