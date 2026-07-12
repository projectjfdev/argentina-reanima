# Fase 3 - UI, formularios y librerias cliente

Fecha de ejecucion: 2026-07-12.

Alcance ejecutado: patches/minors compatibles de UI, formularios, Tailwind, animacion y librerias cliente/DOM. No se aplicaron majors. No se actualizaron Prisma, NextAuth, Cloudinary ni Resend.

## Paquetes actualizados

| Grupo | Package | Antes | Despues | Tipo |
| --- | --- | --- | --- | --- |
| Radix UI | `@radix-ui/react-accordion` | `1.2.12` | `1.2.16` | Patch |
| Radix UI | `@radix-ui/react-dialog` | `1.1.15` | `1.1.19` | Patch |
| Radix UI | `@radix-ui/react-label` | `2.1.8` | `2.1.11` | Patch |
| Radix UI | `@radix-ui/react-navigation-menu` | `1.2.14` | `1.2.18` | Patch |
| Radix UI | `@radix-ui/react-select` | `2.2.6` | `2.3.3` | Minor |
| Radix UI | `@radix-ui/react-separator` | `1.1.8` | `1.1.11` | Patch |
| Radix UI | `@radix-ui/react-slot` | `1.2.4` | `1.3.0` | Minor |
| Radix UI | `@radix-ui/react-tooltip` | `1.2.8` | `1.2.12` | Patch |
| Tailwind | `@tailwindcss/postcss` | `4.1.18` | `4.3.2` | Minor |
| Tailwind | `tailwindcss` | `4.1.18` | `4.3.2` | Minor |
| Animacion | `motion` | `12.27.1` | `12.42.2` | Minor |
| Formularios | `react-hook-form` | `7.71.1` | `7.81.0` | Minor |
| Calendario | `react-day-picker` | `9.13.0` | `9.14.0` | Patch |
| Uploads | `react-dropzone` | `14.3.8` | `14.4.1` | Minor |
| Utilidades UI | `date-fns` | `4.1.0` | `4.4.0` | Minor |
| Utilidades UI | `tailwind-merge` | `3.4.0` | `3.6.0` | Minor |

## Paquetes no actualizados por alcance

| Package | Motivo |
| --- | --- |
| `lucide-react` | Solo tiene major disponible (`1.x`); queda fuera de Fase 3. |
| `react-player` | `wanted` igual a current; major `3.x` fuera de alcance. |
| `react-leaflet` / `leaflet` | Sin update listado por `npm outdated`. |
| `react-use-measure` | Sin update listado por `npm outdated`. |
| `cloudinary` / `resend` | Servicios externos, Fase 4. |
| `prisma` / `@prisma/client` | Fase 5. |
| `next-auth` | Fase 6. |

## Cambios de arbol

`npm install` reporto:

```text
added 1 package, removed 10 packages, changed 56 packages
audited 610 packages
11 vulnerabilities (5 moderate, 6 high)
```

`npm ci` posterior reporto:

```text
added 609 packages, and audited 610 packages
11 vulnerabilities (5 moderate, 6 high)
```

Prisma `postinstall` ejecuto `prisma generate` con Prisma Client `v6.19.2`. El aviso de Prisma `6.19.2 -> 7.8.0` es informativo de major disponible y queda fuera de esta fase.

## Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `npm install <paquetes-fase-3>` | OK. Actualizo solo UI/formularios/cliente dentro de wanted. |
| `npm ci` | OK. Instalacion limpia y `prisma generate` OK. |
| `npm run test:run` | OK. 1 test pasado. |
| `npm run build` | OK. Next `16.2.10`, 38 paginas generadas. |
| `npm ls react react-dom` | OK. React/React DOM `19.2.7` dedupeados; sin error de peer dependency. |
| `npm audit --json` | Exit code `1` por vulnerabilidades restantes; sin incremento respecto de Fase 2. |
| `npm outdated --json` | Exit code `1` por paquetes restantes fuera de alcance. |
| `npm ls --all --json` | Exit code `0`; persisten paquetes `extraneous` ya detectados. |

## Validacion

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

Diagnostico: es el mismo warning registrado en Fase 1 y Fase 2. No se detectaron warnings nuevos.

Compatibilidad React:

- `npm ls react react-dom` finalizo correctamente.
- `react@19.2.7` y `react-dom@19.2.7` aparecen dedupeados en Radix, Motion/Framer Motion, Next, NextAuth, Testing Library, Day Picker, Dropzone, React Leaflet, React Player, React Hook Form y Sonner.
- No se observaron errores de peer dependency.

## Estado posterior de `npm audit`

