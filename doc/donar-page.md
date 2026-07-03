# Pagina Estatica de Donaciones

## Archivos creados o modificados

- `src/app/(front)/donar/page.tsx`: nueva ruta estatica `/donar` y modal de donacion por transferencia.
- `doc/donar-page.md`: documentacion de la implementacion.

No se modifico backend, Prisma, base de datos, pagos ni navegacion global.

## Estructura de la pagina

La landing se organiza en cinco bloques principales:

1. Hero institucional con imagen de fondo, overlay oscuro leve, titulo principal, bajada y CTA `Donar ahora`.
2. Seccion de campana con etiqueta `Campana en curso`, lugar, monto recaudado, objetivo, barra de progreso y mensaje sobre instalacion/capacitacion.
3. Bloque visual del DEA con `public/images/dea.png`, mostrando avance parcial en color.
4. Seccion de lugar con timeline explicativa del proceso de donacion.
5. CTA final como card clickeable completa que abre el modal de donacion.

El diseno es mobile first y usa grillas responsivas para pasar de una columna en mobile a dos columnas en tablet/desktop.

## Datos estaticos

Estos datos quedaron fijos para la primera version:

- Progreso: `64%`
- Total recaudado: `$1.250.000`
- Objetivo: `$2.000.000`
- Lugar: `Club / Escuela / Espacio publico`
- Mensajes de transparencia: `100% destinado a compra de DEA` y `Publicamos factura y entrega`
- Datos bancarios de ejemplo: Banco, Alias, CBU, Cuenta Corriente en Pesos, Razon Social y CUIT.

El boton `Donar ahora` del hero apunta a la seccion final de la misma pagina. El CTA final fue reemplazado por una card completa con fondo primary, texto `Quiero donar` y enlace visual `Quiero donar ->`; toda la superficie abre el modal informativo. No inicia pagos ni conecta con ninguna pasarela.

## CTA final clickeable

La seccion final ya no usa un boton interno. La card completa funciona como accion principal para abrir el modal de donacion, manteniendo la misma logica existente. En desktop muestra el contenido principal a la izquierda y el texto `Quiero donar ->` a la derecha; en mobile se apila en una sola columna.

La interaccion usa transiciones breves y explicitas de `transform` y `box-shadow`: en hover la card se eleva levemente, aumenta apenas la sombra y el texto de avance se desplaza unos pixeles hacia la derecha. En `active` aplica una escala sutil para dar feedback de presion.

## Modal de donacion por transferencia

El modal usa el `Dialog` existente de `src/components/ui/dialog.tsx`, con clases locales para hacerlo responsive y adaptarlo al estilo de la pagina. Incluye:

- Titulo: `Realizá tu donación`
- Texto introductorio sobre transferencia bancaria.
- Tarjeta destacada con datos bancarios de ejemplo.
- Boton para copiar Alias.
- Boton para copiar CBU.
- Selector inicial entre donacion publica y donacion anonima, con donacion anonima seleccionada por defecto.
- Formulario con Nombre, Apellido, Email y comprobante de pago.
- Input `file` limitado a `image/*` y `application/pdf`.
- Visualizacion del nombre del archivo seleccionado.

La validacion es solo de cliente: comprueba que el comprobante este adjunto y, si la donacion es publica, que Nombre y Apellido esten completos. El Email es opcional. Al enviar, muestra un toast con Sonner:

`¡Muchas gracias por tu donación! Recibimos tu comprobante y lo revisaremos a la brevedad.`

No se envia informacion al backend, no se guardan archivos y no se conecta ninguna API.

### Seleccion de visibilidad de la donacion

Antes de los campos del formulario, el modal muestra la pregunta `Queres que tu nombre aparezca?` y dos tarjetas seleccionables:

- `Si, quiero aparecer en el listado.`
- `Prefiero que mi aporte sea anonimo.`

Solo una opcion puede estar activa. La opcion anonima queda seleccionada por defecto cada vez que se abre el modal. La tarjeta activa se destaca con color primario, icono circular y check visual. El cambio entre donacion anonima y publica se resuelve en cliente: no se guarda esta preferencia ni se envia a un backend.

