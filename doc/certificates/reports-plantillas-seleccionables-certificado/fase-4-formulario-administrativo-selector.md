# Reporte: Fase 4 - Formulario administrativo y experiencia de seleccion

## Objetivo ejecutado

Se ejecuto la Fase 4 del plan `doc/certificates/plan/plantillas-seleccionables-certificado.md`.

El objetivo fue incorporar `templateKey` al formulario administrativo y a la experiencia de seleccion en el dashboard, sin implementar todavia el render dinamico de plantillas en `CertificatePreview`.

## Cambios realizados

- Se agrego `templateKey` a los valores del formulario administrativo.
- Se agrego `template_1` como default del formulario usando `DEFAULT_CERTIFICATE_TEMPLATE_KEY`.
- Se importo y uso la lista centralizada `CERTIFICATE_TEMPLATES`.
- Se agrego un selector de plantilla en el formulario administrativo.
- Se cargo la plantilla persistida al editar un certificado.
- Se agrego `templateKey` al `FormData` de creacion masiva.
- Se mantuvo el envio individual con `JSON.stringify(values)`, por lo que `templateKey` viaja junto con el resto del payload.
- Se agrego `templateKey` a `previewData` mediante los valores observados del formulario.
- Se agrego `templateKey` al tipo `CertificatePreviewData` para permitir que el preview reciba el dato.
- Se agrego una etiqueta en el listado administrativo mostrando el nombre de la plantilla de cada certificado.

## Archivos modificados

- `src/components/Dashboard/Certificates/CertificatesDashboard.tsx`
- `src/components/Dashboard/Certificates/CertificatePreview.tsx`

## Detalle tecnico

### Form values

Se agrego `templateKey` a `CertificateFormValues`:

```ts
templateKey: CertificateTemplateKey;
```

Default usado:

```ts
templateKey: DEFAULT_CERTIFICATE_TEMPLATE_KEY;
```

### Selector administrativo

Se agrego un `Select` alimentado desde:

```ts
CERTIFICATE_TEMPLATES
```

El selector actualiza el formulario con:

```ts
setValue("templateKey", value as CertificateTemplateKey, {
  shouldDirty: true,
  shouldValidate: true,
});
```

### Edicion

Al seleccionar un certificado para editar, se carga:

```ts
templateKey: certificate.templateKey ?? DEFAULT_CERTIFICATE_TEMPLATE_KEY
```

### Creacion masiva

Se agrego al `FormData`:

```ts
formData.append("templateKey", values.templateKey);
```

### Listado administrativo

Se agrego una badge informativa con el nombre de la plantilla usando:

```ts
getCertificateTemplateByKey(templateKey)?.name
```

## Verificacion

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

La Fase 4 queda completa.

El administrador ya puede seleccionar una plantilla en el formulario, esa seleccion queda dentro de los valores enviados por creacion individual, edicion y creacion masiva, y el listado muestra la plantilla asociada.

Todavia no se avanzo sobre:

- renderizar dinamicamente la imagen base en `CertificatePreview`;
- hacer que la vista previa cambie visualmente al seleccionar otra plantilla;
- descarga PNG con la plantilla elegida.

Ese trabajo corresponde a la Fase 5.
