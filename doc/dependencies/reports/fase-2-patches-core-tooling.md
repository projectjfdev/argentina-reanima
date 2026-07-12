# Fase 2 - Patches de core y tooling

Fecha de ejecucion: 2026-07-12.

Alcance ejecutado: patches de Core y Tooling/testing segun `doc/dependencies/plan/plan.md`. No se aplicaron majors ni actualizaciones de UI, servicios externos, Prisma ni NextAuth.

## Paquetes actualizados

| Package | Tipo | Antes | Despues | Motivo |
| --- | --- | --- | --- | --- |
| `next` | prod | `16.2.9` | `16.2.10` | Patch de core. |
| `react` | prod | `19.2.3` | `19.2.7` | Patch de core; alineado con `react-dom`. |
| `react-dom` | prod | `19.2.3` | `19.2.7` | Patch de core; alineado con `react`. |
| `eslint` | dev | `9.39.2` | `9.39.5` | Patch de tooling. |
| `eslint-config-next` | dev | `16.2.9` | `16.2.10` | Patch alineado con Next. |
| `@eslint/eslintrc` | dev | `3.3.3` | `3.3.6` | Patch de tooling. |
| `@types/node` | dev | `20.19.30` | `20.19.43` | Patch de tipos dentro de Node 20. |
| `@types/react` | dev | `19.2.8` | `19.2.17` | Patch de tipos dentro de React 19. |

## Archivos modificados

| Archivo | Motivo |
| --- | --- |
| `package.json` | Actualizacion de rangos declarados para los patches de Fase 2. |
| `package-lock.json` | Resolucion actualizada del arbol de dependencias. |
| `doc/dependencies/reports/fase-2-patches-core-tooling.md` | Reporte de la fase. |

`npm ci` ejecuto `postinstall`, que corrio `prisma generate`. No quedaron cambios detectados en `src/generated/prisma` segun `git status`.

## Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `npm install next@16.2.10 react@19.2.7 react-dom@19.2.7 eslint@9.39.5 eslint-config-next@16.2.10 @eslint/eslintrc@3.3.6 @types/node@20.19.43 @types/react@19.2.17` | OK. `changed 16 packages`; audit preliminar: 11 vulnerabilidades. |
| `npm ci` | OK. Instalo 618 paquetes, audito 619 y ejecuto `prisma generate` con Prisma Client `v6.19.2`. |
| `npm run test:run` | OK. 1 archivo de test, 1 test pasado. |
| `npm run build` | OK. Next.js `16.2.10`; 38 paginas generadas. |
| `npm audit --json` | Exit code `1` por vulnerabilidades restantes; total bajo a 11. |
| `npm outdated --json` | Exit code `1` por paquetes restantes fuera de fecha. |
| `npm ls --all --json` | Exit code `0`; mantiene los mismos paquetes `extraneous` ya detectados en Fase 1. |

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

Diagnostico: es el mismo warning registrado en Fase 1. No se detectaron warnings nuevos.

## Estado posterior de `npm audit`

| Severidad | Antes Fase 2 | Despues Fase 2 |
| --- | ---: | ---: |
| Moderate | 7 | 5 |
| High | 7 | 6 |
| Critical | 0 | 0 |
| Total | 14 | 11 |

Vulnerabilidades restantes:

| Package | Severidad | Directa | Alcance inicial |
| --- | --- | --- | --- |
| `next` | moderate | si | Produccion |
| `postcss` | moderate | no | Produccion, transitiva de `next` |
| `next-auth` | moderate | si | Produccion |
| `uuid` | moderate | no | Produccion, transitiva de `next-auth` |
| `prisma` | high | si | Desarrollo/tooling |
| `@prisma/config` | high | no | Desarrollo/tooling |
| `effect` | high | no | Desarrollo/tooling |
| `brace-expansion` | moderate | no | Tooling/transitiva |
| `defu` | high | no | Pendiente de ruta exacta |
| `flatted` | high | no | Pendiente de ruta exacta |
| `lodash` | high | no | Pendiente de ruta exacta |

Vulnerabilidades que dejaron de aparecer respecto de Fase 1:

- `ajv`
- `js-yaml`
- `minimatch`

## Estado posterior de `npm outdated`

Los paquetes de Fase 2 quedaron en `wanted`:

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| `next` | `16.2.10` | `16.2.10` | `16.2.10` |
| `react` | `19.2.7` | `19.2.7` | `19.2.7` |
| `react-dom` | `19.2.7` | `19.2.7` | `19.2.7` |
| `eslint` | `9.39.5` | `9.39.5` | `10.7.0` |
| `eslint-config-next` | `16.2.10` | `16.2.10` | `16.2.10` |
| `@eslint/eslintrc` | `3.3.6` | `3.3.6` | `3.3.6` |
| `@types/node` | `20.19.43` | `20.19.43` | `26.1.1` |
| `@types/react` | `19.2.17` | `19.2.17` | `19.2.17` |

Paquetes todavia listados por `npm outdated` pertenecen a fases posteriores o majors no incluidas en Fase 2: Prisma, NextAuth, Radix/UI, Tailwind, formularios, servicios externos, multimedia, uploads y majors postergables.

## Estado posterior de `npm ls --all`

`npm ls --all --json` finalizo correctamente, pero sigue reportando los mismos paquetes `extraneous` ya observados en Fase 1:

| Package extraneous |
| --- |
| `@emnapi/core@1.11.1` |
| `@emnapi/runtime@1.11.1` |
| `@emnapi/wasi-threads@1.2.2` |
| `@napi-rs/wasm-runtime@0.2.12` |
| `@tybys/wasm-util@0.10.3` |

## Diagnostico de cierre

- Fase 2 completada.
- Instalacion limpia validada con `npm ci`.
- Tests pasan.
- Build pasa.
- No aparecieron warnings nuevos; persiste el warning NFT/Turbopack de la linea base.
- Vulnerabilidades auditadas bajaron de 14 a 11.
- No se aplicaron majors.
- No se modificaron dependencias fuera del alcance de Core y Tooling/testing.

## Pendientes para fases siguientes

- Vulnerabilidades restantes de produccion relacionadas con `next`/`postcss` y `next-auth`/`uuid`.
- Vulnerabilidades restantes de desarrollo/tooling relacionadas con Prisma y transitivas.
- Paquetes UI/formularios/cliente pendientes de Fase 3.
- Servicios externos pendientes de Fase 4.
- Prisma 6.x pendiente de Fase 5.
- NextAuth 4.x pendiente de Fase 6.
- Limpieza de `extraneous` y evaluacion de majors pendiente de Fase 7.
