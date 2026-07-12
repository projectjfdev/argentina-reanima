# Fase 7 - Auditoria, limpieza y evaluacion de majors

Fecha de ejecucion: 2026-07-12

## Objetivo

Cerrar la fase de auditoria y saneamiento sin aplicar `npm audit fix`, clasificar las vulnerabilidades restantes, corregir declaraciones de dependencias detectadas en el inventario y evaluar las majors pendientes sin asumir que deban migrarse.

## Alcance ejecutado

- Revision de `npm audit --json`.
- Revision de `npm outdated --json`.
- Revision de rutas de dependencias vulnerables con `npm explain`.
- Revision de imports directos contra dependencias declaradas.
- Limpieza de declaraciones directas sin uso confirmado.
- Declaracion explicita de paquetes importados directamente.
- Clasificacion de majors pendientes.
- Validacion con instalacion limpia, tests y build.

No se ejecuto `npm audit fix` ni `npm audit fix --force`.

## Cambios aplicados en esta fase

### Dependencias declaradas por imports directos

Se declararon como dependencias directas porque el codigo las importa directamente:

| Paquete | Version | Motivo |
| --- | ---: | --- |
| `framer-motion` | `^12.42.2` | Hay imports directos desde componentes cliente. Antes quedaba resuelta por `motion`, lo que dejaba al proyecto dependiendo de una transitiva. |
| `@radix-ui/react-visually-hidden` | `^1.2.7` | Hay imports directos desde componentes UI. Antes quedaba resuelta por otros paquetes Radix. |

### Reclasificacion dev/prod

| Paquete | Cambio | Motivo |
| --- | --- | --- |
| `@types/qrcode` | `dependencies` -> `devDependencies` | Es un paquete de tipos, no requerido en runtime de produccion. |

### Dependencias directas removidas

| Paquete | Resultado | Motivo |
| --- | --- | --- |
| `react-use-measure` | Removida | No se detectaron imports directos en `src`, `tests` ni configuraciones revisadas. |
| `date-fns` | Removida como directa | No se detectaron imports directos. Sigue instalada como transitiva de `react-day-picker@9.14.0`. |

## Estado de auditoria

Resultado actual de `npm audit --json`:

- Total: 6 vulnerabilidades.
- Moderadas: 5.
- Altas: 1.
- Criticas: 0.

### Vulnerabilidades que afectan produccion

| Paquete auditado | Severidad | Ruta | Diagnostico |
| --- | --- | --- | --- |
| `postcss` | Moderada | `next -> postcss@8.4.31` | Queda anidada dentro de `next@16.2.10`. El `postcss` directo usado por tooling esta en `8.5.17`, no es el nodo vulnerable. |
| `next` | Moderada | Directa | El reporte deriva de la dependencia anidada `postcss`. `npm audit` sugiere `next@9.3.3`, que es un downgrade mayor e incompatible con el proyecto. No se debe aplicar automaticamente. |
| `uuid` | Moderada | `next-auth -> uuid@8.3.2` | Queda como transitiva de `next-auth@4.24.14`. El vector requiere revisar uso efectivo de UUID dentro de NextAuth antes de forzar migracion. |
| `next-auth` | Moderada | Directa | El reporte deriva de `next` y `uuid`. `npm audit` sugiere `next-auth@3.29.10`, que es un downgrade mayor e incompatible. No se debe aplicar automaticamente. |

### Vulnerabilidades de herramientas de desarrollo

| Paquete auditado | Severidad | Ruta | Diagnostico |
| --- | --- | --- | --- |
| `brace-expansion` | Moderada | ESLint ecosystem -> `minimatch@3.1.5` -> `brace-expansion@1.1.12` | Afecta tooling de lint/configuracion, no runtime de produccion. |
| `flatted` | Alta | `eslint -> file-entry-cache -> flat-cache -> flatted@3.3.3` | Afecta cache/tooling de ESLint. No hay script de lint activo en `package.json`, pero sigue siendo deuda de devDependencies. |

## Rutas explicadas con npm explain

| Paquete | Resultado |
| --- | --- |
| `brace-expansion` | Nodo vulnerable `1.1.12` llega por `minimatch@3.1.5` usado por paquetes del ecosistema ESLint. Tambien existe `brace-expansion@5.0.7`, pero no es el nodo vulnerable. |
| `flatted` | Llega por `eslint@9.39.5 -> file-entry-cache@8.0.0 -> flat-cache@4.0.1`. |
| `uuid` | Llega por `next-auth@4.24.14`. |
| `postcss` | Hay dos ramas: `postcss@8.5.17` en tooling, no vulnerable, y `postcss@8.4.31` anidado dentro de `next@16.2.10`, vulnerable segun audit. |

## Estado de npm outdated

Despues de la limpieza, `npm outdated --json` solo lista majors pendientes:

| Paquete | Actual | Wanted | Latest | Tipo |
| --- | ---: | ---: | ---: | --- |
| `@prisma/client` | `6.19.3` | `6.19.3` | `7.8.0` | Major |
| `prisma` | `6.19.3` | `6.19.3` | `7.8.0` | Major |
| `@types/bcrypt` | `5.0.2` | `5.0.2` | `6.0.0` | Major |
| `@types/node` | `20.19.43` | `20.19.43` | `26.1.1` | Major |
| `eslint` | `9.39.5` | `9.39.5` | `10.7.0` | Major |
| `lucide-react` | `0.511.0` | `0.511.0` | `1.24.0` | Major |
| `react-day-picker` | `9.14.0` | `9.14.0` | `10.0.1` | Major |
| `react-dropzone` | `14.4.1` | `14.4.1` | `16.0.0` | Major |
| `react-player` | `2.16.1` | `2.16.1` | `3.4.0` | Major |
| `typescript` | `5.9.3` | `5.9.3` | `7.0.2` | Major |