| Severidad | Despues Fase 2 | Despues Fase 3 |
| --- | ---: | ---: |
| Moderate | 5 | 5 |
| High | 6 | 6 |
| Critical | 0 | 0 |
| Total | 11 | 11 |

Vulnerabilidades restantes sin cambios:

| Package | Severidad | Alcance inicial |
| --- | --- | --- |
| `next` / `postcss` | moderate | Produccion |
| `next-auth` / `uuid` | moderate | Produccion |
| `prisma` / `@prisma/config` / `effect` | high | Desarrollo/tooling |
| `brace-expansion` | moderate | Tooling/transitiva |
| `defu` | high | Pendiente de ruta exacta |
| `flatted` | high | Pendiente de ruta exacta |
| `lodash` | high | Pendiente de ruta exacta |

## Estado posterior de `npm outdated`

Paquetes de Fase 3 que quedaron en `wanted`:

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| `@radix-ui/react-accordion` | `1.2.16` | `1.2.16` | `1.2.16` |
| `@radix-ui/react-dialog` | `1.1.19` | `1.1.19` | `1.1.19` |
| `@radix-ui/react-label` | `2.1.11` | `2.1.11` | `2.1.11` |
| `@radix-ui/react-navigation-menu` | `1.2.18` | `1.2.18` | `1.2.18` |
| `@radix-ui/react-select` | `2.3.3` | `2.3.3` | `2.3.3` |
| `@radix-ui/react-separator` | `1.1.11` | `1.1.11` | `1.1.11` |
| `@radix-ui/react-slot` | `1.3.0` | `1.3.0` | `1.3.0` |
| `@radix-ui/react-tooltip` | `1.2.12` | `1.2.12` | `1.2.12` |
| `@tailwindcss/postcss` | `4.3.2` | `4.3.2` | `4.3.2` |
| `tailwindcss` | `4.3.2` | `4.3.2` | `4.3.2` |
| `motion` | `12.42.2` | `12.42.2` | `12.42.2` |
| `react-hook-form` | `7.81.0` | `7.81.0` | `7.81.0` |
| `react-day-picker` | `9.14.0` | `9.14.0` | `10.0.1` |
| `react-dropzone` | `14.4.1` | `14.4.1` | `16.0.0` |
| `date-fns` | `4.4.0` | `4.4.0` | `4.4.0` |
| `tailwind-merge` | `3.6.0` | `3.6.0` | `3.6.0` |

Paquetes todavia listados por `npm outdated` pertenecen a fases posteriores o majors no incluidas:

- Prisma y `@prisma/client`: Fase 5.
- NextAuth: Fase 6.
- Cloudinary y Resend: Fase 4.
- Majors postergables/no incluidas: `lucide-react`, `react-day-picker@10`, `react-dropzone@16`, `react-player@3`, `typescript@7`, `eslint@10`, `@types/node@26`, `@types/bcrypt@6`.

## Estado posterior de `npm ls --all`

`npm ls --all --json` finalizo correctamente, pero persisten los mismos paquetes `extraneous` ya observados:

| Package extraneous |
| --- |
| `@emnapi/core@1.11.1` |
| `@emnapi/runtime@1.11.1` |
| `@emnapi/wasi-threads@1.2.2` |
| `@napi-rs/wasm-runtime@0.2.12` |
| `@tybys/wasm-util@0.10.3` |

## Validaciones manuales pendientes

No se levanto servidor local ni se hicieron pruebas manuales navegadas en browser durante esta fase. Quedan pendientes para validacion funcional:

- Login, registro y recuperacion de contrasena.
- Modales, selects y tooltips.
- Dashboard admin.
- Subida de archivos con Dropzone.
- `/filiales` con Leaflet.
- Paginas/componentes con ReactPlayer.
- Formularios de cursos, noticias, contacto y certificados.

## Diagnostico de cierre

- Fase 3 completada.
- Instalacion limpia validada con `npm ci`.
- Tests pasan.
- Build pasa.
- React 19 no muestra errores de peer dependency.
- No aparecieron warnings nuevos; persiste el warning NFT/Turbopack de la linea base.
- `npm audit` se mantiene en 11 vulnerabilidades.
- No se aplicaron majors.
- No se tocaron Prisma, NextAuth ni servicios externos.

## Pendientes para fases siguientes

- Fase 4: servicios externos (`cloudinary`, `resend`, EmailJS si corresponde).
- Fase 5: Prisma 6.x.
- Fase 6: NextAuth 4.x.
- Fase 7: auditoria, limpieza, paquetes `extraneous`, imports transitivos directos y evaluacion de majors.
