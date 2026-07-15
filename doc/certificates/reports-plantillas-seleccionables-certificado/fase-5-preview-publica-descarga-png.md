# Reporte: Fase 5 - Preview, pagina publica y descarga PNG

## Objetivo ejecutado

Se ejecuto la Fase 5 del plan `doc/certificates/plan/plantillas-seleccionables-certificado.md`.

El objetivo fue hacer que `CertificatePreview` use la plantilla indicada por `templateKey`, para que la vista previa administrativa, la pagina publica y la descarga PNG compartan la misma imagen base.

## Cambios realizados

- Se reemplazo la plantilla hardcodeada por resolucion dinamica desde `templateKey`.
- Se uso `getCertificateTemplateByKey` como fuente de resolucion.
- Se uso `DEFAULT_CERTIFICATE_TEMPLATE_KEY` como fallback compatible.
- Se mantuvo un fallback final a `/certificado-template/certificado-template_1.png` para evitar un `src` vacio ante una configuracion inesperada.
- Se actualizo el `alt` de la imagen base para usar el nombre de la plantilla resuelta.
- No se modifico `exportCertificatePreviewToPng`, porque ya rasteriza el DOM de `CertificatePreview` e inlinea todas las imagenes presentes.

## Archivos modificados

- `src/components/Dashboard/Certificates/CertificatePreview.tsx`

## Detalle tecnico

`CertificatePreview` ahora resuelve la plantilla asi:

```ts
const defaultTemplate = getCertificateTemplateByKey(
  DEFAULT_CERTIFICATE_TEMPLATE_KEY,
);
const template =
  getCertificateTemplateByKey(data.templateKey) ?? defaultTemplate;
```

La imagen base usa:

```tsx
<img
  src={
    template?.imageSrc ??
    defaultTemplate?.imageSrc ??
    "/certificado-template/certificado-template_1.png"
  }
  alt={template?.name ?? "Plantilla de certificado"}
  className="absolute inset-0 h-full w-full object-cover"
/>
```

## Impacto en flujos

### Vista previa administrativa

El selector incorporado en Fase 4 modifica `templateKey` dentro de `previewData`. Con este cambio, `CertificatePreview` cambia la imagen base al seleccionar otra plantilla.

### Pagina publica

La pagina publica ya recibe `templateKey` desde la consulta agregada en Fase 3. Como reutiliza `CertificatePreview`, renderiza la plantilla persistida.

### Descarga PNG

La descarga PNG usa `exportCertificatePreviewToPng(previewRef.current, serialNumber)`. Ese helper clona el DOM e inlinea las imagenes, por lo que toma la misma plantilla que se ve en pantalla sin cambios adicionales.

## Verificacion

Se verificaron dimensiones de assets:

```text
certificado-template_1.png  1504x1046
certificado-template_2.png  1503x1047
certificado-template_3.png  1502x1047
```

Las dimensiones son muy cercanas, aunque no identicas. El layout actual usa `object-cover` y un contenedor con aspect ratio fijo, por lo que no deberia romperse, pero conviene validarlo visualmente en QA.

Se ejecutaron:

```bash
npm run test:run -- src/test/certificates
```

Resultado:

- 5 archivos de test pasaron.
- 15 tests pasaron.

Tambien se ejecuto:

```bash
npm run build
```

Resultado:

- Build exitoso.
- TypeScript paso correctamente.
- Persistio un warning existente de Turbopack/NFT relacionado con `next.config.ts`, Prisma y `src/app/api/news/[id]/route.ts`. No bloqueo el build.

## Estado final

La Fase 5 queda completa.

La plantilla seleccionada ya se refleja en:

- vista previa administrativa;
- pagina publica de validacion;
- descarga PNG generada desde la pagina publica.

Queda como recomendacion de QA revisar visualmente las tres plantillas por la diferencia menor de dimensiones entre los PNG.