No quedan patch ni minor pendientes reportadas por `npm outdated`.

## Evaluacion de majors

| Paquete | Latest | Clasificacion | Justificacion |
| --- | ---: | --- | --- |
| `@types/bcrypt` | `6.0.0` | Recomendada ahora | Es un paquete de tipos, de bajo riesgo relativo. Debe aplicarse aislado y validar typecheck/build porque el runtime sigue en `bcrypt@6.0.0`. |
| `@prisma/client` / `prisma` | `7.8.0` | Postergable | La rama `6.x` quedo actualizada y validada. Prisma 7 debe tratarse como migracion propia por posible impacto en generacion, cliente, motores, schema y CI. |
| `@types/node` | `26.1.1` | Postergable | El proyecto corre con Node 20.19.0. Subir tipos a Node 26 puede exponer APIs no disponibles en runtime objetivo. |
| `eslint` | `10.7.0` | Postergable | No hay script de lint activo y `eslint.config.mjs` esta comentado. Conviene resolverlo en una tarea de tooling/lint separada. |
| `lucide-react` | `1.24.0` | Postergable | Declara peer compatible con React 19. El proyecto tiene muchos imports de iconos; migrar major requiere revision visual y de nombres/exportaciones. |
| `react-day-picker` | `10.0.1` | Postergable | Declara peer amplio compatible con React. Afecta calendario/UI; requiere pruebas manuales de campos de fecha antes de migrar. |
| `react-dropzone` | `16.0.0` | Postergable | Declara peer amplio, pero afecta subida de archivos y flujos administrativos. Debe migrarse aislado con pruebas de carga y validacion de tipos. |
| `react-player` | `3.4.0` | No recomendada actualmente | Aunque declara compatibilidad con React 19, es una major sobre multimedia. Requiere revisar API y paginas con player; beneficio inmediato no justifica mezclarlo con mantenimiento general. |
| `typescript` | `7.0.2` | Postergable | El proyecto compila con `5.9.3`. TypeScript major debe evaluarse junto con Next.js, Prisma, Vitest y configuracion TS, no como cambio automatico. |
| `next-auth` / Auth.js v5 | N/A en `next-auth` latest | Postergable | `next-auth@4.24.14` sigue siendo la latest del paquete `next-auth` y declara peer compatible con Next 16 y React 19. Migrar a Auth.js v5 debe ser proyecto independiente. |

## Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm ci` | OK. Ejecuta `prisma generate` desde `postinstall`. |
| `npm run test:run` | OK. 1 archivo de test, 1 test pasado. |
| `npm run build` | OK. Compilacion, TypeScript y generacion de paginas correctas. |
| `npm audit --json` | 6 vulnerabilidades restantes: 5 moderadas, 1 alta. Sin criticas. |
| `npm outdated --json` | Solo majors pendientes. Sin patch/minor pendientes. |
| `npm ls framer-motion @radix-ui/react-visually-hidden @types/qrcode date-fns react-use-measure --depth=2` | OK. `framer-motion`, `@radix-ui/react-visually-hidden` y `@types/qrcode` declaradas. `date-fns` queda solo como transitiva de `react-day-picker`. `react-use-measure` no queda instalada. |
| `npm ls --all --json` | Detecta 5 paquetes `extraneous` persistentes despues de `npm ci`: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`. |

## Warning de build

El build mantiene el warning ya registrado en fases anteriores:

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

No se agregaron nuevos warnings en esta fase.

## Inconsistencias residuales

### Paquetes extraneous persistentes

`npm ls --all --json` sigue informando estos paquetes como extraneous incluso despues de `npm ci`:

- `@emnapi/core@1.11.1`
- `@emnapi/runtime@1.11.1`
- `@emnapi/wasi-threads@1.2.2`
- `@napi-rs/wasm-runtime@0.2.12`
- `@tybys/wasm-util@0.10.3`

No se eliminaron manualmente. Al persistir despues de instalacion limpia, corresponde tratarlos como hallazgo de entorno/arbol nativo opcional y no como dependencia directa del proyecto.

### Dependencias sin imports directos confirmados

Quedan sin imports directos propios pero justificadas por su rol:

- `react-dom`: peer/runtime requerido por Next.js y React.
- `@testing-library/jest-dom`: soporte de testing; revisar si se mantiene cuando se amplie la suite.

## Criterios de aceptacion de la fase

- Dependencias importadas directamente ya no dependen de resolucion transitiva.
- Paquetes de tipos quedaron en `devDependencies`.
- Dependencias directas sin uso confirmado fueron removidas sin romper instalacion, tests ni build.
- Vulnerabilidades restantes quedaron clasificadas por impacto productivo o desarrollo.
- Majors pendientes quedaron evaluadas con recomendacion.
- No se aplicaron fixes automaticos de auditoria ni migraciones major.

## Estado final

Fase 7 completada con validacion tecnica correcta.

Riesgo residual principal:

- Vulnerabilidades de produccion siguen dependiendo de fixes upstream o decisiones mayores en `next` / `next-auth`.
- Vulnerabilidades de desarrollo quedan en ramas de ESLint y deben tratarse en una fase de tooling/lint si se decide activar lint formalmente.
- Majors pendientes no bloquean el estado actual porque no hay patch/minor pendientes y el build pasa.

## Recomendacion para la Fase 8

Ejecutar validacion final y rollback documental con:

- `npm ci`
- `npx prisma generate`
- `npm run test:run`
- `npm run build`
- `npm audit --json`
- `npm outdated --json`
- pruebas manuales de login, registro, recuperacion de contrasena, panel administrador, certificados, subida de archivos, envio de emails, Leaflet y ReactPlayer.
