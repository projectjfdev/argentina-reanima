# Fase 1 - Linea base e inventario de dependencias

Fecha de relevamiento: 2026-07-12.

Este reporte documenta el estado actual del proyecto antes de modificar dependencias. No se instalaron paquetes, no se actualizaron versiones, no se modificaron `package.json` ni `package-lock.json`, y no se modifico codigo funcional.

## Entorno

| Item | Valor |
| --- | --- |
| Proyecto | `argreanima@0.2.0` |
| Framework | Next.js App Router |
| Node local | `v20.19.0` |
| npm local | `10.8.2` |
| Lockfile | `package-lock.json`, `lockfileVersion: 3` |
| Campo `engines` | No declarado en `package.json` |
| Prisma datasource | PostgreSQL |
| Prisma client output | `src/generated/prisma` |

## Scripts disponibles

| Script | Comando |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `test` | `vitest` |
| `test:run` | `vitest run` |
| `test:watch` | `vitest --watch` |
| `postinstall` | `prisma generate` |

## Configuracion relevante

- `next.config.ts`: `experimental.serverActions.bodySizeLimit = "20mb"`, `turbopack.root = process.cwd()`, `reactStrictMode = true`, `images.unoptimized = true`, `remotePatterns` para `res.cloudinary.com`.
- `tsconfig.json`: `strict = true`, `skipLibCheck = true`, `moduleResolution = "bundler"`, alias `@/*`, incluye `.next/types/**/*.ts` y `.next/dev/types/**/*.ts`.
- `vitest.config.ts`: entorno `jsdom`, `globals = true`, setup opcional `src/test/setup.ts`, alias `@` a `src`.
- `prisma/schema.prisma`: PostgreSQL, generator `prisma-client-js`, output `../src/generated/prisma`.

## Build actual

No se reejecuto `npm run build` durante esta fase porque `next build` escribe en `.next` y la restriccion indica no ejecutar comandos que alteren el proyecto.

Ultimo build relevado en esta sesion:

- Comando: `npm run build`.
- Resultado: exitoso.
- Next.js: `16.2.9` con Turbopack.
- Rutas generadas: 38 paginas.
- Warning detectado:

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

## Dependencias directas declaradas e instaladas

