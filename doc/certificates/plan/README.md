# Plan de implementacion de certificados

## Objetivo

Implementar un sistema de certificados para Argentina Reanima donde el administrador pueda emitir, previsualizar, editar, eliminar y publicar certificados validables por URL publica, asociados a usuarios por email aunque la cuenta todavia no exista.

La implementacion debe partir de la plantilla visual `public/certificado-template/certificado-template-firmado.png`. La plantilla no contiene textos finales: todos los datos variables, incluido el QR, deben renderizarse desde programacion usando datos persistidos.

## Estado actual detectado

- Proyecto Next.js App Router con TypeScript, React 19, Tailwind CSS 4 y Prisma.
- Base de datos PostgreSQL configurada en `prisma/schema.prisma`.
- Prisma Client generado en `src/generated/prisma` y helper compartido en `src/libs/db.ts`.
- Auth V2 ya existe con NextAuth, JWT sessions y roles `ADMIN` / `USER`.
- `User.email` es unico y ya se normaliza con `trim().toLowerCase()` en registro por credenciales y login con Google.
- El dashboard esta protegido por:
  - `src/app/(front)/dashboard/layout.tsx`, que redirige si no hay sesion o si el rol no es `ADMIN`.
  - `src/proxy.ts`, con matcher `/dashboard/:path*`.
  - `src/libs/auth/requireAdminSession.ts`, usado por APIs administrativas.
- El dashboard usa `SidebarContent` y ya tiene secciones para noticias y cursos.
- El perfil `src/app/(front)/mi-perfil/page.tsx` ya muestra datos del usuario y una seccion visual "Mis certificados", actualmente vacia.
- No hay test runner configurado. La verificacion minima del proyecto es `npm run build`.
- No existen dependencias especificas para QR o PDF en `package.json`.

## Decisiones principales propuestas

- Usar el email normalizado como clave funcional de asociacion: `recipientEmailNormalized`.
- Mantener `userId` como relacion opcional para optimizar consultas y reflejar vinculacion, pero no depender solo de `userId`.
- Crear un `publicId` unico, seguro y no secuencial para URLs publicas y QR.
- Usar soft delete por defecto para certificados: conserva trazabilidad y permite mostrar una pagina publica de certificado desactivado sin romper validaciones historicas.
- Generar PDF bajo demanda desde datos persistidos, plantilla base y QR. No guardar una imagen manual del certificado como fuente de verdad.
- Centralizar el layout del certificado en una funcion/componente reutilizable para que preview, vista publica y PDF no diverjan.

## Modelo de datos propuesto

Agregar un modelo `Certificate` en Prisma:

```prisma
enum CertificateStatus {
  ACTIVE
  DELETED
}

model Certificate {
  id                       Int               @id @default(autoincrement())
  publicId                 String            @unique
  recipientName            String
  recipientEmail           String
  recipientEmailNormalized String
  recipientDni             String
  courseName               String
  location                 String
  issuedDate               DateTime
  duration                 String
  clarificationText        String            @db.VarChar(300)
  serialNumber             String            @unique
  status                   CertificateStatus @default(ACTIVE)
  userId                   Int?
  createdAt                DateTime          @default(now())
  updatedAt                DateTime          @updatedAt
  deletedAt                DateTime?

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([recipientEmailNormalized])
  @@index([recipientDni])
  @@index([userId])
  @@index([status])
}
```

Actualizar `User`:

```prisma
certificates Certificate[]
```

Notas:

- `serialNumber` deberia ser unico para evitar duplicacion administrativa.
- `recipientDni` no deberia ser unico inicialmente: una misma persona puede tener mas de un certificado. Conviene indexarlo para busqueda.
- `recipientEmail` conserva el valor visible ingresado o corregido.
- `recipientEmailNormalized` es la clave de vinculacion y consulta.
- Si mas adelante se necesita auditoria fuerte, agregar `createdById`, `updatedById` y `deletedById`.

## Rutas sugeridas

### Dashboard administrativo

- `/dashboard/certificados`
  - listado, filtros, formulario de creacion/edicion y preview.
- Opcional si se prefiere separar pantallas:
  - `/dashboard/certificados/nuevo`
  - `/dashboard/certificados/[publicId]/editar`

Recomendacion inicial: una sola ruta `/dashboard/certificados`, siguiendo el patron actual de cursos/noticias con formulario y listado en la misma vista.

