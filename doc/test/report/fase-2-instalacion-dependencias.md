# Reporte fase 2 - Instalacion de dependencias de testing

Fecha: 2026-07-12

## Objetivo ejecutado

Se ejecuto la fase 2 del plan `doc/test/plan/plan.md`: agregar las librerias minimas para ejecutar tests unitarios y de integracion con Vitest, React Testing Library y jsdom.

## Comando ejecutado

```bash
npm install -D vitest @testing-library/react jsdom @testing-library/jest-dom @testing-library/user-event
```

La primera ejecucion fallo por permisos del sandbox al resolver `C:\Users\PC Franco`. Se repitio con permisos elevados y finalizo correctamente.

## Dependencias agregadas

Quedaron registradas en `devDependencies`:

- `vitest`: `^4.1.10`
- `@testing-library/react`: `^16.3.2`
- `jsdom`: `^29.1.1`
- `@testing-library/jest-dom`: `^6.9.1`
- `@testing-library/user-event`: `^14.6.1`

Verificacion con `npm ls`:

```text
argreanima@0.2.0 C:\Users\PC Franco\Desktop\arg-reanima-devjf
+-- @testing-library/jest-dom@6.9.1
+-- @testing-library/react@16.3.2
+-- @testing-library/user-event@14.6.1
+-- jsdom@29.1.1
`-- vitest@4.1.10
    `-- jsdom@29.1.1 deduped
```

## Verificaciones realizadas

### package-lock

`package-lock.json` fue actualizado por `npm install`, como esperaba la fase 2.

### Compatibilidad con React 19

La instalacion no reporto errores de peer dependencies ni conflictos bloqueantes con React 19.

### Build

Se ejecuto:

```bash
npm run build
```

Resultado: exitoso.

Resumen del build:

- Next.js `16.2.9`
- Compilacion exitosa.
- TypeScript finalizo correctamente.
- Se generaron 38 paginas estaticas.

Advertencia observada durante el build:

- Turbopack reporto `Encountered unexpected file in NFT list`.
- La traza apunta a `next.config.ts`, `src/generated/prisma/index.js` y `src/app/api/news/[id]/route.ts`.
- No bloqueo el build y no fue introducida directamente por la instalacion de testing, pero queda como punto a revisar si se endurece CI.

### Auditoria npm

La salida de `npm install` reporto:

- `14 vulnerabilities`
- `7 moderate`
- `7 high`

No se ejecuto `npm audit fix` porque la fase 2 solo pide instalar dependencias de testing y actualizar el lockfile. Ejecutar fixes podria modificar versiones fuera del alcance de esta fase.

## Archivos modificados o creados

Archivos modificados:

- `package.json`: se agregaron las dependencias de testing en `devDependencies`.
- `package-lock.json`: se actualizo el arbol de dependencias.

Archivos creados:

- `doc/test/report/fase-2-instalacion-dependencias.md`: este reporte.

Cambios no versionables esperados:

- `node_modules`: se instalaron paquetes localmente.

## Alcance no ejecutado

No se crearon archivos de configuracion de Vitest.
No se agregaron scripts de test en `package.json`.
No se crearon tests.
No se modifico codigo funcional de la aplicacion.

Esos pasos corresponden a fases posteriores del plan.
