# Barra Informativa de Donaciones

## Archivos creados o modificados

- `src/components/DonationBanner/DonationBanner.tsx`: nuevo componente reutilizable para campañas informativas.
- `src/components/Navbar/navbar.tsx`: se agrego la barra inmediatamente debajo de la navegacion principal.
- `src/app/(front)/layout.tsx`: se agrego padding superior para compensar la altura de la barra fija junto al navbar.

## Implementacion

La barra es un `Link` completo hacia `/donar`, por lo que toda el area es clickeable. El mensaje por defecto es:

`Ayudanos a instalar un DEA. Conocé la campaña solidaria.`

El texto de llamada a la accion se destaca con color primario, peso mayor y subrayado suave. La flecha final usa una microinteraccion sutil: se desplaza levemente hacia la derecha en hover.

La barra incluye una cruz a la derecha para cerrarla. El cierre se maneja con estado local dentro de `DonationBanner`; no persiste entre recargas y no modifica rutas ni estado global. El boton de cierre esta fuera del link principal para evitar navegacion accidental.

La altura se mantiene contenida con `min-h-11` en mobile y `md:min-h-12` en desktop. El contenido permanece centrado y puede envolver en pantallas estrechas.

## Reutilizacion

El componente acepta props opcionales:

- `href`: destino del banner.
- `message`: texto principal.
- `cta`: texto destacado de llamada a la accion.

Ejemplo:

```tsx
<DonationBanner
  href="/donar"
  message="Ayudanos a instalar un DEA."
  cta="Conocé la campaña solidaria."
/>
```

## Cambios futuros

Para cambiar el mensaje o enlace, editar las props al usar `DonationBanner` en `src/components/Navbar/navbar.tsx`, o modificar los valores por defecto en `DonationBanner.tsx` si la campana global cambia.

No se agregaron dependencias ni se modifico la logica de navegacion existente.