### Perfil de usuario

- Mantener `/mi-perfil`.
- Reemplazar el estado vacio de "Mis certificados" por una consulta server-side o componente que cargue certificados activos asociados al email normalizado de la sesion.
- Cada certificado debe linkear a `/certificado/validar/[publicId]`.

### Validacion publica

- `/certificado/validar/[publicId]`
  - pagina publica, sin sesion requerida.
  - muestra certificado, datos de validacion y boton de descarga PDF.

## APIs necesarias

### Administrativas protegidas

Todas deben usar `requireAdminSession()`:

- `GET /api/certificates`
  - listado paginado.
  - filtros sugeridos: `search`, `email`, `dni`, `serialNumber`, `status`, `page`.
- `POST /api/certificates`
  - crea certificado.
  - normaliza email.
  - genera `publicId`.
  - busca usuario por email normalizado y completa `userId` si existe.
  - valida `clarificationText <= 300`.
  - valida `serialNumber` unico.
- `GET /api/certificates/[publicId]`
  - solo admin, para edicion o detalle administrativo.
- `PUT /api/certificates/[publicId]`
  - actualiza datos.
  - si cambia el email, recalcula `recipientEmailNormalized` y reasocia `userId`.
  - no cambia `publicId`.
  - no cambia `serialNumber` salvo edicion explicita y validada.
- `DELETE /api/certificates/[publicId]`
  - soft delete: `status = DELETED`, `deletedAt = now()`.

### Usuario autenticado

- `GET /api/me/certificates`
  - requiere sesion.
  - normaliza `session.user.email`.
  - devuelve certificados `ACTIVE` donde:
    - `recipientEmailNormalized = sessionEmailNormalized`, o
    - `userId = session.user.id`.
  - no permite consultar emails arbitrarios.

### Publicas

- `GET /api/certificates/validate/[publicId]`
  - publica.
  - devuelve datos minimos para validacion y render publico.
  - no expone `id`, `userId` ni metadatos internos innecesarios.
- `GET /api/certificates/validate/[publicId]/pdf`
  - publica.
  - genera y devuelve PDF.
  - si el certificado no existe: `404`.
  - si esta eliminado/desactivado: devolver estado claro, preferentemente `410 Gone` o pagina de certificado desactivado sin PDF descargable.

## Flujo de creacion administrativa

1. Admin entra a `/dashboard/certificados`.
2. Completa formulario:
   - `recipientName`
   - `recipientEmail`
   - `recipientDni`
   - `courseName`
   - `location`
   - `issuedDate`
   - `duration`
   - `clarificationText`
   - `serialNumber`
3. El formulario normaliza localmente `recipientEmail` para preview, pero la normalizacion definitiva ocurre en servidor.
4. `CertificatePreview` se actualiza en tiempo real usando `watch()` de `react-hook-form`.
5. Para preview antes de guardar:
   - no generar IDs temporales ni URLs simuladas.
   - mostrar un placeholder en el area del QR con el texto "Disponible al guardar".
   - el QR definitivo solo aparece cuando el certificado ya fue persistido y existe un `publicId` real.
6. Al enviar, `POST /api/certificates` valida datos y crea el registro.
7. El servidor genera `publicId` seguro.
8. El servidor busca `User` por email normalizado y completa `userId` si corresponde.
9. La respuesta devuelve el certificado creado y la URL publica.
10. El listado se refresca.

## Flujo de vinculacion por email

### Al crear certificado

1. Servidor calcula:
   - `recipientEmailNormalized = recipientEmail.trim().toLowerCase()`
2. Busca:
   - `prisma.user.findUnique({ where: { email: recipientEmailNormalized } })`
3. Si existe usuario:
   - guarda `userId`.
4. Si no existe:
   - guarda `userId = null`.
5. En todos los casos, el certificado queda consultable por `recipientEmailNormalized`.

### Al registrarse un usuario por credenciales

En la transaccion de registro, despues de crear el usuario:

1. Usar el email ya normalizado.
2. Ejecutar:
   - `updateMany` de certificados activos con `recipientEmailNormalized = user.email` y `userId = null`.
   - setear `userId = user.id`.
3. El perfil igualmente debe consultar por email y no solo por `userId`, para cubrir certificados creados o editados despues.

### Al registrarse o iniciar sesion con Google

En el callback `signIn` de Google:

