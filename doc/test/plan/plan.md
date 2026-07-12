# Plan de incorporación de testing

## 1. Objetivo general

Preparar de forma incremental un entorno de testing automatizado para el proyecto Next.js, comenzando por tests unitarios y de integración livianos con Vitest, React Testing Library y jsdom.

El objetivo inicial no es cubrir toda la aplicación, sino dejar una base técnica estable, reproducible y documentada para que luego se puedan implementar pruebas sobre los flujos de autenticación de usuarios sin improvisar configuración, mocks ni criterios de alcance.

## 2. Alcance inicial del testing

El alcance inicial será la preparación del entorno y la validación mínima de que puede ejecutar tests sobre:

- Funciones utilitarias y lógica aislada de `src/libs`.
- Componentes React cliente renderizados en un entorno DOM simulado.
- Interacciones de usuario básicas en componentes.
- Integraciones livianas donde sea posible mockear dependencias externas.
- Código relacionado con autenticación en una fase posterior, especialmente:
  - configuración de `authOptions`;
  - flujos de login con credenciales;
  - registro, verificación de email, recuperación y reseteo de contraseña;
  - protección de rutas y sesiones;
  - comportamiento de componentes que consumen `useSession`, `signIn` o `signOut`.

Quedan fuera del alcance inicial:

- Tests end-to-end de navegador real.
- Pruebas visuales.
- Pruebas de performance.
- Modificaciones funcionales sobre autenticación.
- Uso de una base de datos real en tests, salvo que una fase posterior lo defina explícitamente.

## 3. Librerías recomendadas

Para el entorno inicial se recomiendan las siguientes dependencias de desarrollo:

- `vitest`: runner de tests, assertions, mocks y modo watch.
- `@testing-library/react`: renderizado y queries para componentes React desde la perspectiva del usuario.
- `jsdom`: entorno DOM simulado para ejecutar componentes React fuera del navegador.
- `@testing-library/jest-dom`: matchers expresivos para assertions sobre el DOM.
- `@testing-library/user-event`: simulación de interacciones de usuario más realistas que eventos manuales.

`@testing-library/user-event` aplica especialmente para formularios de autenticación, botones de login/logout, validaciones de campos y flujos donde importe el orden real de escritura, click, focus o submit.

## 4. Justificación de herramientas

### Vitest

Vitest encaja bien con un proyecto Next.js moderno en TypeScript porque ofrece una configuración simple, buen soporte para ESM, mocks integrados y una experiencia rápida en modo watch. También permite reutilizar patrones familiares de Jest sin introducir el costo de configuración de Jest en proyectos con tooling moderno.

Para este proyecto es una buena base porque actualmente no existe script de testing configurado en `package.json`, y Vitest permite incorporar tests de forma incremental sin reestructurar la aplicación.

### React Testing Library

React Testing Library favorece pruebas centradas en comportamiento observable, no en detalles internos de implementación. Esto es importante para componentes de UI como login, navbar, botones de cierre de sesión o vistas protegidas, donde conviene validar lo que el usuario ve y hace.

También reduce el acoplamiento con la estructura interna de los componentes, algo útil en un proyecto con App Router, componentes cliente y componentes servidor.

### jsdom

jsdom permite ejecutar tests de componentes que necesitan APIs del DOM sin abrir un navegador real. Es suficiente para la primera etapa de unit/integration testing y evita incorporar todavía una herramienta E2E como Playwright.

Para tests relacionados con autenticación, jsdom será útil en componentes cliente como formularios de login o componentes que usan `next-auth/react`.

### @testing-library/jest-dom

Agrega matchers como `toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled` o `toHaveAttribute`, que hacen los tests de UI más legibles y mantenibles.

Aunque el runner sea Vitest, estos matchers pueden integrarse en un archivo de setup para que estén disponibles globalmente.

### @testing-library/user-event

Permite simular interacciones de usuario de forma más fiel que `fireEvent`. Esto será relevante para probar formularios de autenticación, validaciones, estados de carga, clicks sobre proveedores externos y errores de credenciales.

