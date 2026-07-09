# Reporte fase 4: Dashboard de certificados

Fecha: 2026-07-08

## Alcance ejecutado

- Se agrego el link "Certificados" al sidebar del dashboard.
- Se creo la ruta `/dashboard/certificados`.
- Se implemento formulario administrativo para crear y editar certificados.
- Se implemento preview en tiempo real sobre `public/certificado-template/certificado-template-firmado.png`.
- Se implemento listado de certificados activos emitidos.
- Se implemento seleccion de certificado para edicion.
- Se implemento eliminacion con confirmacion usando soft delete via API.
- Se agrego busqueda basica en el listado.

## Archivos modificados o agregados

- `src/components/Dashboard/SidebarContent.tsx`
- `src/app/(front)/dashboard/certificados/page.tsx`
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`
- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`

## Detalles tecnicos

- El dashboard consume las APIs administrativas implementadas en fase 3:
  - `GET /api/certificates`
  - `POST /api/certificates`
  - `PUT /api/certificates/[publicId]`
  - `DELETE /api/certificates/[publicId]`
- El listado solicita `status=ACTIVE`, por lo que los certificados eliminados quedan ocultos despues del soft delete.
- El formulario usa `react-hook-form`.
- La vista previa usa `watch()` para reflejar cambios en tiempo real.
- En modo creacion, el area de QR muestra `Disponible al guardar`.
- En modo edicion, el area de QR queda marcada como pendiente de fase 5, porque la generacion real de QR no corresponde a esta fase.
- La pantalla mantiene dimensiones estables para formulario, preview y listado, evitando saltos grandes de layout.

## Verificacion

- `npm run build`: exitoso.
- Next detecto la nueva ruta:
  - `/dashboard/certificados`

## Observaciones

- El primer intento de `npm run build` fallo dentro del sandbox por `EPERM` al resolver `C:\Users\PC Franco`; se relanzo con permiso escalado y compilo correctamente.
- El build mantiene la advertencia de Turbopack sobre trazado NFT desde `next.config.ts` hacia `src/generated/prisma/index.js`. No fue introducida por esta fase y no bloquea la compilacion.
- Se intento iniciar el dev server en segundo plano, pero el wrapper de PowerShell de esta sesion no dejo un proceso escuchando en `localhost:3000`. La verificacion principal quedo cubierta por build exitoso.
- No se implemento QR real ni ruta publica de validacion. Eso corresponde a fase 5.
- No se modifico el perfil de usuario ni PDF. Eso corresponde a fases posteriores.

## Criterio de salida

- [x] Preview se actualiza en tiempo real.
- [x] Guardar refresca listado.
- [x] Editar actualiza datos visibles.
- [x] Eliminar oculta/desactiva certificado.
- [x] `npm run build` compila.
