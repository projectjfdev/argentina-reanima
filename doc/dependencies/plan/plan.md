# Plan seguro de actualizacion de dependencias

Fecha de relevamiento: 2026-07-12.

Este plan no busca llevar todas las dependencias a `latest`. El objetivo es mantener el proyecto estable, seguro y compatible. Las actualizaciones patch tienen prioridad; las minor se aplican cuando sean compatibles; las major se evalúan y no son obligatorias.

Regla de documentacion: cada dependencia se desarrolla en una unica seccion, dentro del catalogo de grupos. En las fases se referencia el grupo correspondiente para evitar documentacion redundante.

## Linea base e inventario unico

Entorno y build:

- Node local: `v20.19.0`.
- npm local: `10.8.2`.
- No hay campo `engines` en `package.json`; antes de cambios sensibles conviene definir la version esperada de Node en documentacion o despliegue.
- Scripts actuales: `dev`, `build`, `start`, `test`, `test:run`, `test:watch`, `postinstall`.
- Build actual: `npm run build` finaliza correctamente.
- Warning actual: Turbopack/NFT `Encountered unexpected file in NFT list`, con traza `next.config.ts -> src/generated/prisma/index.js -> src/app/api/news/[id]/route.ts`.
- Configuracion relevante: `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `postcss.config.mjs`, `prisma/schema.prisma`.

Diferencias de actualizacion:

- Patch: correcciones compatibles de bugs/seguridad. Deben aplicarse primero.
- Minor: cambios compatibles, pero pueden afectar tipos, peers o comportamiento. Deben agruparse por dominio.
- Major: posibles breaking changes. Solo se migran si el beneficio real justifica costo y riesgo.

Clasificacion por tipo:

- Produccion directas: Core, Prisma runtime, NextAuth, UI, formularios, librerias cliente/DOM, multimedia, archivos, correo, almacenamiento y utilidades.
- Desarrollo directas: TypeScript/tipos, ESLint, Tailwind/PostCSS tooling, Vitest/jsdom/Testing Library y Prisma CLI.
- Transitivas relevantes: `framer-motion` llega por `motion`; `@radix-ui/react-visually-hidden` llega por Radix. Ambas se importan directamente en el codigo y deben tratarse como deuda de declaracion explicita o migracion de imports.

Catalogo de grupos:

| Grupo | Dependencias | Estado observado | Riesgo | Criterio de actualizacion |
| --- | --- | --- | --- | --- |
| Core y runtime | `next` `16.2.9`, `react` `19.2.3`, `react-dom` `19.2.3` | Patches disponibles: Next `16.2.10`, React/DOM `19.2.7`. | Alto por SSR, App Router, React 19 y Turbopack. | Aplicar patches juntos; no tocar majors porque no hay major nueva de Next/React en el relevamiento. |
| Tooling y testing | `typescript` `5.9.3`, `eslint` `9.39.2`, `eslint-config-next` `16.2.9`, `vitest` `4.1.10`, `jsdom` `29.1.1`, Testing Library, tipos | TypeScript latest `7.0.2`; ESLint latest `10.7.0`. | Medio: puede bloquear build/test sin afectar runtime. | Patches primero. TypeScript 7 y ESLint 10 son postergables; evaluar solo con changelogs. |
| UI, formularios y cliente DOM | Radix, `lucide-react` `0.511.0`, `motion` `12.27.1`, `react-hook-form` `7.71.1`, `react-day-picker` `9.13.0`, `leaflet`, `react-leaflet`, `react-player` `2.16.1`, `react-dropzone` `14.3.8`, `sonner`, `tailwind-merge`, `date-fns`, `embla-carousel-react`, `react-use-measure` | Patches/minors disponibles; majors disponibles en Lucide 1, Day Picker 10, Dropzone 16, React Player 3. | Medio/alto por hidratacion, formularios, modales, mapas, videos y uploads. | Minors por subgrupo. Majors: Lucide/DayPicker/Dropzone postergables; React Player 3 no recomendada actualmente salvo necesidad funcional o seguridad. |
| Servicios externos | `cloudinary` `2.9.0`, `resend` `6.17.1`, `@emailjs/browser` `4.4.1` | Patches/minors disponibles en Cloudinary/Resend; EmailJS sin señal critica en el relevamiento. | Alto por uploads, eliminacion de imagenes y emails. | Patches/minors compatibles con pruebas manuales de integracion. |
| Prisma 6.x | `prisma` `6.19.2`, `@prisma/client` `6.19.2` | Patch `6.19.3`; latest `7.8.0`. Schema PostgreSQL con generator custom `../src/generated/prisma`. | Critico por DB, APIs, certificados y cliente generado. | Mantener en 6.x con patch/minor seguro. Prisma 7 es postergable y debe evaluarse como proyecto independiente. |
| NextAuth 4.x | `next-auth` `4.24.13`, `bcrypt` `6.0.0`, `@types/bcrypt` `5.0.2` | Patch NextAuth `4.24.14`; Auth.js/v5 es migracion aparte. | Critico por login, sesiones, roles, middleware y Google/Credentials. | Mantener NextAuth 4 con patches. Migrar a Auth.js/v5 es postergable y fuera del mantenimiento general. `@types/bcrypt` 6 puede ser recomendada si compila sin cambios. |
| Seguridad y limpieza | Transitivas auditadas: `postcss`, `uuid`, `effect`, `@prisma/config`, `ajv`, `brace-expansion`, `defu`, `flatted`, `js-yaml`, `lodash`, `minimatch`; candidatas de limpieza: `@types/qrcode`, imports transitivos directos, dependencias sin uso confirmado | `npm audit` reporta 14 vulnerabilidades: 7 moderadas, 7 altas, 0 criticas. | Variable: produccion en Next/NextAuth transitivas; desarrollo en Prisma/tooling y utilidades. | No usar `npm audit fix --force`. Separar runtime/dev y corregir por paquete dueño, no por fix automatico. |

## Estrategia de trabajo

- Crear rama exclusiva: `maintenance/dependency-update-2026-07`.
- Commits pequenos por fase o subgrupo dentro de la fase.
- No mezclar mantenimiento con funcionalidades.
- No actualizar varias majors en un unico cambio.
- Mantener `package.json` y `package-lock.json` alineados en cada implementacion.
- Generar un reporte por fase en `doc/dependencies/reports/`.

## Matriz de riesgo

| Area | Riesgo | Validacion clave |
| --- | --- | --- |
| Next.js/Core | Alto | Build, rutas API, paginas dinamicas, warning NFT. |
| React 19 | Alto | Hidratacion, Strict Mode, peers de librerias cliente. |
| Prisma | Critico | `prisma generate`, APIs, certificados, dashboard. |
| NextAuth | Critico | Login, registro, logout, recuperacion, roles, dashboard. |
| TypeScript/tooling | Medio/alto | Typecheck/build, tests, configuracion actual. |
| UI/formularios | Medio/alto | Modales, selects, tooltips, submit, validaciones. |
| Mapas/multimedia/uploads | Medio/alto | `/filiales`, ReactPlayer, Dropzone, CSS/DOM. |
| Correo/almacenamiento | Alto | Resend, EmailJS, Cloudinary. |
| Testing | Medio | Vitest/jsdom/Testing Library. |

## Fases

### Fase 1. Linea base e inventario

- Objetivo: congelar el estado actual antes de modificar dependencias.
- Alcance: catalogo de grupos, versiones declaradas/resueltas, scripts, Node/npm, imports reales, `npm outdated`, `npm audit`, build y warnings.
- Archivos a revisar: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `postcss.config.mjs`, `prisma/schema.prisma`, `src/**`.
- Comandos cuando se implemente: `node -v`, `npm -v`, `npm outdated --json`, `npm audit --json`, `npm ls --all --json`, `npm run test:run`, `npm run build`.
- Riesgos: partir de rangos declarados y no de versiones resueltas; ignorar imports transitivos directos; no registrar warnings existentes.
- Dependencias involucradas: todos los grupos del catalogo.
- Criterios de aceptacion: reporte con version declarada/resuelta/wanted/latest, vulnerabilidades runtime/dev, warnings y dependencias directas/transitivas.
- Validaciones necesarias: build actual y tests, si existen, quedan como referencia.
- Orden recomendado: primera fase.
- Condiciones para detenerse y rollback: no hay rollback de dependencias; detenerse si el inventario muestra inconsistencia de lockfile o dependencias ausentes.
- Entregables esperados: reporte de linea base y backlog inicial.
- Reporte sugerido: `doc/dependencies/reports/fase-1-linea-base-inventario.md`.

### Fase 2. Patches de core y tooling

- Objetivo: aplicar correcciones patch de bajo riesgo en Core y Tooling/testing.
- Alcance: solo patch dentro de las ramas actuales; no majors.
- Archivos a revisar: `package.json`, `package-lock.json`, configuraciones de Next, TS, Vitest, Tailwind/PostCSS.
- Comandos cuando se implemente: `npm install <paquetes-patch>`, `npm ci`, `npm run test:run`, `npm run build`, `npm audit --json`.
- Riesgos: peer dependencies nuevas, warnings de Next/Turbopack, cambios de tipos.
- Dependencias involucradas: grupos Core y runtime; Tooling y testing.
- Criterios de aceptacion: instalacion limpia, tests y build pasan; sin warnings nuevos no explicados.
- Validaciones necesarias: paginas principales, rutas API basicas, revision del warning NFT existente.
- Orden recomendado: despues de Fase 1, antes de UI/servicios.
- Condiciones para detenerse y rollback: fallo de build, peer incompatible, warning nuevo critico o test suite rota.
- Entregables esperados: commit de patches y reporte de diff de versiones.
- Reporte sugerido: `doc/dependencies/reports/fase-2-patches-core-tooling.md`.

### Fase 3. UI, formularios y librerias cliente

- Objetivo: actualizar patches/minors compatibles de UI, formularios y librerias que dependen del DOM.
- Alcance: Radix/Tailwind UI, formularios, animacion, mapas, multimedia, uploads y librerias cliente. React 19 se valida aqui como compatibilidad de peers y comportamiento.
- Archivos a revisar: `src/components/ui/**`, formularios de auth/dashboard/contacto, `src/components/FilialesMap/**`, `src/components/Video/**`, `src/components/FileUpload/**`, componentes con `motion`.
- Comandos cuando se implemente: `npm install <subgrupo-ui-cliente>`, `npm ci`, `npm run test:run`, `npm run build`, `npm ls react react-dom`.
- Riesgos: hidratacion, referencias a `window`, cambios de props en UI/formularios, CSS de Leaflet, API de ReactPlayer/Dropzone, imports transitivos directos.
- Dependencias involucradas: grupo UI, formularios y cliente DOM.
- Criterios de aceptacion: build sin errores, sin peers incompatibles con React 19, formularios y componentes interactivos funcionando.
- Validaciones necesarias: login, registro, recuperacion de contrasena, modales, selects, tooltips, `/filiales`, paginas con ReactPlayer, subida de archivos.
- Orden recomendado: despues de patches de core/tooling.
- Condiciones para detenerse y rollback: error de hidratacion, pagina cliente rota, subida de archivos fallando o cambio major necesario no aprobado.
- Entregables esperados: reporte por subgrupo dentro de la fase, sin crear fases adicionales.
- Reporte sugerido: `doc/dependencies/reports/fase-3-ui-formularios-cliente.md`.

### Fase 4. Servicios externos

- Objetivo: actualizar SDKs externos compatibles sin romper integraciones.
- Alcance: almacenamiento, envio de emails transaccionales y formulario de contacto.
- Archivos a revisar: `src/libs/cloudinary.ts`, `src/libs/email/resend.ts`, `src/components/ContactForm/ContactForm.tsx`, APIs de noticias/auth que suben archivos o envian emails.
- Comandos cuando se implemente: `npm install <servicios-externos>`, `npm ci`, `npm run test:run`, `npm run build`.
- Riesgos: cambios en respuestas del SDK, errores de variables de entorno, limites de payload, fallos silenciosos de email/upload.
- Dependencias involucradas: grupo Servicios externos.
- Criterios de aceptacion: build pasa y las integraciones funcionan en entorno con credenciales de prueba/staging.
- Validaciones necesarias: subida/reemplazo/borrado de imagenes, contacto por EmailJS, confirmacion y recuperacion por Resend.
- Orden recomendado: despues de UI/cliente porque comparte flujos de formulario/upload.
- Condiciones para detenerse y rollback: falla envio de email, falla upload/delete o cambia contrato de respuesta.
- Entregables esperados: reporte de integraciones externas.
- Reporte sugerido: `doc/dependencies/reports/fase-4-servicios-externos.md`.

### Fase 5. Prisma 6.x

- Objetivo: mantener Prisma dentro de 6.x con patches/minors seguros.
- Alcance: CLI `prisma`, runtime `@prisma/client`, generator custom, schema, migraciones existentes y cliente generado.
- Archivos a revisar: `prisma/schema.prisma`, `src/libs/db.ts`, `src/generated/prisma/**`, APIs en `src/app/api/**`, paginas server que usan Prisma.
- Comandos cuando se implemente: `npm install prisma@6 <@prisma/client@6>`, `npx prisma validate`, `npx prisma generate`, `npm run test:run`, `npm run build`.
- Riesgos: cambios en output generado, engines, tipos `Prisma`, queries o trazado NFT/Turbopack.
- Dependencias involucradas: grupo Prisma 6.x.
- Criterios de aceptacion: `prisma generate` y build pasan; APIs de datos mantienen comportamiento.
- Validaciones necesarias: noticias, cursos, certificados, perfil, validacion publica de certificado, dashboard.
- Orden recomendado: despues de patches generales y antes de auditoria final.
- Condiciones para detenerse y rollback: falla generate, cambia output esperado, fallan queries o se agrava el warning NFT.
- Entregables esperados: reporte Prisma 6.x.
- Reporte sugerido: `doc/dependencies/reports/fase-5-prisma-6.md`.

### Fase 6. NextAuth 4.x

- Objetivo: mantener autenticacion estable en NextAuth 4.x mediante patches.
- Alcance: NextAuth 4, providers, callbacks, middleware/proxy, tipos de sesion, `bcrypt` y tipos relacionados.
- Archivos a revisar: `src/libs/authOptions.ts`, `src/proxy.ts`, `src/types/next-auth.d.ts`, `src/app/api/auth/**`, paginas de auth y dashboard protegido.
- Comandos cuando se implemente: `npm install next-auth@4`, `npm ci`, `npm run test:run`, `npm run build`, `npm audit --json`.
- Riesgos: cookies/sesion, JWT, roles, provider Google, credentials, middleware y tipos.
- Dependencias involucradas: grupo NextAuth 4.x.
- Criterios de aceptacion: login/logout y proteccion de dashboard funcionan; no se introduce downgrade ni migracion a Auth.js/v5.
- Validaciones necesarias: registro, confirmacion de email, login Credentials, login Google si hay credenciales, recuperacion de contrasena, rol admin/user, sign out.
- Orden recomendado: despues de Core y antes de auditoria final.
- Condiciones para detenerse y rollback: cualquier ruptura de sesion, permisos o flujo de recuperacion.
- Entregables esperados: reporte NextAuth 4.x.
- Reporte sugerido: `doc/dependencies/reports/fase-6-nextauth-4.md`.

### Fase 7. Auditoria, limpieza y evaluacion de majors

- Objetivo: cerrar vulnerabilidades posibles sin fixes automaticos, eliminar deuda segura y decidir si alguna major conviene realmente.
- Alcance: `npm audit`, dependencias no usadas/mal declaradas, vulnerabilidades runtime/dev, y evaluacion de majors del catalogo.
- Archivos a revisar: `package.json`, `package-lock.json`, imports `src/**`, advisories, changelogs y migration guides.
- Comandos cuando se implemente: `npm audit --json`, `npm explain <paquete>`, `npm ls <paquete>`, `npm outdated`, `npm view <paquete>@latest peerDependencies`.
- Riesgos: `npm audit fix --force` propone downgrades o majors improcedentes; falsos positivos de limpieza; majors con breaking changes.
- Dependencias involucradas: grupo Seguridad y limpieza; majors referenciadas en Core/Tooling/UI/Prisma/NextAuth.
- Criterios de aceptacion: cada vulnerabilidad queda corregida, justificada o planificada; cada major queda clasificada como recomendada ahora, postergable o no recomendada actualmente.
- Validaciones necesarias: separar vulnerabilidades de produccion (`next`/`postcss`, `next-auth`/`uuid`) de desarrollo/tooling (`prisma` CLI y transitivas como `effect`, `@prisma/config`, `ajv`, `brace-expansion`, `defu`, `flatted`, `js-yaml`, `lodash`, `minimatch`).
- Orden recomendado: despues de aplicar patches/minors compatibles.
- Condiciones para detenerse y rollback: vulnerabilidad alta explotable en produccion sin mitigacion, eliminacion que rompe imports, o major que requiere refactor funcional.
- Entregables esperados: reporte de seguridad, limpieza y decision de majors.
- Reporte sugerido: `doc/dependencies/reports/fase-7-auditoria-limpieza-majors.md`.

Decisiones actuales sobre majors:

| Major | Decision | Motivo |
| --- | --- | --- |
| Prisma 7 | Postergable | Prisma 6.x puede mantenerse con patches; 7.x requiere revisar generator, engines, tipos y runtime. |
| Auth.js/NextAuth v5 | Postergable | NextAuth 4.x puede mantenerse; v5 implica migracion de providers, callbacks, cookies, middleware y tipos. |
| TypeScript 7 | Postergable | TypeScript 5.9.3 esta estable; migrar puede generar mucho ruido de tipos sin beneficio inmediato. |
| ESLint 10 | Postergable | La configuracion ESLint actual esta comentada y no hay script lint activo. |
| Lucide 1 | Postergable | Muchos iconos en UI; beneficio bajo si no hay problema actual. |
| React Day Picker 10 | Postergable | Puede cambiar API visual/props; migrar solo si se usa activamente y aporta valor. |
| React Dropzone 16 | Postergable | Afecta uploads; migrar solo con pruebas aisladas o necesidad concreta. |
| React Player 3 | No recomendada actualmente | Riesgo de cambios de API/comportamiento multimedia sin beneficio inmediato. |
| `@types/bcrypt` 6 | Recomendada ahora si compila | Bajo impacto runtime y alinea tipos con `bcrypt` 6. |

### Fase 8. Validacion final y rollback

- Objetivo: confirmar estabilidad global y dejar una ruta clara de vuelta.
- Alcance: instalacion limpia, Prisma generate, tests, build, warnings, pruebas manuales y estrategia de revert.
- Archivos a revisar: `package.json`, `package-lock.json`, reportes de fases, rutas criticas y configuraciones.
- Comandos cuando se implemente: `npm ci`, `npx prisma generate`, `npm run test:run`, `npm run build`, `npm audit --json`, `git revert <commit>` si hace falta.
- Riesgos: diferencias local/deploy, lockfile inconsistente, rollback dificil si hubo commits grandes.
- Dependencias involucradas: grupos modificados durante las fases anteriores.
- Criterios de aceptacion: instalacion limpia, tests/build OK, warnings explicados, vulnerabilidades restantes justificadas, rollback documentado por commit/grupo.
- Validaciones necesarias: login, registro, recuperacion, panel administrador, creacion/validacion/descarga de certificados, subida de archivos, envio de emails, `/filiales`, paginas con ReactPlayer.
- Orden recomendado: ultima fase.
- Condiciones para detenerse y rollback: fallo de build, auth, Prisma, certificados, uploads, emails o rutas publicas criticas.
- Entregables esperados: reporte final y guia de rollback.
- Reporte sugerido: `doc/dependencies/reports/fase-8-validacion-final-rollback.md`.

## Orden recomendado

1. Linea base e inventario.
2. Patches de core y tooling.
3. UI, formularios y librerias cliente.
4. Servicios externos.
5. Prisma 6.x.
6. NextAuth 4.x.
7. Auditoria, limpieza y evaluacion de majors.
8. Validacion final y rollback.
