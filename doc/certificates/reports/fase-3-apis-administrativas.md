# Reporte fase 3: APIs administrativas

Fecha: 2026-07-08

## Alcance ejecutado

- Se implemento `GET /api/certificates`.
- Se implemento `POST /api/certificates`.
- Se implemento `GET /api/certificates/[publicId]`.
- Se implemento `PUT /api/certificates/[publicId]`.
- Se implemento `DELETE /api/certificates/[publicId]`.
- Todos los endpoints administrativos usan `requireAdminSession()`.
- Se agrego paginacion y busqueda basica al listado.
- Se agrego validacion de payload usando el helper de fase 2.
- Se agrego manejo de duplicados para `serialNumber`.
- La eliminacion es soft delete con `status = DELETED`, `deletedAt = now()` y `userId = null`.

## Archivos modificados o agregados

- `src/app/api/certificates/route.ts`
- `src/app/api/certificates/[publicId]/route.ts`

## Endpoints implementados

### `GET /api/certificates`

- Requiere admin.
- Query params soportados:
  - `search`
  - `email`
  - `dni`
  - `serialNumber`
  - `status`
  - `page`
  - `pageSize`
- Devuelve certificados paginados, total, pagina actual, total de paginas y `publicUrl`.

### `POST /api/certificates`

- Requiere admin.
- Valida campos obligatorios, email, fecha, `clarificationText <= 300` y `serialNumber`.
- Normaliza email en servidor.
- Genera `publicId` seguro y no secuencial.
- Busca usuario por email normalizado y completa `userId` si existe.
- Devuelve `409` si `serialNumber` ya existe.

### `GET /api/certificates/[publicId]`

- Requiere admin.
- Busca por `publicId`, no por ID interno.
- Devuelve `404` si no existe.

### `PUT /api/certificates/[publicId]`

- Requiere admin.
- Valida payload completo.
- No cambia `publicId`.
- Permite editar `serialNumber` si no duplica otro certificado.
- Si cambia el email, recalcula `recipientEmailNormalized` y reasocia `userId`.

### `DELETE /api/certificates/[publicId]`

- Requiere admin.
- Hace soft delete.
- Devuelve `404` si no existe.

## Verificacion

- `npm run build`: exitoso.
- Next detecto las rutas nuevas:
  - `/api/certificates`
  - `/api/certificates/[publicId]`

## Observaciones

- El primer intento de `npm run build` fallo dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado y compilo correctamente.
- El build mantiene la advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No fue introducida por esta fase y no bloquea la compilacion.
- No se implemento UI de dashboard ni preview. Eso corresponde a fase 4.
- No se implementaron endpoints publicos, QR, perfil ni PDF. Eso corresponde a fases posteriores.

## Criterio de salida

- [x] Admin puede crear certificados por API.
- [x] Admin puede listar certificados por API.
- [x] Admin puede obtener detalle por API.
- [x] Admin puede editar certificados por API.
- [x] Admin puede eliminar certificados con soft delete por API.
- [x] Las APIs administrativas llaman `requireAdminSession()`.
- [x] Se maneja `serialNumber` duplicado con respuesta clara.
- [x] `npm run build` compila.
