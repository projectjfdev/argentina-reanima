# Reporte Fase 2: selector de modalidad individual o Excel

Fecha: 2026-07-14

## Alcance implementado

Se implemento unicamente la Fase 2 del plan de generacion masiva por Excel. El cambio agrega la seleccion visual entre emision individual y emision por Excel, preparando la pantalla administrativa sin implementar todavia lectura, validacion ni creacion masiva de certificados.

No se agrego endpoint bulk, parseo de archivos, dependencias para Excel, validacion de filas ni creacion masiva.

## Archivos creados

- `doc/certificates/reports-generacion-masiva-excel/fase-2-selector-modalidad.md`
  - Este reporte.

## Archivos modificados

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
  - Se agrego el estado local `certificateMode: "single" | "bulk"`.
  - Se agrego el estado local `bulkFileName` para mostrar el nombre del archivo seleccionado.
  - Se agrego un selector segmentado con las opciones:
    - `Individual`
    - `Excel`
  - Se agrego el componente interno `ModeButton` para mantener el selector compacto y consistente con el dashboard.
  - Se agregaron iconos `UserRound` y `FileSpreadsheet`.
  - En modo individual se mantienen los campos:
    - Nombre.
    - Email.
    - DNI opcional.
    - Texto principal.
    - Texto inferior.
    - Firma opcional del instructor.
  - En modo Excel se ocultan:
    - Nombre.
    - Email.
    - DNI.
  - En modo Excel se mantienen visibles:
    - Texto principal.
    - Texto inferior.
    - Firma opcional del instructor.
    - Control para seleccionar archivo `.xlsx`.
  - El modo Excel muestra una vista previa generica con destinatario placeholder.
  - Si se selecciona un certificado para editar, se fuerza el modo individual.
  - Si hay un certificado en edicion, la opcion Excel queda deshabilitada.
  - `react-hook-form` usa `shouldUnregister: true` para que los campos ocultos no bloqueen la validacion.
  - El boton principal en modo Excel muestra `Preparar lote`.
  - Al intentar enviar en modo Excel se muestra un toast informativo indicando que la carga por Excel se habilita en la siguiente fase.

## Decisiones tomadas

- El selector se implemento como control segmentado dentro del formulario, no como pagina ni flujo separado.
- La edicion de certificados existentes queda siempre en modo individual para evitar mezclar edicion con carga masiva.
- El control de archivo acepta visualmente `.xlsx`, pero no parsea ni envia el archivo en esta fase.
- El modo Excel no llama a ningun endpoint nuevo.
- El modo Excel no reutiliza `POST /api/certificates`, para evitar crear certificados individuales con datos incompletos.
- La vista previa en modo Excel usa placeholders genericos porque todavia no existe lectura de filas.
- No se agregaron dependencias nuevas.
- No se implemento ninguna parte de Fase 3 o posterior.

## Verificaciones realizadas

- `npm run build`
  - Build exitoso.
  - Se mantiene una advertencia no bloqueante de Turbopack sobre tracing desde `next.config.ts`/Prisma en una ruta de noticias.
- `npm run test:run`
  - 13 archivos de test pasaron.
  - 62 tests pasaron.
- Busquedas de consistencia:
  - No se agrego `/api/certificates/bulk`.
  - No se agregaron dependencias `exceljs`, `papaparse` ni equivalentes.
  - No existe input editable de `serialNumber` en el formulario.
  - Las referencias a `serialNumber` que quedan son solo para mostrar serie existente, preview, listado o eliminacion.

## Notas de trabajo

- El cambio quedo limitado al dashboard administrativo de certificados.
- El estado de Git sigue incluyendo cambios previos no relacionados en el arbol de trabajo; no se revirtieron ni se modificaron intencionalmente como parte de esta fase.
