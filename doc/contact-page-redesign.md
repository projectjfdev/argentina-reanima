# Rediseno de Pagina de Contacto

## Alcance

Se redisenaron la pagina `/contacto` y el componente visual del formulario sin modificar backend, rutas, EmailJS, nombres de campos ni comportamiento de envio. El objetivo fue convertir el contacto institucional en el foco principal y mejorar claridad, confianza y legibilidad.

## Cambios de layout

- Se reemplazo el uso de `BannerHero` global por un hero propio para contacto. Motivo: el hero global esta optimizado para home y no daba una jerarquia clara para una pagina de accion.
- Se agrego un encabezado con imagen institucional, overlay oscuro controlado y llamadas a accion directas. Motivo: presentar contexto sin perder contraste ni foco.
- Se incorporaron tres tarjetas rapidas de contacto debajo del hero: email, telefono y tipo de consultas. Motivo: permitir acceso inmediato a canales importantes antes del formulario.
- El formulario se movio a una seccion dedicada con fondo `slate-50`. Motivo: separar claramente la accion principal del contenido introductorio.

## Cambios del formulario

- Se reorganizo el contenido en dos columnas en desktop: soporte institucional a la izquierda y formulario a la derecha. En mobile se apila en una sola columna.
- Se mejoraron labels, placeholders, alturas de inputs, contraste y foco visual.
- Se mantuvieron los atributos `name`: `name`, `lastname`, `email`, `subject`, `message`. Motivo: conservar compatibilidad con EmailJS.
- El boton principal usa `primary`, estado disabled durante envio y texto mas especifico: `Enviar mensaje`.
- Se agrego feedback visible para `resultado` ademas del toast existente.

## Decisiones visuales

- Paleta sobria: blanco, slate y celeste institucional como color de accion.
- Bordes y radios moderados (`rounded-lg`) para evitar aspecto de plantilla.
- Sombras contenidas solo en el formulario principal para reforzar foco.
- Iconos de `lucide-react` usados como ayudas visuales, no como decoracion excesiva.
- Mayor aire entre secciones y lectura en bloques cortos para mejorar confianza.

## Animaciones

- Como `emil-design-eng` y `review-animations` no estan disponibles en esta sesion, se realizo revision manual.
- Se usaron entradas con `motion` de 0.38s a 0.45s, desplazamientos maximos de 18px y easing `easeOut`.
- Las tarjetas solo tienen hover leve de `-0.5` y cambio sutil de borde/sombra.
- No se agregaron loops, rebotes ni animaciones que distraigan del formulario.

## Validacion

- `npm run build` finalizo correctamente.
- Persiste una advertencia no bloqueante de Turbopack/NFT asociada a Prisma generado, ya existente y fuera del alcance de este rediseño.
