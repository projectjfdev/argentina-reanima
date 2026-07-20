# Fase 6 - Limpieza de configuraciones incompatibles o deprecadas

Fecha: 2026-07-19

Rama de trabajo: `cache-components-phase-5`

## Objetivo

Eliminar o confirmar la ausencia de configuraciones que ya no son compatibles o quedan deshabilitadas bajo `cacheComponents: true`, sin introducir cache real de dominio.

Referencia oficial usada: la documentacion de Next.js indica que las opciones de Route Segment Config (`dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, entre otras) quedan deshabilitadas cuando `cacheComponents` esta activo y seran deprecadas.

Fuente: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

## Diagnostico de limpieza

### Route Segment Config

Se verifico en `src/app` y `next.config.ts` que no quedan:

- `export const dynamic`
- `export const revalidate`
- `export const fetchCache`
- `export const dynamicParams`
- `experimental_ppr`
- `force-dynamic`
- `force-static`

Los `export const dynamic = "force-dynamic"` que existian antes ya habian sido retirados durante Fase 5 porque bloqueaban directamente el build con `cacheComponents`.

### Cache APIs nuevas

Se verifico que no se introdujo cache real durante esta migracion:

- no hay `"use cache"`;
- no hay `cacheTag`;
- no hay `cacheLife`;
- no hay `revalidateTag`;
- no hay `updateTag`;
- no hay `unstable_cache`.

El unico hallazgo relacionado fue `src/libs/cache/cacheTags.ts`, que contiene nombres de tags futuros pero no aplica cache ni invalidacion por tag.

### Configuracion de Next

`cacheComponents` esta definido en el nivel superior de `next.config.ts`, que es la ubicacion correcta.

No se encontro `experimental.cacheComponents`.

`experimental.serverActions.bodySizeLimit = "20mb"` se conserva porque:

- sigue tipado en Next.js 16.2.10;
- no es una configuracion de Route Segment;
- no es incompatible con Cache Components;
- cambiarlo podria afectar cargas existentes si en el futuro se usan Server Actions con payloads grandes.

`turbopack.root = process.cwd()` se conserva porque:

- no es una configuracion de Route Segment;
- no aparece deprecado en los tipos locales consultados;
- retirarlo no forma parte necesaria de la migracion a Cache Components.

## Cambio realizado en esta fase

Se retiro el placeholder innecesario de `next.config.ts`:

```ts
/* config options here */
```

No se hicieron cambios funcionales de cache.

## Archivos modificados o creados en Fase 6

Modificados:

- `next.config.ts`

Creado:

- `doc/cache/reports-plan-migracion-cache-components/fase-6-limpieza-configuraciones-incompatibles.md`

## Validacion ejecutada

### Busquedas de configuracion

Se ejecutaron busquedas para confirmar ausencia de:

- segment configs incompatibles;
- `force-dynamic` / `force-static`;
- `unstable_cache`;
- directivas o funciones de Cache Components aun no implementadas.

Resultado: no quedan configuraciones incompatibles en `src/app` ni `next.config.ts`.

### Build de produccion

Comando:

```txt
npm run build
```

Resultado: exitoso.

El build sigue mostrando:

```txt
Cache Components enabled
```

Clasificacion relevante:

- APIs privadas, administrativas y criticas: `ƒ` dinamicas.
- `/dashboard/*`, `/mi-perfil`, `/certificado/validar/[publicId]`, `/auth/verify-email` y `/capacitaciones/[id]`: `◐` Partial Prerendering con contenido dinamico.
- Rutas publicas shell como `/`, `/noticias`, `/capacitaciones`, `/donar`, `/campanas-dea`: `○` estaticas.

### Tests

Comando:

```txt
npm run test:run
```

Resultado:

```txt
Test Files  27 passed (27)
Tests       112 passed (112)
```

## Warning persistente no resuelto en esta fase

El build sigue mostrando un warning de Turbopack/NFT:

```txt
./next.config.ts
Encountered unexpected file in NFT list
Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/app/api/news/route.ts
```

Se inspecciono la causa probable y el cliente generado de Prisma contiene usos de:

- `process.cwd()`
- `path.join`
- `path.resolve`
- `fs.existsSync`

No se edito `src/generated/prisma` porque es codigo generado.

Decision: dejar el warning documentado para investigacion en validacion local con `next start` y Vercel Preview. No bloquea Fase 6 porque no corresponde a una configuracion incompatible/deprecada de Cache Components.

## Riesgos restantes

- El arbol de trabajo sigue acumulando cambios de Fases 1 a 6 sin commits separados.
- La advertencia de Turbopack/Prisma podria afectar tracing o tamano de funciones en Vercel; requiere observacion en Preview.
- La limpieza no valida flujos manuales de navegador. Eso pertenece a la siguiente fase de validacion funcional.

## Criterios de aceptacion cubiertos

- No quedan Route Segment Configs incompatibles usadas como mecanismo de frescura.
- `cacheComponents` esta en top-level.
- No se introdujo `unstable_cache`.
- No se introdujo `"use cache"` prematuramente.
- Build de produccion pasa.
- Tests automatizados pasan.

## Proximo paso recomendado

Ejecutar Fase 7: validacion funcional local con `npm run build` + `npm run start`, probando navegacion, autenticacion, dashboard, certificados y donaciones criticas.
