# Fase 4 - Servicios externos

Fecha de ejecucion: 2026-07-12.

Alcance ejecutado: actualizacion compatible de SDKs externos usados para almacenamiento y email. No se actualizaron Prisma, NextAuth, UI, formularios ni majors.

## Paquetes actualizados

| Servicio | Package | Antes | Despues | Tipo |
| --- | --- | --- | --- | --- |
| Cloudinary | `cloudinary` | `2.9.0` | `2.10.0` | Minor |
| Email transaccional | `resend` | `6.17.1` | `6.17.2` | Patch |

## Paquetes revisados sin cambio

| Servicio | Package | Version | Motivo |
| --- | --- | --- | --- |
| Formulario de contacto | `@emailjs/browser` | `4.4.1` | No aparece en `npm outdated`; queda sin cambios. |

## Archivos relacionados revisados por alcance

| Archivo | Uso |
| --- | --- |
| `src/libs/cloudinary.ts` | Configuracion del SDK de Cloudinary. |
| `src/libs/email/resend.ts` | Envio de emails con Resend. |
| `src/components/ContactForm/ContactForm.tsx` | Envio de formulario con EmailJS. |
| `src/app/api/news/**` | Upload/reemplazo/borrado de imagenes mediante Cloudinary. |
| `src/app/api/auth/**` | Flujos que pueden disparar emails de confirmacion/recuperacion. |

No se modifico codigo funcional en esos archivos.

## Cambios de arbol

`npm install` reporto:

```text
changed 3 packages
audited 610 packages
10 vulnerabilities (5 moderate, 5 high)
```

`npm ci` posterior reporto:

```text
added 609 packages, and audited 610 packages
10 vulnerabilities (5 moderate, 5 high)
```

`postinstall` ejecuto `prisma generate` con Prisma Client `v6.19.2`.

## Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `npm install cloudinary@2.10.0 resend@6.17.2` | OK. Actualizo solo servicios externos dentro de wanted. |
| `npm ci` | OK. Instalacion limpia y `prisma generate` OK. |
| `npm run test:run` | OK. 1 test pasado. |
| `npm run build` | OK. Next `16.2.10`, 38 paginas generadas. |
| `npm audit --json` | Exit code `1` por vulnerabilidades restantes; total bajo a 10. |
| `npm outdated --json` | Exit code `1` por paquetes restantes fuera de alcance. |
| `npm ls cloudinary resend @emailjs/browser --depth=1` | OK. `cloudinary@2.10.0`, `resend@6.17.2`, `@emailjs/browser@4.4.1`. |

## Validacion automatica

Tests:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
```

Build:

```text
Next.js 16.2.10 (Turbopack)
Compiled successfully
Finished TypeScript
Generating static pages (38/38)
```

Warning de build:

```text
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list

Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/app/api/news/[id]/route.ts
```

Diagnostico: es el mismo warning registrado desde la linea base. No se detectaron warnings nuevos.

## Estado posterior de `npm audit`

| Severidad | Despues Fase 3 | Despues Fase 4 |
| --- | ---: | ---: |
| Moderate | 5 | 5 |
| High | 6 | 5 |
| Critical | 0 | 0 |
| Total | 11 | 10 |

Vulnerabilidades restantes:

| Package | Severidad | Alcance inicial |
| --- | --- | --- |
| `next` / `postcss` | moderate | Produccion |
| `next-auth` / `uuid` | moderate | Produccion |
| `prisma` / `@prisma/config` / `effect` | high | Desarrollo/tooling |
| `brace-expansion` | moderate | Tooling/transitiva |
| `defu` | high | Pendiente de ruta exacta |
| `flatted` | high | Pendiente de ruta exacta |

Vulnerabilidad que dejo de aparecer respecto de Fase 3:

- `lodash`

## Estado posterior de `npm outdated`

Paquetes de Fase 4 que quedaron en `wanted`:

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| `cloudinary` | `2.10.0` | `2.10.0` | `2.10.0` |
| `resend` | `6.17.2` | `6.17.2` | `6.17.2` |

`@emailjs/browser` no aparece en `npm outdated`.

Paquetes todavia listados por `npm outdated` pertenecen a fases posteriores o majors no incluidas:

- Prisma y `@prisma/client`: Fase 5.
- NextAuth: Fase 6.
- Majors postergables/no incluidas: `lucide-react`, `react-day-picker@10`, `react-dropzone@16`, `react-player@3`, `typescript@7`, `eslint@10`, `@types/node@26`, `@types/bcrypt@6`.

## Validaciones manuales pendientes

No se hicieron pruebas manuales con credenciales reales/staging durante esta fase. Quedan pendientes:

- Subida de imagenes a Cloudinary.
- Reemplazo de imagenes en noticias.
- Borrado de imagenes desde Cloudinary.
- Envio de email de confirmacion con Resend.
- Envio de email de recuperacion de contrasena con Resend.
- Envio del formulario de contacto con EmailJS.
- Manejo de errores de red/credenciales en esos flujos.

## Diagnostico de cierre

- Fase 4 completada.
- Instalacion limpia validada con `npm ci`.
- Tests pasan.
- Build pasa.
- No aparecieron warnings nuevos; persiste el warning NFT/Turbopack de la linea base.
- `npm audit` bajo de 11 a 10 vulnerabilidades.
- `cloudinary` y `resend` quedaron en `wanted`.
- `@emailjs/browser` quedo sin cambios porque no aparece desactualizado.
- No se tocaron Prisma, NextAuth ni majors.

## Pendientes para fases siguientes

- Fase 5: Prisma 6.x.
- Fase 6: NextAuth 4.x.
- Fase 7: auditoria, limpieza, paquetes `extraneous`, imports transitivos directos y evaluacion de majors.