## 5. Plan por fases

### Fase 1: análisis del proyecto actual

Objetivo: entender la arquitectura real antes de instalar o configurar herramientas.

Acciones:

- Revisar `package.json` para confirmar scripts existentes y dependencias actuales.
- Revisar `tsconfig.json` para confirmar alias `@/*`, modo de módulos y configuración TypeScript.
- Revisar la estructura de `src/app`, `src/components`, `src/libs`, `src/context` y `src/hooks`.
- Identificar componentes cliente que requieren jsdom.
- Identificar dependencias que suelen requerir mocks en tests, por ejemplo:
  - `next/navigation`;
  - `next-auth/react`;
  - `next-auth`;
  - Prisma;
  - Cloudinary;
  - Resend;
  - EmailJS;
  - APIs del navegador no disponibles en jsdom.
- Relevar el flujo actual de autenticación:
  - `src/libs/authOptions.ts`;
  - `src/app/api/auth/[...nextauth]/route.ts`;
  - `src/app/api/auth/register/route.ts`;
  - `src/app/api/auth/verify-email/route.ts`;
  - `src/app/api/auth/forgot-password/route.ts`;
  - `src/app/api/auth/reset-password/route.ts`;
  - `src/libs/auth/requireAdminSession.ts`;
  - `src/libs/auth/passwordReset.ts`;
  - `src/libs/auth/emailVerification.ts`;
  - `src/proxy.ts`;
  - pantalla de login en `src/app/(front)/auth/login/page.tsx`.

Resultado esperado:

- Lista de áreas candidatas para tests iniciales.
- Lista de módulos que necesitarán mocks.
- Confirmación de que el primer objetivo será validar el entorno, no probar autenticación todavía.

### Fase 2: instalación de dependencias

Objetivo: agregar las librerías mínimas para ejecutar tests unitarios y de integración.

Dependencias recomendadas:

```bash
npm install -D vitest @testing-library/react jsdom @testing-library/jest-dom @testing-library/user-event
```

Puntos a verificar después de instalar:

- Que `package-lock.json` quede actualizado.
- Que no haya conflictos con React 19.
- Que no haya advertencias relevantes de peer dependencies.
- Que `npm run build` siga funcionando.
- Que `postinstall` con Prisma no introduzca efectos inesperados.

Resultado esperado:

- Dependencias de test registradas en `devDependencies`.
- Lockfile actualizado de forma consistente.

### Fase 3: configuración de Vitest

Objetivo: crear una configuración explícita y compatible con el proyecto.

Archivo probable:

- `vitest.config.ts`

Configuración mínima esperada:

- `environment: "jsdom"` para tests de componentes.
- `globals: true` si se decide usar `describe`, `it`, `expect` sin imports explícitos.
- `setupFiles` apuntando al setup global de tests.
- Alias `@` apuntando a `src`, alineado con `tsconfig.json`.
- Inclusión de patrones de test como:
  - `**/*.test.ts`;
  - `**/*.test.tsx`;
  - `tests/**/*.test.ts`;
  - `tests/**/*.test.tsx`.

Decisión recomendada:

- Usar `vitest.config.ts` separado de `next.config.ts` para no mezclar configuración de build con configuración de tests.
- Mantener el entorno por defecto en `jsdom` al inicio, porque la primera etapa incluye componentes React. Si más adelante hay muchos tests de lógica pura o server-only, evaluar entornos por archivo o proyectos separados.

Resultado esperado:

- Vitest puede resolver TypeScript, JSX y alias `@/*`.
- El runner puede cargar el setup global.

### Fase 4: configuración de setup de tests

Objetivo: centralizar configuración global, matchers y mocks mínimos.

Archivo probable:

- `src/test/setup.ts`

Contenido esperado:

- Importar `@testing-library/jest-dom/vitest`.
- Preparar limpieza automática si hiciera falta.
- Definir mocks globales mínimos solo cuando sean necesarios.

Criterios para mocks iniciales:

- No mockear dependencias antes de necesitarlas.
- Evitar mocks globales demasiado amplios que oculten errores reales.
- Para Next.js, preparar mocks por test o por archivo cuando se prueben componentes que dependan de:
  - `next/navigation`;
  - `next/image`;
  - `next-auth/react`;
  - APIs del navegador.

Resultado esperado:

- Los matchers de `jest-dom` están disponibles.
- El setup no introduce comportamiento oculto ni dependencias innecesarias.

### Fase 5: creación de scripts en package.json

Objetivo: dejar comandos claros para uso local y futuro CI.

Scripts recomendados:

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

Notas:

- `test` puede quedar en modo interactivo/watch para desarrollo local, o apuntar a `vitest run` si se prioriza comportamiento de CI. La decisión debe tomarse antes de integrar en pipelines.
- `test:coverage` requerirá evaluar si se agrega `@vitest/coverage-v8`.
- No conviene bloquear la incorporación inicial por cobertura. Primero debe funcionar el entorno.

Resultado esperado:

- Existen comandos reproducibles para ejecutar tests.
- El comando elegido para validación sin watch queda documentado.

### Fase 6: primer test mínimo de validación del entorno

Objetivo: comprobar que la configuración funciona antes de escribir tests reales de negocio.

Archivo probable:

- `src/test/environment.test.tsx`

Contenido sugerido:

- Un test mínimo de TypeScript con `expect`.
- Un render mínimo de React Testing Library.
- Una assertion con matcher de `jest-dom`.
- Una interacción simple con `user-event` si se quiere validar esa dependencia.

Regla importante:

- Este test debe validar el entorno, no el comportamiento funcional de la aplicación.
- Debe ser pequeño, fácil de borrar o reemplazar y no depender de base de datos, red, NextAuth ni rutas reales.

Resultado esperado:

- `npm run test:run` ejecuta correctamente.
- El entorno jsdom, React Testing Library, jest-dom y alias quedan validados.

### Fase 7: planificación específica para testear autenticación

Objetivo: definir una estrategia de testing para autenticación una vez que el entorno base esté preparado.

Áreas candidatas:

- Configuración de NextAuth en `src/libs/authOptions.ts`.
- Provider de credenciales.
- Provider de Google, con foco en la lógica propia alrededor del provider y no en probar Google.
- Callbacks de `signIn`, `jwt` y `session`.
- Registro de usuarios en `src/app/api/auth/register/route.ts`.
- Verificación de email.
- Recuperación y reseteo de contraseña.
- Protección de sesión/admin con `requireAdminSession`.
- Redirecciones de rutas protegidas en layouts o middleware/proxy.
- UI de login en `src/app/(front)/auth/login/page.tsx`.
- Componentes que ejecutan `signOut`.

Tipos de test recomendados:

- Unitarios:
  - lógica pura de helpers de autenticación;
  - validaciones;
  - generación o verificación de tokens;
  - normalización de datos de usuario;
  - ramas de callbacks donde las dependencias puedan mockearse.

- Integración liviana:
  - route handlers de auth con requests simulados;
  - flujos de registro y recuperación con Prisma, email y hashing mockeados;
  - componentes de login con `signIn` mockeado;
  - componentes dependientes de sesión con `useSession` mockeado.

- E2E futuro:
  - login real;
  - logout;
  - acceso a rutas protegidas;
  - recuperación de contraseña completa;
  - registro y verificación de email.

Mocks esperados:

- Prisma client.
- `bcrypt`.
- `next-auth/react`.
- `next-auth`.
- Servicios de email.
- Proveedores externos OAuth.
- Variables de entorno necesarias para NextAuth.

Orden recomendado para implementar tests de autenticación:

1. Helpers puros de `src/libs/auth`.
2. `requireAdminSession` con `getServerSession` mockeado.
3. Route handler de registro con Prisma y email mockeados.
4. Route handlers de forgot/reset password.
5. UI de login con `signIn` mockeado.
6. Callbacks de `authOptions`, si la estructura permite aislarlos con bajo acoplamiento.
7. Evaluación de Playwright para cubrir flujos reales de navegador.