| Package | Tipo | Declarada | Instalada |
| --- | --- | --- | --- |
| `@emailjs/browser` | prod | `^4.4.1` | `4.4.1` |
| `@eslint/eslintrc` | dev | `^3` | `3.3.3` |
| `@prisma/client` | prod | `^6.8.1` | `6.19.2` |
| `@radix-ui/react-accordion` | prod | `^1.2.10` | `1.2.12` |
| `@radix-ui/react-dialog` | prod | `^1.1.13` | `1.1.15` |
| `@radix-ui/react-icons` | prod | `^1.3.2` | `1.3.2` |
| `@radix-ui/react-label` | prod | `^2.1.6` | `2.1.8` |
| `@radix-ui/react-navigation-menu` | prod | `^1.2.12` | `1.2.14` |
| `@radix-ui/react-select` | prod | `^2.2.4` | `2.2.6` |
| `@radix-ui/react-separator` | prod | `^1.1.6` | `1.1.8` |
| `@radix-ui/react-slot` | prod | `^1.2.3` | `1.2.4` |
| `@radix-ui/react-tooltip` | prod | `^1.2.6` | `1.2.8` |
| `@tailwindcss/postcss` | dev | `^4` | `4.1.18` |
| `@testing-library/jest-dom` | dev | `^6.9.1` | `6.9.1` |
| `@testing-library/react` | dev | `^16.3.2` | `16.3.2` |
| `@testing-library/user-event` | dev | `^14.6.1` | `14.6.1` |
| `@types/bcrypt` | dev | `^5.0.2` | `5.0.2` |
| `@types/leaflet` | dev | `^1.9.18` | `1.9.21` |
| `@types/node` | dev | `^20` | `20.19.30` |
| `@types/qrcode` | prod | `^1.5.6` | `1.5.6` |
| `@types/react` | dev | `^19` | `19.2.8` |
| `@types/react-dom` | dev | `^19` | `19.2.3` |
| `bcrypt` | prod | `^6.0.0` | `6.0.0` |
| `class-variance-authority` | prod | `^0.7.1` | `0.7.1` |
| `cloudinary` | prod | `^2.6.1` | `2.9.0` |
| `clsx` | prod | `^2.1.1` | `2.1.1` |
| `date-fns` | prod | `^4.1.0` | `4.1.0` |
| `embla-carousel-react` | prod | `^8.6.0` | `8.6.0` |
| `eslint` | dev | `^9` | `9.39.2` |
| `eslint-config-next` | dev | `^16.2.9` | `16.2.9` |
| `jsdom` | dev | `^29.1.1` | `29.1.1` |
| `leaflet` | prod | `^1.9.4` | `1.9.4` |
| `lucide-react` | prod | `^0.511.0` | `0.511.0` |
| `motion` | prod | `^12.12.1` | `12.27.1` |
| `next` | prod | `^16.2.9` | `16.2.9` |
| `next-auth` | prod | `^4.24.11` | `4.24.13` |
| `prisma` | dev | `^6.8.1` | `6.19.2` |
| `qrcode` | prod | `^1.5.4` | `1.5.4` |
| `react` | prod | `^19.0.0` | `19.2.3` |
| `react-day-picker` | prod | `^9.7.0` | `9.13.0` |
| `react-dom` | prod | `^19.0.0` | `19.2.3` |
| `react-dropzone` | prod | `^14.3.8` | `14.3.8` |
| `react-hook-form` | prod | `^7.56.3` | `7.71.1` |
| `react-leaflet` | prod | `^5.0.0` | `5.0.0` |
| `react-player` | prod | `^2.16.0` | `2.16.1` |
| `react-use-measure` | prod | `^2.1.7` | `2.1.7` |
| `resend` | prod | `^6.17.1` | `6.17.1` |
| `sonner` | prod | `^2.0.3` | `2.0.7` |
| `tailwind-merge` | prod | `^3.3.0` | `3.4.0` |
| `tailwindcss` | dev | `^4` | `4.1.18` |
| `tw-animate-css` | dev | `^1.3.0` | `1.4.0` |
| `typescript` | dev | `^5` | `5.9.3` |
| `vitest` | dev | `^4.1.10` | `4.1.10` |

## Resultado de `npm outdated`

`npm outdated --json` finalizo con exit code `1`, esperado cuando hay paquetes desactualizados.

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| `@eslint/eslintrc` | `3.3.3` | `3.3.6` | `3.3.6` |
| `@prisma/client` | `6.19.2` | `6.19.3` | `7.8.0` |
| `@radix-ui/react-accordion` | `1.2.12` | `1.2.16` | `1.2.16` |
| `@radix-ui/react-dialog` | `1.1.15` | `1.1.19` | `1.1.19` |
| `@radix-ui/react-label` | `2.1.8` | `2.1.11` | `2.1.11` |
| `@radix-ui/react-navigation-menu` | `1.2.14` | `1.2.18` | `1.2.18` |
| `@radix-ui/react-select` | `2.2.6` | `2.3.3` | `2.3.3` |
| `@radix-ui/react-separator` | `1.1.8` | `1.1.11` | `1.1.11` |
| `@radix-ui/react-slot` | `1.2.4` | `1.3.0` | `1.3.0` |
| `@radix-ui/react-tooltip` | `1.2.8` | `1.2.12` | `1.2.12` |
| `@tailwindcss/postcss` | `4.1.18` | `4.3.2` | `4.3.2` |
| `@types/bcrypt` | `5.0.2` | `5.0.2` | `6.0.0` |
| `@types/node` | `20.19.30` | `20.19.43` | `26.1.1` |
| `@types/react` | `19.2.8` | `19.2.17` | `19.2.17` |
| `cloudinary` | `2.9.0` | `2.10.0` | `2.10.0` |
| `date-fns` | `4.1.0` | `4.4.0` | `4.4.0` |
| `eslint` | `9.39.2` | `9.39.5` | `10.7.0` |
| `eslint-config-next` | `16.2.9` | `16.2.10` | `16.2.10` |
| `lucide-react` | `0.511.0` | `0.511.0` | `1.24.0` |
| `motion` | `12.27.1` | `12.42.2` | `12.42.2` |
| `next` | `16.2.9` | `16.2.10` | `16.2.10` |
| `next-auth` | `4.24.13` | `4.24.14` | `4.24.14` |
| `prisma` | `6.19.2` | `6.19.3` | `7.8.0` |
| `react` | `19.2.3` | `19.2.7` | `19.2.7` |
| `react-day-picker` | `9.13.0` | `9.14.0` | `10.0.1` |
| `react-dom` | `19.2.3` | `19.2.7` | `19.2.7` |
| `react-dropzone` | `14.3.8` | `14.4.1` | `16.0.0` |
| `react-hook-form` | `7.71.1` | `7.81.0` | `7.81.0` |
| `react-player` | `2.16.1` | `2.16.1` | `3.4.0` |
| `resend` | `6.17.1` | `6.17.2` | `6.17.2` |
| `tailwind-merge` | `3.4.0` | `3.6.0` | `3.6.0` |
| `tailwindcss` | `4.1.18` | `4.3.2` | `4.3.2` |
| `typescript` | `5.9.3` | `5.9.3` | `7.0.2` |

