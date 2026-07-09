# Rediseno de /redes-sociales

## Problemas visuales detectados

La pagina tenia contenido util, pero las secciones estaban fragmentadas en grids separados, con cards grandes, sombras intensas y gradients decorativos que competian entre si. Las animaciones eran mas llamativas de lo necesario para una pagina institucional y la lectura no tenia una jerarquia consistente entre Instagram, colaboracion especial, marco legal, PDF y cierre.

## Que se rediseno

- Se reorganizo la pagina en bloques visuales mas claros: presentacion, carrusel de Instagram, colaboracion especial, marco legal, PDF y cierre.
- Se unificaron bordes, sombras, fondos, espaciados y encabezados para que las secciones se sientan parte del mismo sistema visual.
- La colaboracion de Julian Weich se integro en una card institucional con encabezado, iconografia y embed conservado.
- El marco legal se redisenio con el mismo lenguaje visual, mejorando jerarquia y legibilidad sin eliminar informacion.
- Se redujo el movimiento visual a microinteracciones sobrias de hover/press.

## Carrusel de Instagram

Los posts actuales se conservaron y se agruparon en un carrusel horizontal con CSS:

- `overflow-x-auto` permite desplazamiento lateral.
- `grid-flow-col` crea una fila continua de cards.
- `snap-x snap-mandatory` mejora el recorrido y el encaje entre publicaciones.
- En mobile funciona con scroll tactil nativo.
- En desktop mantiene una fila prolija de cards con ancho estable.
- Incluye controles con flechas para avanzar o retroceder sin depender de texto instructivo.
- Permite arrastrar horizontalmente con el mouse desde el area del carrusel.

No se agregaron dependencias nuevas.

## Secciones mantenidas sin cambios funcionales

- El PDF sigue usando `PDFViewer` y no se modifico su funcionamiento ni su diseno principal.
- La seccion final "Seguinos en Nuestras Redes" mantiene contenido, links y estructura. Solo se ajustaron microinteracciones para evitar animaciones exageradas.
- No se modificaron backend, base de datos ni APIs.

## Archivos modificados

- `src/app/(front)/redes-sociales/page.tsx`
- `doc/redes-sociales-redesign.md`