Resultado esperado:

- Mapa claro de qué se testea con Vitest y qué debería quedar para E2E.
- Dependencias externas identificadas antes de escribir tests.
- Menor riesgo de tests frágiles o acoplados a implementación interna.

## 6. Checklist de archivos a crear o modificar

Archivos que probablemente se crearán:

- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/environment.test.tsx`
- `tests/` si se decide centralizar algunos tests fuera de `src`

Archivos que probablemente se modificarán:

- `package.json`
- `package-lock.json`
- `tsconfig.json`, solo si Vitest requiere ajustes de tipos o includes

Archivos que deberían revisarse antes de probar autenticación:

- `src/libs/authOptions.ts`
- `src/libs/auth/requireAdminSession.ts`
- `src/libs/auth/passwordReset.ts`
- `src/libs/auth/emailVerification.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/(front)/auth/login/page.tsx`
- `src/proxy.ts`
- `src/types/next-auth.d.ts`

Archivos que no deberían modificarse durante la preparación inicial salvo necesidad explícita:

- Código funcional de autenticación.
- Prisma schema o migraciones.
- Componentes productivos no relacionados con el test mínimo de entorno.

## 7. Riesgos y puntos a revisar antes de implementar

- Compatibilidad de Vitest, React Testing Library y React 19.
- Compatibilidad con Next.js App Router y componentes servidor.
- Necesidad de mockear APIs específicas de Next.js que no existen en jsdom.
- Posibles problemas al importar módulos server-only desde tests jsdom.
- Uso de alias `@/*` con `baseUrl: "src"` y paths configurados en `tsconfig.json`.
- Manejo de variables de entorno requeridas por NextAuth, Google OAuth, Prisma o servicios externos.
- Riesgo de que tests de autenticación intenten usar red, base de datos real o servicios de email si no se mockean correctamente.
- Prisma generado en `src/generated/prisma` y su impacto al mockear el cliente.
- Diferencia entre validar lógica propia y probar internals de NextAuth, que no deberían ser responsabilidad del proyecto.
- Ausencia actual de script de lint activo; `npm run build` seguirá siendo la verificación mínima complementaria.
- Posible necesidad futura de separar tests por entorno: `node` para lógica server/API y `jsdom` para componentes.
- Cuidado con tests de route handlers si dependen de cookies, headers o sesiones de NextAuth.

## 8. Criterios de entorno correctamente preparado

El entorno se considerará correctamente preparado cuando:

- Las dependencias de test estén instaladas como `devDependencies`.
- Exista una configuración de Vitest versionada y alineada con TypeScript.
- Vitest resuelva el alias `@/*`.
- El setup global cargue `@testing-library/jest-dom/vitest`.
- Un test mínimo de entorno pueda renderizar un componente React con React Testing Library.
- `user-event` pueda simular al menos una interacción simple.
- Los scripts de test estén disponibles en `package.json`.
- `npm run test:run` finalice correctamente.
- `npm run build` siga finalizando correctamente.
- No se requiera base de datos, red ni servicios externos para correr el test mínimo.
- Quede documentado qué se probará después en autenticación y qué se postergará para E2E.

## 9. Próximos pasos sugeridos después de aprobar el plan

1. Ejecutar la Fase 1 completa y confirmar los hallazgos.
2. Instalar las dependencias de testing como dependencias de desarrollo.
3. Crear `vitest.config.ts` y `src/test/setup.ts`.
4. Agregar scripts de test a `package.json`.
5. Crear el test mínimo de validación del entorno.
6. Ejecutar `npm run test:run`.
7. Ejecutar `npm run build`.
8. Documentar cualquier ajuste necesario detectado durante la configuración.
9. Definir el primer bloque de tests de autenticación, empezando por helpers y dependencias fáciles de mockear.
10. Evaluar en una etapa posterior si se incorpora Playwright para cubrir flujos reales de autenticación en navegador.