## Resultado de `npm audit`

`npm audit --json` finalizo con exit code `1`, esperado cuando hay vulnerabilidades.

Resumen:

| Severidad | Cantidad |
| --- | ---: |
| Info | 0 |
| Low | 0 |
| Moderate | 7 |
| High | 7 |
| Critical | 0 |
| Total | 14 |

Conteo de dependencias reportado por audit:

| Tipo | Cantidad |
| --- | ---: |
| Production | 202 |
| Development | 477 |
| Optional | 109 |
| Peer | 9 |
| Peer optional | 0 |
| Total | 713 |

Vulnerabilidades detectadas:

| Package | Severidad | Directa | Via / relacion | Alcance inicial |
| --- | --- | --- | --- | --- |
| `next` | moderate | si | `postcss` | Produccion |
| `postcss` | moderate | no | dependencia interna de `next` | Produccion |
| `next-auth` | moderate | si | `next`, `uuid` | Produccion |
| `uuid` | moderate | no | dependencia de `next-auth` | Produccion |
| `prisma` | high | si | `@prisma/config` | Desarrollo/tooling |
| `@prisma/config` | high | no | `effect` | Desarrollo/tooling |
| `effect` | high | no | afecta `@prisma/config` | Desarrollo/tooling |
| `ajv` | moderate | no | tooling/transitiva | Desarrollo/tooling probable |
| `brace-expansion` | moderate | no | tooling/transitiva | Desarrollo/tooling probable |
| `defu` | high | no | transitive | Pendiente de confirmar ruta |
| `flatted` | high | no | transitive | Pendiente de confirmar ruta |
| `js-yaml` | moderate | no | tooling/transitiva | Desarrollo/tooling probable |
| `lodash` | high | no | transitive | Pendiente de confirmar ruta |
| `minimatch` | high | no | tooling/transitiva | Desarrollo/tooling probable |

Observacion de inventario: `npm audit` sugiere fixes disponibles, pero algunos fix targets informados son downgrades o cambios semver impropios para este proyecto, por ejemplo `next@9.3.3` y `next-auth@3.29.10`. En esta fase solo se registra el diagnostico.

## Resultado de `npm ls --all`

`npm ls --all --json` finalizo con exit code `0`.

Problemas reportados por el arbol instalado:

| Problema | Package |
| --- | --- |
| extraneous | `@emnapi/core@1.11.1` |
| extraneous | `@emnapi/runtime@1.11.1` |
| extraneous | `@emnapi/wasi-threads@1.2.2` |
| extraneous | `@napi-rs/wasm-runtime@0.2.12` |
| extraneous | `@tybys/wasm-util@0.10.3` |

Transitivas relevantes confirmadas:

