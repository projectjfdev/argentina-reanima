# Reporte fase 6: Perfil de usuario

Fecha: 2026-07-08

## Alcance ejecutado

- Se reemplazo el estado vacio fijo de "Mis certificados" en `/mi-perfil`.
- Se agrego consulta server-side de certificados activos asociados a la sesion.
- Se agrego endpoint autenticado `GET /api/me/certificates`.
- Se listan certificados por:
  - `recipientEmailNormalized = session.user.email` normalizado.
  - o `userId = session.user.id`.
- Cada certificado en el perfil linkea a `/certificado/validar/[publicId]`.
- Se mantiene el estado vacio cuando el usuario no tiene certificados.
- Se excluyen certificados eliminados mediante `status = ACTIVE`.

## Archivos modificados o agregados

- `src/app/(front)/mi-perfil/page.tsx`
- `src/app/api/me/certificates/route.ts`

## Detalles tecnicos

- El perfil sigue requiriendo sesion con `getServerSession(authOptions)`.
- La consulta no acepta email por query params ni por datos del cliente.
- El email se normaliza con `normalizeCertificateEmail`.
- El endpoint `/api/me/certificates` devuelve solo campos necesarios:
  - `publicId`
  - `recipientName`
  - `courseName`
  - `issuedDate`
  - `duration`
  - `serialNumber`
  - `status`
- No se exponen `id`, `userId` ni metadatos internos.
- La busqueda por email y por `userId` evita depender exclusivamente de una sola vinculacion.

## Verificacion

- `npm run build`: exitoso.
- Next detecto la ruta nueva:
  - `/api/me/certificates`

## Observaciones

- El primer intento de `npm run build` fallo dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado y compilo correctamente.
- El build mantiene la advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No fue introducida por esta fase y no bloquea la compilacion.
- No se implemento PDF. Eso corresponde a fase 7.
- No se ejecuto hardening final completo. Eso corresponde a fase 8.

## Criterio de salida

- [x] Usuario ve solo certificados de su email y/o usuario.
- [x] Certificados creados antes del registro pueden aparecer por email normalizado.
- [x] Certificados eliminados no aparecen.
- [x] El perfil no permite consultar certificados de otro usuario por query params.
- [x] `npm run build` compila.
