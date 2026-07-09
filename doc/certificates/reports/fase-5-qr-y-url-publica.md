# Reporte fase 5: QR y URL publica

Fecha: 2026-07-08

## Alcance ejecutado

- Se agrego la dependencia `qrcode`.
- Se agregaron tipos de TypeScript para `qrcode`.
- Se agrego helper para generar QR como data URL.
- Se agrego `NEXT_PUBLIC_APP_URL` a `.env.example`.
- Se actualizo el preview de certificados para:
  - mantener placeholder `Disponible al guardar` en creacion.
  - generar QR real en edicion cuando ya existe `publicId` y `publicUrl`.
- Se creo la API publica `GET /api/certificates/validate/[publicId]`.
- Se creo la pagina publica `/certificado/validar/[publicId]`.
- La pagina publica renderiza el certificado activo con QR real.
- La pagina publica muestra estado desactivado para certificados con `status = DELETED`.

## Archivos modificados o agregados

- `package.json`
- `package-lock.json`
- `.env.example`
- `src/libs/certificates/generateCertificateQrDataUrl.ts`
- `src/libs/certificates/index.ts`
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/app/api/certificates/validate/[publicId]/route.ts`
- `src/app/(front)/certificado/validar/[publicId]/page.tsx`

## Detalles tecnicos

- El QR apunta a la URL publica:
  - `${APP_URL}/certificado/validar/${publicId}` en servidor.
  - La configuracion documenta tambien `NEXT_PUBLIC_APP_URL` para cliente.
- En modo creacion no se genera QR ni `publicId` temporal.
- En modo edicion, el dashboard usa la `publicUrl` persistida devuelta por la API administrativa.
- La API publica no requiere sesion.
- La API publica no expone `id`, `userId`, email ni metadatos internos.
- Certificado inexistente devuelve `404`.
- Certificado eliminado devuelve `410 Gone` en la API publica.
- La pagina publica usa `notFound()` cuando el `publicId` no existe.
- La pagina publica de certificado eliminado no muestra QR activo ni descarga.

## Verificacion

- `npm install qrcode @types/qrcode`: exitoso.
- `npm run build`: exitoso.
- Next detecto las rutas nuevas:
  - `/api/certificates/validate/[publicId]`
  - `/certificado/validar/[publicId]`

## Observaciones

- `npm install` reporto vulnerabilidades existentes en el arbol de dependencias: 7 moderadas y 8 altas. No se ejecuto `npm audit fix` porque puede cambiar dependencias fuera del alcance de fase 5.
- El primer intento de `npm run build` fallo dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado y compilo correctamente.
- El build mantiene la advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No fue introducida por esta fase y no bloquea la compilacion.
- Se intento iniciar el dev server en segundo plano, pero el wrapper de comandos de esta sesion no dejo un proceso escuchando en `localhost:3000`. La verificacion principal quedo cubierta por build exitoso.
- No se implemento PDF ni endpoint de descarga PDF. Eso corresponde a fase 7.
- No se modifico el perfil de usuario. Eso corresponde a fase 6.

## Criterio de salida

- [x] En creacion, el preview no inventa `publicId` ni URL temporal.
- [x] En edicion, el QR apunta a URL publica con `publicId`.
- [x] La vista publica renderiza el certificado activo.
- [x] `publicId` invalido muestra estado correcto mediante 404.
- [x] Certificado eliminado muestra estado desactivado.
- [x] `npm run build` compila.
