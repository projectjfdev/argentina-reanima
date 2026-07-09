# Rediseno de Navbar

## Problema detectado

El navbar anterior tenia poca separacion visual respecto del contenido y en mobile el menu se veia poco estructurado. Los links aparecian como una lista larga con espaciados irregulares, jerarquia debil y targets tactiles mejorables.

## Cambios en desktop

- Se agrego borde inferior sutil y sombra suave para marcar donde empieza y termina el navbar.
- Se mantuvo una estetica institucional con fondo blanco translucido y `backdrop-blur`.
- Se normalizaron alturas, espaciados y estados hover/focus de los links.
- El dropdown `Mas` conserva las mismas rutas, pero usa tarjetas compactas con icono, titulo y descripcion breve.
- El logo mantiene protagonismo, pero con proporcion mas controlada.

## Rediseno mobile

- Se redisenó el Sheet mobile con ancho limitado, header institucional y grupos claros: navegacion principal, mas secciones e institucional.
- Se mejoraron tamanos tactiles con filas de minimo 48px, iconos consistentes y espaciado generoso.
- Cada link cierra el menu al navegar usando `SheetClose`.
- Se reforzaron estados hover/focus con color primario y fondos suaves.
- El boton hamburguesa ahora tiene mejor proporcion, borde y sombra ligera.

## Animaciones

- Como `emil-design-eng` y `review-animations` no estan disponibles en esta sesion, se realizo revision manual.
- Se conservaron microinteracciones sutiles: underline de 200ms, hover de color, escala maxima de logo `1.03` y transicion de ocultar/mostrar navbar de 300ms.
- La apertura/cierre del Sheet usa la animacion existente del componente compartido.

## Archivos modificados

- `src/components/Navbar/navbar.tsx`

No se modificaron rutas, backend, base de datos ni dependencias.

## Validacion

- `npm run build` finalizo correctamente.
- Persiste la advertencia no bloqueante conocida de Turbopack/NFT relacionada con Prisma generado.
