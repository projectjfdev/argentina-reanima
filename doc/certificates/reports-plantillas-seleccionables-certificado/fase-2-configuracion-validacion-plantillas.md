# Reporte: Fase 2 - Configuracion y validacion de plantillas

## Objetivo ejecutado

Se ejecuto la Fase 2 del plan `doc/certificates/plan/plantillas-seleccionables-certificado.md`.

El objetivo fue centralizar la configuracion de plantillas disponibles y validar `templateKey` en los flujos de entrada de certificados, sin avanzar sobre UI, propagacion completa por APIs, render dinamico ni persistencia masiva final.

## Cambios realizados

- Se creo una configuracion compartida de plantillas en el dominio de certificados.
- Se definio `template_1` como plantilla por defecto.
- Se agregaron las tres plantillas permitidas:
  - `template_1`
  - `template_2`
  - `template_3`
- Se agregaron helpers para resolver y normalizar plantillas.
- Se exportaron los helpers desde el barrel `src/libs/certificates/index.ts`.
- Se extendio `validateCertificatePayload` para aceptar, validar y devolver `templateKey`.
- Se mantuvo compatibilidad con payloads antiguos: si `templateKey` esta ausente, se usa `template_1`.
- Se rechazo cualquier `templateKey` desconocido con error de validacion.
- Se extendio la validacion compartida de creacion masiva para validar `templateKey` usando la misma configuracion.
- Se agregaron tests de validacion para plantilla ausente, valida e invalida.

## Archivos creados

- `src/libs/certificates/certificateTemplates.ts`

## Archivos modificados

- `src/libs/certificates/index.ts`
- `src/libs/certificates/validateCertificatePayload.ts`
- `src/app/api/certificates/bulk/route.ts`
- `src/test/certificates/validateCertificatePayload.test.ts`

## Detalle tecnico

Nueva constante principal:

```ts
export const DEFAULT_CERTIFICATE_TEMPLATE_KEY = "template_1";
```

Plantillas disponibles:

```ts
export const CERTIFICATE_TEMPLATES = [
  {
    key: "template_1",
    name: "Plantilla 1",
    imageSrc: "/certificado-template/certificado-template_1.png",
    description: "Plantilla principal de Argentina Reanima.",
  },
  {
    key: "template_2",
    name: "Plantilla 2",
    imageSrc: "/certificado-template/certificado-template_2.png",
    description: "Variante visual alternativa.",
  },
  {
    key: "template_3",
    name: "Plantilla 3",
    imageSrc: "/certificado-template/certificado-template_3.png",
    description: "Variante visual alternativa.",
  },
] as const;
```

Helpers agregados:

- `getCertificateTemplateByKey(key)`
- `getDefaultCertificateTemplate()`
- `normalizeCertificateTemplateKey(value)`
- tipo `CertificateTemplateKey`

Regla aplicada:

- `templateKey` ausente o `null`: usa `template_1`.
- `templateKey` string desconocido: devuelve error `La plantilla seleccionada no es valida`.
- No se aceptan rutas de imagen desde el cliente.

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
- Persistio un warning existente de Turbopack/NFT relacionado con `next.config.ts`, Prisma y `src/app/api/news/[id]/route.ts`. No bloqueo el build y no fue introducido por esta fase.

## Estado final

La Fase 2 queda completa.

El sistema ya tiene una fuente de verdad para plantillas y validacion de `templateKey` en payload individual y validacion compartida masiva. Todavia no se avanzo sobre:

- propagacion completa en creates/updates/selects;
- selector en dashboard;
- render dinamico en `CertificatePreview`;
- uso efectivo de `templateKey` en la creacion masiva.
