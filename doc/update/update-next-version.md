# Actualizacion de Next.js

## Resumen

Se actualizo el proyecto desde Next.js `15.5.7` a Next.js `16.2.9`, que es la ultima version estable publicada en npm al momento de la actualizacion. React se mantuvo en `19.0.0` porque Next.js `16.2.9` declara compatibilidad con `^19.0.0`.

## Dependencias actualizadas

- `next`: `^15.5.7` -> `^16.2.9`
- `eslint-config-next`: `^15.5.7` -> `^16.2.9`

No se actualizaron dependencias no relacionadas con Next.js.

## Cambios realizados por breaking changes

- `package.json`: se quito `--turbopack` de `npm run dev`. En Next.js 16 Turbopack es el comportamiento por defecto para `next dev`.
- `next.config.ts`: se elimino `devIndicators.buildActivity`, opcion removida en Next.js 16.
- `next.config.ts`: se agrego `turbopack.root: process.cwd()` para fijar la raiz del proyecto y evitar que Next infiera una raiz superior por otros lockfiles.
- `src/middleware.ts` -> `src/proxy.ts`: se migro la convencion deprecated `middleware` a `proxy`, preservando el matcher `"/dashboard/:path*"`.
- `src/proxy.ts`: se cambio el re-export directo de `next-auth/middleware` por `export const proxy = authMiddleware`, porque Next.js 16 exige detectar una funcion exportada como default o como `proxy`.
- `tsconfig.json`: Next.js actualizo automaticamente `jsx` a `react-jsx` y agrego `.next/dev/types/**/*.ts` al `include`.

## Problemas encontrados y resolucion

- El primer build fallo por `devIndicators.buildActivity`; se resolvio quitando esa propiedad.
- El build aviso que `middleware` esta deprecated; se resolvio migrando el archivo a `proxy.ts`.
- El build fallo porque el proxy no exportaba una funcion detectable; se resolvio exportando explicitamente `proxy`.
- Se intento mover `serverActions.bodySizeLimit` al nivel superior de `next.config.ts`, pero Next.js `16.2.9` todavia no lo acepta en sus tipos. Se mantuvo bajo `experimental.serverActions` para conservar el comportamiento existente.

## Validacion

- `npm install next@16.2.9 eslint-config-next@16.2.9`
- `npm run build`: finalizo correctamente.

## Advertencias pendientes

- El build muestra una advertencia no bloqueante de Turbopack/NFT relacionada con el cliente Prisma generado en `src/generated/prisma`. No impide compilar, pero conviene revisarla en una futura tarea si se busca dejar el build sin warnings.
- `npm install` reporto vulnerabilidades moderadas y altas en el arbol de dependencias. No se ejecuto `npm audit fix` para evitar actualizar paquetes no relacionados con Next.js fuera del alcance de esta tarea.
