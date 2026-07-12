# Reporte fase 4 - Setup global de tests

Fecha: 2026-07-12

## Objetivo ejecutado

Se ejecuto la fase 4 del plan `doc/test/plan/plan.md`: crear el setup global de tests para centralizar matchers de DOM y limpieza entre pruebas.

## Archivos creados

- `src/test/setup.ts`
- `doc/test/report/fase-4-setup-tests.md`

## Configuracion agregada

`src/test/setup.ts` contiene:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

Esto deja disponibles los matchers de `@testing-library/jest-dom` para Vitest, por ejemplo:

- `toBeInTheDocument`
- `toHaveTextContent`
- `toBeDisabled`
- `toHaveAttribute`

Tambien ejecuta `cleanup()` despues de cada test para desmontar componentes renderizados con React Testing Library.

## Decision sobre mocks globales

No se agregaron mocks globales en esta fase.

Motivo: el plan indica no mockear dependencias antes de necesitarlas y evitar mocks amplios que oculten errores reales. Los mocks de `next/navigation`, `next-auth/react`, `next/image`, APIs de navegador, Prisma o servicios externos deberian definirse por test o por archivo cuando se pruebe un caso concreto.

## Integracion con Vitest

La configuracion creada en fase 3 ya apuntaba a `src/test/setup.ts` de forma condicional. Al existir ahora el archivo, Vitest lo carga automaticamente.

## Comandos de verificacion

### Vitest

Se ejecuto:

```bash
npx vitest run --passWithNoTests
```

Resultado: exitoso.

Salida relevante:

```text
RUN  v4.1.10 C:/Users/PC Franco/Desktop/arg-reanima-devjf

No test files found, exiting with code 0

include: **/*.test.ts, **/*.test.tsx, tests/**/*.test.ts, tests/**/*.test.tsx
exclude: **/node_modules/**, **/.git/**
```

La primera ejecucion fallo por permisos del sandbox al resolver `C:\Users\PC Franco`. Se repitio con permisos elevados y finalizo correctamente.

### Build

Se ejecuto:

```bash
npm run build
```

Resultado: exitoso.

Resumen:

- Next.js `16.2.9`
- Compilacion exitosa.
- TypeScript finalizo correctamente.
- Se generaron 38 paginas estaticas.

Advertencia observada:

- Turbopack volvio a reportar `Encountered unexpected file in NFT list`.
- La traza apunta a `next.config.ts`, `src/generated/prisma/index.js` y `src/app/api/news/[id]/route.ts`.
- Esta advertencia ya habia aparecido en fases anteriores y no bloquea el build.

## Archivos modificados o creados en esta fase

Archivos creados:

- `src/test/setup.ts`
- `doc/test/report/fase-4-setup-tests.md`

Archivos modificados:

- Ninguno en esta fase.

## Estado de alcance

No se agregaron scripts de test a `package.json`; corresponde a la fase 5.
No se crearon tests de validacion del entorno; corresponde a la fase 6.
No se agregaron mocks globales.
No se modifico codigo funcional de la aplicacion.