| Package transitivo | Ruta confirmada |
| --- | --- |
| `framer-motion@12.27.1` | `motion@12.27.1 -> framer-motion@12.27.1` |
| `@radix-ui/react-visually-hidden@1.2.3` | `@radix-ui/react-navigation-menu`, `@radix-ui/react-select`, `@radix-ui/react-tooltip` |

## Imports directos detectados

| Package importado | Declarado | Archivos | Ejemplos |
| --- | --- | ---: | --- |
| `@emailjs/browser` | si | 1 | `src/components/ContactForm/ContactForm.tsx` |
| `@prisma/client` | si | 1 | `src/libs/db.ts` |
| `@prisma/debug` | no | 1 | `src/generated/prisma/runtime/library.d.ts` |
| `@radix-ui/react-accordion` | si | 1 | `src/components/ui/accordion.tsx` |
| `@radix-ui/react-dialog` | si | 2 | `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx` |
| `@radix-ui/react-icons` | si | 2 | `src/components/ui/dialog.tsx`, `src/components/ui/pagination.tsx` |
| `@radix-ui/react-label` | si | 1 | `src/components/ui/label.tsx` |
| `@radix-ui/react-navigation-menu` | si | 1 | `src/components/ui/navigation-menu.tsx` |
| `@radix-ui/react-select` | si | 1 | `src/components/ui/select.tsx` |
| `@radix-ui/react-separator` | si | 1 | `src/components/ui/separator.tsx` |
| `@radix-ui/react-slot` | si | 1 | `src/components/ui/button.tsx` |
| `@radix-ui/react-tooltip` | si | 1 | `src/components/ui/tooltip.tsx` |
| `@radix-ui/react-visually-hidden` | no | 4 | `src/components/Modal/GalleryModalCanuelas.tsx`, `src/components/Modal/GalleryModalMardePlata.tsx`, `src/components/Modal/GalleryModalRioGrande.tsx` |
| `@testing-library/react` | si | 2 | `src/test/environment.test.tsx`, `src/test/setup.ts` |
| `@testing-library/user-event` | si | 1 | `src/test/environment.test.tsx` |
| `bcrypt` | si | 3 | `src/app/api/auth/register/route.ts`, `src/libs/auth/passwordReset.ts`, `src/libs/authOptions.ts` |
| `class-variance-authority` | si | 5 | `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/label.tsx` |
| `cloudinary` | si | 1 | `src/libs/cloudinary.ts` |
| `clsx` | si | 1 | `src/libs/utils.ts` |
| `embla-carousel-react` | si | 1 | `src/components/ui/carousel.tsx` |
| `framer-motion` | no | 32 | `src/app/(front)/auth/forgot-password/page.tsx`, `src/app/(front)/auth/login/page.tsx`, `src/app/(front)/auth/register/page.tsx` |
| `leaflet` | si | 1 | `src/components/FilialesMap/FilialesMap.tsx` |
| `lucide-react` | si | 50 | `src/app/(front)/auth/login/page.tsx`, `src/app/(front)/capacitaciones/[id]/page.tsx`, `src/app/(front)/certificado/validar/[publicId]/page.tsx` |
| `motion` | si | 1 | `src/components/ImageGallery/AnimatedGallery.tsx` |
| `next` | si | 69 | `src/app/(front)/auth/forgot-password/page.tsx`, `src/app/(front)/auth/login/page.tsx`, `src/app/(front)/auth/register/page.tsx` |
| `next-auth` | si | 13 | `src/app/(front)/auth/login/page.tsx`, `src/app/(front)/dashboard/layout.tsx`, `src/app/(front)/mi-perfil/page.tsx` |
| `qrcode` | si | 1 | `src/libs/certificates/generateCertificateQrDataUrl.ts` |
| `react` | si | 84 | `src/app/(front)/actividades/page.tsx`, `src/app/(front)/auth/forgot-password/page.tsx`, `src/app/(front)/auth/login/page.tsx` |
| `react-day-picker` | si | 1 | `src/components/ui/calendar.tsx` |
| `react-dropzone` | si | 1 | `src/components/FileUpload/FileUpload.tsx` |
| `react-hook-form` | si | 7 | `src/app/(front)/auth/forgot-password/page.tsx`, `src/app/(front)/auth/login/page.tsx`, `src/app/(front)/auth/register/page.tsx` |
| `react-leaflet` | si | 1 | `src/components/FilialesMap/FilialesMap.tsx` |
| `react-player` | si | 1 | `src/components/Video/video-player.tsx` |
| `resend` | si | 1 | `src/libs/email/resend.ts` |
| `sonner` | si | 6 | `src/app/(front)/donar/page.tsx`, `src/components/ContactForm/ContactForm.tsx`, `src/components/Dashboard/Certificates/CertificatesDashboard.tsx` |
| `tailwind-merge` | si | 1 | `src/libs/utils.ts` |
| `vitest` | si | 1 | `src/test/setup.ts` |

