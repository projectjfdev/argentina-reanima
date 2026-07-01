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
4. Seccion de lugar, transparencia, estadisticas y CTA final.
5. Modal para informar una donacion realizada por transferencia bancaria.

El diseno es mobile first y usa grillas responsivas para pasar de una columna en mobile a dos columnas en tablet/desktop.

## Datos estaticos

Estos datos quedaron fijos para la primera version:

- Progreso: `62%`
- Total recaudado: `$1.250.000`
- Objetivo: `$2.000.000`
- Lugar: `Club / Escuela / Espacio publico`
- Cantidad de donantes: `128 personas`
- Ultima actualizacion: `01/07/2026`
- Mensajes de transparencia: `100% destinado a compra de DEA` y `Publicamos factura y entrega`
- Datos bancarios de ejemplo: Banco, Alias, CBU, Cuenta Corriente en Pesos, Razon Social y CUIT.

El boton `Donar ahora` del hero apunta a la seccion final de la misma pagina. El boton final `Donar ahora` abre un modal informativo; no inicia pagos ni conecta con ninguna pasarela.

## Modal de donacion por transferencia

El modal usa el `Dialog` existente de `src/components/ui/dialog.tsx`, con clases locales para hacerlo responsive y adaptarlo al estilo de la pagina. Incluye:

- Titulo: `Realizá tu donación`
- Texto introductorio sobre transferencia bancaria.
- Tarjeta destacada con datos bancarios de ejemplo.
- Boton para copiar Alias.
- Boton para copiar CBU.
- Formulario con Nombre, Apellido, Email y comprobante de pago.
- Input `file` limitado a `image/*` y `application/pdf`.
- Visualizacion del nombre del archivo seleccionado.

La validacion es solo de cliente: comprueba que los campos y el archivo esten completos. Al enviar, muestra un toast con Sonner:

`¡Muchas gracias por tu donación! Recibimos tu comprobante y lo revisaremos a la brevedad.`

No se envia informacion al backend, no se guardan archivos y no se conecta ninguna API.

### Correccion de overflow horizontal

El modal presentaba scroll horizontal porque el `DialogContent` heredaba dimensiones rigidas del componente compartido y algunas columnas internas no tenian `min-w-0`. Ademas, valores largos como Alias y CBU podian empujar el ancho disponible.

Se corrigio limitando el modal con `w-[calc(100vw-2rem)]`, `max-w-[calc(100vw-2rem)]`, `box-border` y `overflow-x-hidden`. La grilla interna usa columnas `minmax(0, ...)`, y las columnas, inputs, botones, labels y filas bancarias recibieron `min-w-0`. Los datos bancarios largos usan `break-all` para no desbordar en mobile.

## Visual del DEA parcialmente coloreado

La imagen base del DEA se renderiza en escala de grises con `next/image`. Encima se renderiza la misma imagen a color, recortada con `clip-path` hasta el `62%` del ancho. Una linea vertical en el mismo porcentaje marca el limite entre lo alcanzado y lo pendiente.

La parte en color representa el avance logrado por la campana. La parte en blanco y negro representa lo que falta completar.

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
