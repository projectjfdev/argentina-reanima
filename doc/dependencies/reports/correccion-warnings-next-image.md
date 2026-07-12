# Correccion de warnings next/image

Fecha: 2026-07-12

## Objetivo

Eliminar warnings de `next/image` sin cambiar la configuracion global de imagenes, sin tocar URLs de Cloudinary y sin modificar layouts fuera de lo necesario.

## Archivos modificados

| Archivo | Cambio | Warning corregido |
| --- | --- | --- |
| `src/components/BannerHero/BannerHero.tsx` | Se elimino `quality={100}`. | Corrige `is using quality "100" which is not configured` para banners como `Ca%C3%B1uelas-97_rpyvyl_amuuye.jpg`, `ley27159_gmfwyq.jpg`, `IMG_8319_a7pfch.jpg` y `/images/banner-filiales.jpg`. |
| `src/components/FeatureComponent/FeatureComponent.tsx` | Se cambio la imagen a `fill` con `sizes`, manteniendo `h-full w-full object-cover` en el contenedor existente. | Corrige `has either width or height modified, but not the other` para `step2_mdfnqi.jpg` y `/images/5.jpeg`. |
| `src/components/BannerHero/HomeHero.tsx` | Se agrego `h-auto` junto a `w-full`. | Previene warning de proporcion en imagen con ancho CSS. |
| `src/components/BannerHero/BannerHomenaje.tsx` | Se agrego `h-auto` junto a `w-full`. | Previene warning de proporcion en imagen con ancho CSS. |
| `src/components/GalleryScroll/GalleryScroll.tsx` | Se quito `h-full` redundante y se dejo `size-full`. | Evita declarar altura dos veces en imagen de galeria sin cambiar el contenedor. |

## Quality

- Se elimino `quality={100}`.
- No se agrego `qualities: [75, 100]` en `next.config.ts`.
- Se mantuvo `images.unoptimized = true`.
- Busqueda final: no quedan usos de `quality={` en `src`.

## Ajustes de proporcion

- Se agrego `h-auto` en imagenes con `w-full` de `HomeHero` y `BannerHomenaje`.
- No se agrego `w-auto` porque los casos corregidos no usan altura fija aislada.
- En `FeatureComponent` se uso `fill` porque esas imagenes deben cubrir un contenedor fijo; agregar `h-auto` habria cambiado el comportamiento visual.

## Validacion

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Falla por errores preexistentes en `src/test/environment.test.tsx`: `describe`, `it` y `expect` no estan tipados como globals para TypeScript. No esta relacionado con `next/image`. |
| `npm run test:run` | OK. 1 archivo, 1 test pasado. |
| `npm run build` | OK. Build productivo pasa. Mantiene solo el warning preexistente de Turbopack/NFT en `next.config.ts -> src/generated/prisma/index.js -> src/app/api/news/[id]/route.ts`. |

## Verificacion en dev

Ya habia un `next dev` activo en `http://localhost:3000`.

Se cargaron estas rutas:

- `/capacitaciones`
- `/noticias`
- `/marco-normativo`
- `/quienes-somos`
- `/filiales`

Resultado:

- Todas respondieron `200`.
- En las nuevas lineas del log `.next/dev/logs/next-development.log` no aparecieron warnings nuevos con:
  - `has either width or height modified, but not the other`
  - `quality "100"`
  - `next-image-unconfigured-qualities`

## Estado final

Correccion completada sin cambios en `next.config.ts`, sin cambiar URLs de Cloudinary y sin refactors.