Cuando la donacion es anonima, el formulario oculta Nombre y Apellido y conserva Email opcional y comprobante de pago. Cuando la donacion es publica, muestra Nombre, Apellido, Email opcional y comprobante de pago. La aparicion de los campos publicos usa una transicion breve de opacidad, altura y desplazamiento, sin agregar dependencias nuevas.

### Correccion de overflow horizontal

El modal presentaba scroll horizontal porque el `DialogContent` heredaba dimensiones rigidas del componente compartido y algunas columnas internas no tenian `min-w-0`. Ademas, valores largos como Alias y CBU podian empujar el ancho disponible.

Se corrigio limitando el modal con `w-[calc(100vw-2rem)]`, `max-w-[calc(100vw-2rem)]`, `box-border` y `overflow-x-hidden`. La grilla interna usa columnas `minmax(0, ...)`, y las columnas, inputs, botones, labels y filas bancarias recibieron `min-w-0`. Los datos bancarios largos usan `break-all` para no desbordar en mobile.

Tambien se corrigio un overflow horizontal que aparecia al intentar enviar el formulario sin adjuntar comprobante. El `input[type=file]` ya no usa `sr-only`: queda posicionado de forma absoluta y transparente dentro del area del dropzone, con `w-full`, `max-w-full`, `min-w-0` y sin participar del flujo visual. Esto permite que la validacion nativa del navegador muestre el mensaje de archivo requerido sin empujar el ancho del formulario ni generar espacio blanco lateral.

## Visual del DEA parcialmente coloreado

La imagen base del DEA se renderiza en escala de grises con `next/image`. Encima se renderiza la misma imagen a color, recortada con `clip-path` hasta el `64%` del ancho. Una linea vertical en el mismo porcentaje marca el limite entre lo alcanzado y lo pendiente.

La parte en color representa el avance logrado por la campana. La parte en blanco y negro representa lo que falta completar.

## Timeline del proceso de donacion

En la seccion ubicada a la derecha de la imagen `Este lugar hoy no tiene DEA`, los `statCards` fueron reemplazados por una timeline vertical explicativa titulada `¿Como funciona tu aporte?`.

La timeline resume seis pasos del proceso:

- Elegimos una institucion.
- Realizas tu aporte.
- Elegis como aparecer.
- Verificamos la donacion.
- Instalamos el DEA.
- Capacitamos gratuitamente.

Cada paso incluye icono circular de Lucide, titulo y descripcion breve. Los iconos estan conectados por una linea vertical y la tarjeta mantiene el ancho aproximado del bloque anterior. La interaccion usa microtransiciones sutiles de color, borde y transform, con soporte para `motion-reduce`, sin agregar dependencias nuevas.

## Pendientes para version dinamica

- Conectar el CTA a una pasarela de pago o flujo real de donacion.
- Reemplazar datos bancarios de ejemplo por datos reales validados por la institucion.
- Enviar el formulario del comprobante a un backend real.
- Guardar comprobantes en storage seguro.
- Registrar nombre, apellido, email y archivo asociado a la donacion.
- Obtener monto, objetivo, porcentaje, donantes y fecha desde una fuente dinamica.
- Registrar y mostrar detalle publico de donaciones.
- Publicar factura, comprobantes y evidencia de entrega cuando existan.
- Reemplazar o actualizar `public/images/club.jpg` cuando el cliente confirme el lugar definitivo de la campana.
- Agregar la ruta `/donar` al menu principal si se decide publicar la campana.

## Recomendaciones futuras

- Mantener el porcentaje del DEA sincronizado con el progreso real de recaudacion.
- Agregar estados de campana: en curso, objetivo alcanzado, DEA comprado, DEA instalado y capacitacion realizada.
- Incorporar testimonios o fotos del lugar solo cuando el cliente confirme contenido real.
- Revisar copy legal y de transparencia antes de activar pagos.