- Si se crea un usuario nuevo, vincular certificados pendientes por email normalizado.
- Si el usuario ya existia, se puede ejecutar el mismo `updateMany` idempotente para capturar certificados creados antes de esa sesion.

Recomendacion: crear helper compartido:

```ts
linkCertificatesToUserByEmail(txOrPrisma, userId, email);
```

Debe aceptar email normalizado o normalizar internamente.

## Flujo de visualizacion en perfil

1. Usuario entra a `/mi-perfil`.
2. La pagina requiere sesion como actualmente.
3. Se obtiene `session.user.email`.
4. Se normaliza email.
5. Se consultan certificados activos asociados al email normalizado y/o `userId`.
6. Si no hay certificados, se mantiene el estado vacio actual.
7. Si hay certificados, mostrar tarjetas o tabla compacta con:
   - curso
   - fecha de emision
   - numero de serie
   - estado
   - boton "Ver certificado"
8. El boton redirige a `/certificado/validar/[publicId]`.

Seguridad: el usuario nunca debe poder pasar un email por query para ver certificados de otra persona. La consulta sale siempre de la sesion.

## Flujo de validacion publica

1. Visitante abre `/certificado/validar/[publicId]`.
2. La pagina busca certificado por `publicId`.
3. Si no existe:
   - mostrar pagina 404 o estado "Certificado no encontrado".
4. Si existe pero esta `DELETED`:
   - mostrar estado "Certificado desactivado" y no ofrecer descarga.
5. Si esta activo:
   - renderizar certificado con plantilla base.
   - mostrar bloque de validacion:
     - "Certificado emitido por Argentina Reanima"
     - nombre
     - curso
     - fecha
     - numero de serie
   - mostrar boton de descarga PDF.

La URL publica no debe revelar `id` interno ni `userId`.

## Estrategia para QR

Dependencia sugerida:

- `qrcode` para generar data URLs o buffers en servidor/cliente.

Generacion:

- El QR siempre apunta a:
  - `${PUBLIC_APP_URL}/certificado/validar/${publicId}`
- Agregar variable de entorno:
  - `NEXT_PUBLIC_APP_URL` para cliente.
  - `APP_URL` para servidor.

Reglas:

- En produccion debe usar dominio real.
- En desarrollo puede usar `http://localhost:3000`.
- No construir la URL desde `window.location` para PDF server-side.
- En modo creacion, antes de guardar, no renderizar QR real: mostrar un placeholder con "Disponible al guardar".
- En modo edicion o despues de crear, renderizar el QR real usando el `publicId` persistido.

## Estrategia para PDF

Opciones viables:

1. `@react-pdf/renderer`
   - Bueno para PDFs declarativos.
   - Puede requerir adaptar layout CSS, ya que no usa CSS web completo.
2. `pdf-lib`
   - Bueno para componer imagen de fondo, textos y QR con coordenadas exactas.
   - Recomendado si el certificado final debe calzar con una plantilla PNG.

Recomendacion inicial: `pdf-lib` + `qrcode`.

Motivos:

- La plantilla ya es una imagen base.
- El certificado requiere ubicar textos encima de forma controlada.
- Evita depender de screenshots o imagenes manuales.
- Permite generar PDF bajo demanda desde datos persistidos.

Implementacion sugerida:

- Crear un modulo puro:
  - `src/libs/certificates/renderCertificatePdf.ts`
- Entrada:
  - datos persistidos del certificado.
  - URL publica.
  - path/buffer de `public/certificado-template/certificado-template-firmado.png`.
  - QR generado desde URL publica.
- Salida:
  - `Uint8Array` o `Buffer` PDF.

Para preview web, crear un componente visual independiente:

- `src/components/Certificates/CertificatePreview.tsx`

Riesgo a controlar: que preview y PDF no queden desalineados. Para reducirlo, documentar y centralizar una "configuracion de posiciones" compartida:

- nombre
- DNI
- curso
- lugar
- fecha
- duracion
- aclaracion
- numero de serie
- QR

## Seguridad y permisos

- Dashboard:
  - mantener proteccion por layout y middleware para `/dashboard/:path*`.
- APIs admin:
  - todas las mutaciones y listados administrativos deben llamar `requireAdminSession()`.
- Perfil:
  - requiere sesion.
  - solo consulta certificados de `session.user.email` y `session.user.id`.