## Imports directos de paquetes no declarados

| Package | Estado | Evidencia |
| --- | --- | --- |
| `framer-motion` | No declarado directo | 32 archivos lo importan; instalado transitivamente por `motion@12.27.1`. |
| `@radix-ui/react-visually-hidden` | No declarado directo | 4 archivos lo importan; instalado transitivamente por paquetes Radix. |
| `@prisma/debug` | No declarado directo | Aparece en `src/generated/prisma/runtime/library.d.ts`; pertenece al cliente generado. |

## Dependencias sin uso confirmado por imports directos

Estos paquetes estan declarados, pero el barrido de imports en `src/**/*.ts(x)` no encontro import directo. Esto no implica que sean removibles; solo queda como diagnostico inicial.

| Package | Tipo | Nota |
| --- | --- | --- |
| `@testing-library/jest-dom` | dev | Puede usarse por setup indirecto o matchers globales; no aparece import directo en el barrido. |
| `date-fns` | prod | Declarada directa; tambien aparece como dependencia de `react-day-picker`; no se detecto import directo del proyecto. |
| `prisma` | dev | CLI usada por scripts/postinstall; no se espera import directo en `src`. |
| `react-dom` | prod | Requerida por React/Next y peers; no se espera necesariamente import directo. |
| `react-use-measure` | prod | No se detecto import directo. |

## Dependencias mal declaradas o inconsistencias relevantes

| Item | Diagnostico |
| --- | --- |
| `@types/qrcode` | Esta en `dependencies` aunque es paquete de tipos; queda marcado como posible dependencia mal ubicada. |
| `framer-motion` | Uso directo sin declaracion directa; depende de que `motion` lo mantenga como transitive dependency. |
| `@radix-ui/react-visually-hidden` | Uso directo sin declaracion directa; depende de transitivas Radix. |
| Paquetes extraneous | `npm ls --all` reporta 5 paquetes extraneous en `node_modules`. |
| Declarado vs instalado | Varias dependencias declaradas con `^` resolvieron versiones bastante mas nuevas en lockfile, por ejemplo Prisma declarado `^6.8.1` instalado `6.19.2`. |
| Build warning | Warning NFT/Turbopack existente relacionado con `next.config.ts`, Prisma generado y API route de noticias. |

## Diagnostico inicial para Fase 2

- Hay paquetes desactualizados en core, tooling, UI, Prisma, NextAuth, formularios y servicios externos.
- Hay 14 vulnerabilidades auditadas: 7 moderadas y 7 altas.
- Las vulnerabilidades con impacto inicial de produccion se concentran en `next`/`postcss` y `next-auth`/`uuid`.
- Las vulnerabilidades con impacto inicial de desarrollo/tooling se concentran en `prisma` CLI y transitivas de tooling.
- Existen imports directos que dependen de transitivas: `framer-motion` y `@radix-ui/react-visually-hidden`.
- Existen paquetes declarados sin uso directo confirmado, especialmente `react-use-measure` y `date-fns`.
- Existen paquetes extraneous en `node_modules`.
- El build disponible pasa, pero con un warning Turbopack/NFT que debe considerarse parte de la linea base.
