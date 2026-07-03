# Rediseno del Hero de Home

## Componentes modificados

- `src/app/(front)/page.tsx`: se reemplazo la instancia de `BannerHero` por el nuevo `HomeHero`.
- `src/components/BannerHero/HomeHero.tsx`: se agrego un Hero especifico para la Home.

No se modificaron Navbar, Footer, secciones inferiores, backend, Prisma ni el componente compartido `BannerHero`, que sigue disponible para las paginas internas.

## Decisiones de diseno

El nuevo Hero abandona la imagen de fondo a pantalla completa y usa una composicion abierta, sin encuadrar toda la seccion dentro de una card. El layout se divide en dos columnas en desktop: contenido principal a la izquierda e imagen institucional a la derecha.

La columna izquierda prioriza el mensaje con badge, titulo, subtitulo, descripcion y dos CTAs. La columna derecha reutiliza la imagen original de la Home, contenida en un marco redondeado y separado del fondo general para que acompane el mensaje sin dominar toda la pantalla.

Las microinteracciones se limitaron a feedback de presion en los CTAs. Usan `transform`, duracion corta, curva `cubic-bezier(0.23,1,0.32,1)` y respetan `motion-reduce`.

## Mejora de legibilidad

Antes, la lectura dependia del contraste entre texto e imagen de fondo. Ahora el contenido vive sobre blanco, con ancho de linea controlado, escala tipografica mas clara y espacios verticales definidos entre bloques. Esto hace que el mensaje principal se lea primero y que la imagen original funcione como apoyo visual.

## Identidad visual

Se mantuvieron los colores institucionales existentes: celeste `primary` y rojo `secondary`. El slogan principal conserva el tono de Argentina Reanima y se reutilizo la imagen previa del Hero para no perder reconocimiento visual, pero con una presentacion mas limpia e institucional.