- Validacion publica:
  - no requiere sesion.
  - solo expone campos necesarios.
  - nunca expone `id` interno, `userId`, datos de auditoria o informacion sensible innecesaria.
- Eliminacion:
  - preferir soft delete.
  - la URL publica debe indicar desactivacion en vez de desaparecer silenciosamente.
- Validacion de input:
  - email valido y normalizado.
  - `clarificationText` maximo 300 caracteres en cliente y servidor.
  - `issuedDate` valida.
  - `serialNumber` requerido y unico.
  - strings con `trim()`.
- Evitar confiar en datos del cliente para:
  - `publicId`
  - `userId`
  - estado
  - URLs finales de QR/PDF.

## Edge cases

- Admin crea certificado para email sin cuenta:
  - se guarda con `userId = null` y `recipientEmailNormalized`.
  - aparecera al registrarse o al consultar por email.
- Usuario se registra despues:
  - helper de vinculacion completa `userId`.
  - perfil consulta por email para cubrir cualquier pendiente.
- Mayusculas/minusculas en email:
  - normalizar siempre con `trim().toLowerCase()` en servidor.
- Admin edita email:
  - recalcular normalizado.
  - buscar usuario destino.
  - actualizar `userId` al usuario encontrado o `null`.
  - el certificado deja de aparecer en el perfil del email anterior.
- Admin elimina certificado ya visible:
  - soft delete lo oculta del perfil.
  - URL publica muestra desactivado o `410`.
- Dos certificados para el mismo email:
  - permitidos.
  - listar ambos ordenados por `issuedDate` o `createdAt`.
- Duplicacion de `serialNumber`:
  - bloquear con unique en DB y validacion previa.
  - manejar error Prisma de unique constraint con mensaje claro.
- `recipientDni` repetido:
  - permitido salvo que negocio indique lo contrario.
  - puede disparar advertencia administrativa, no bloqueo.
- Usuario creado con Google y email asociado:
  - callback Google debe ejecutar vinculacion por email.
- Usuario intenta ver certificados de otro usuario:
  - `GET /api/me/certificates` no acepta email externo.
  - el perfil usa sesion.
  - la URL publica es publica por definicion, pero solo por `publicId` no secuencial.
- `publicId` invalido:
  - devolver 404 y pagina clara.
- Certificado eliminado o desactivado:
  - no aparece en perfil.
  - pagina publica muestra estado desactivado.
  - PDF no se descarga.
- Regeneracion de PDF despues de editar:
  - PDF se genera bajo demanda desde DB, por lo tanto refleja datos actuales.
  - no cachear sin invalidacion.
- QR local, preview o produccion:
  - usar `APP_URL`/`NEXT_PUBLIC_APP_URL`.
  - no usar `publicId` temporal ni URL simulada en preview.
  - en creacion, mostrar "Disponible al guardar" hasta persistir el certificado.
  - en edicion, mostrar QR definitivo porque el certificado ya tiene `publicId`.

## Fases de implementacion

### Fase 1: Modelo y migracion

- Agregar `CertificateStatus` y `Certificate` al schema Prisma.
- Agregar relacion en `User`.
- Crear migracion.
- Regenerar Prisma Client.
- Definir helper de normalizacion de email reutilizable.
- Definir helper de generacion de `publicId`.

Criterio de salida:

- `npm run build` compila.
- Prisma Client contiene el modelo `Certificate`.

### Fase 2: Helpers de dominio

- Crear helpers:
  - validar payload de certificado.
  - normalizar email.
  - generar URL publica.
  - vincular certificados pendientes por email.
- Integrar vinculacion en:
  - registro por credenciales.
  - callback de Google al crear usuario.
  - callback de Google para usuario existente, de forma idempotente.

Criterio de salida:

- Crear usuario con email normalizado puede reclamar certificados pendientes.
- No hay dependencia exclusiva de `userId`.

### Fase 3: APIs administrativas

- Implementar CRUD administrativo en `/api/certificates`.
- Proteger endpoints con `requireAdminSession()`.
- Agregar paginacion y busqueda basica.
- Manejar errores de unique `serialNumber`.
- Usar soft delete.

Criterio de salida:

- Admin puede crear, listar, editar y eliminar certificados por API.
- Usuario no admin recibe 403.
- No autenticado recibe 401.

### Fase 4: Dashboard de certificados

- Agregar link "Certificados" en `SidebarContent`.
- Crear `/dashboard/certificados`.
- Implementar formulario con `react-hook-form`.
- Implementar `CertificatePreview` a la derecha.
- Mostrar listado de certificados emitidos.
- Permitir seleccionar certificado para editar.
- Permitir eliminar con confirmacion.

Criterio de salida:

- Preview se actualiza en tiempo real.
- Guardar refresca listado.
- Editar actualiza datos visibles.
- Eliminar oculta/desactiva certificado.

### Fase 5: QR y URL publica

- Agregar dependencia QR.
- Definir variables `APP_URL` y `NEXT_PUBLIC_APP_URL`.
- Implementar placeholder de QR para preview de creacion: "Disponible al guardar".
- Implementar generacion de QR real solo para certificados persistidos, vista publica y PDF.
- Crear `/certificado/validar/[publicId]`.
- Implementar API publica de validacion o consulta server-side directa.

Criterio de salida:

- En creacion, el preview no inventa `publicId` ni URL temporal.
- En edicion y vista publica, el QR apunta a URL publica con `publicId`.
- URL publica muestra certificado activo.
- `publicId` invalido muestra estado correcto.

### Fase 6: Perfil de usuario

- Reemplazar estado vacio por listado real.
- Consultar certificados por email normalizado y/o `userId`.
- Linkear cada certificado a la URL publica.
- Mantener estado vacio cuando no haya certificados.

Criterio de salida:

- Usuario ve solo certificados de su email.
- Certificados creados antes del registro aparecen despues.
- Certificados eliminados no aparecen.

### Fase 7: PDF

- Agregar dependencia PDF.
- Implementar generador desde:
  - plantilla base.
  - datos persistidos.
  - QR de URL publica.
- Agregar endpoint publico de descarga PDF.
- Definir nombre de archivo, por ejemplo:
  - `certificado-${serialNumber}.pdf`

Criterio de salida:

- PDF se descarga desde URL publica.
- PDF refleja ediciones posteriores.
- PDF no se genera para certificados eliminados.

### Fase 8: Verificacion final y hardening

- Ejecutar `npm run build`.
- Probar manualmente flujos principales y edge cases.
- Revisar que no se expongan IDs internos.
- Revisar comportamiento con Google login.
- Revisar variables de entorno en `.env.example`.
- Documentar dependencias agregadas y notas de deploy.

Criterio de salida:

- Checklist de aceptacion completo.
- Build exitoso.

## Checklist de aceptacion final

- [ ] Admin puede entrar a `/dashboard/certificados`.
- [ ] Usuario no admin no puede entrar al dashboard.
- [ ] Usuario no admin no puede usar APIs administrativas.
- [ ] Admin puede crear certificado con todos los campos requeridos.
- [ ] Preview de creacion muestra placeholder "Disponible al guardar" en lugar de QR temporal.
- [ ] `clarificationText` bloquea mas de 300 caracteres en cliente y servidor.
- [ ] Email se guarda normalizado para vinculacion.
- [ ] Certificado para usuario existente completa `userId`.
- [ ] Certificado para usuario inexistente se guarda con `userId = null`.
- [ ] Usuario registrado despues ve certificados emitidos previamente a su email.
- [ ] Usuario creado por Google ve certificados asociados a su email.
- [ ] Dos certificados para el mismo email se muestran correctamente.
- [ ] `serialNumber` duplicado se rechaza.
- [ ] DNI repetido no bloquea salvo decision de negocio futura.
- [ ] Admin puede editar certificado.
- [ ] Editar email reasocia el certificado al nuevo email/usuario.
- [ ] Admin puede eliminar certificado con soft delete.
- [ ] Certificado eliminado no aparece en perfil.
- [ ] URL publica usa `publicId`, no ID interno.
- [ ] QR apunta a la URL publica correcta.
- [ ] URL con `publicId` invalido muestra 404 o mensaje de no encontrado.
- [ ] URL de certificado eliminado muestra estado desactivado.
- [ ] PDF se genera desde datos persistidos y plantilla base.
- [ ] PDF refleja datos editados.
- [ ] PDF no depende de imagen manual generada previamente.
- [ ] Perfil no permite consultar certificados de otro usuario por query params.
- [ ] Respuestas publicas no exponen `id`, `userId` ni metadatos internos.
- [ ] `npm run build` finaliza correctamente.
