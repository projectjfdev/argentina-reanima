# Reporte fase 14 - Login page

Fecha: 2026-07-13

## Objetivo ejecutado

Se implemento la Fase 7 del plan `doc/test/plan/auth-testing-execution-plan.md`: cubrir el flujo principal de la pagina de login con React Testing Library.

No se avanzo sobre `authOptions`.

## Archivos creados

- `src/test/auth/login-page.test.tsx`
- `doc/test/report/fase-14-login-page.md`

## Archivos modificados

- Ninguno de codigo productivo.

## Tests implementados

### `src/test/auth/login-page.test.tsx`

- Renderiza campos de email y contrasena.
- Renderiza botones de login por credenciales y Google.
- Valida campos requeridos de email y password.
- Submit por credenciales llama `signIn("credentials", { redirect: false, ... })`.
- Error de credenciales devuelto por `signIn` se muestra en pantalla.
- Login exitoso de admin:
  - llama `update`.
  - refresca router.
  - redirige a `/dashboard`.
- Login exitoso de usuario:
  - llama `update`.
  - refresca router.
  - redirige a `/`.
- Boton Google llama `signIn("google", { callbackUrl: "/auth/login" })`.

## Cobertura alcanzada en esta fase

Quedo cubierto el comportamiento principal de la UI de login:

- Render basico del formulario.
- Validacion cliente con `react-hook-form`.
- Integracion con `next-auth/react` para credenciales.
- Manejo de error de credenciales.
- Redireccion por rol despues de login exitoso.
- Disparador de login con Google.

La fase no cubre login real, cookies, OAuth real, callbacks de NextAuth ni navegacion real en navegador.

## Mocks utilizados

Se usaron mocks locales en `login-page.test.tsx`:

- `next-auth/react`
  - `signIn`
  - `getSession`
  - `useSession`
- `next/navigation`
  - `useRouter`
- `framer-motion`
  - `motion.div`
  - `motion.span`
- `@/components/Login/AuthVisualPanel`
  - reemplazado por un stub simple.

El mock de `AuthVisualPanel` evita ejecutar `DotMap`, canvas, `ResizeObserver` y animaciones que no forman parte del alcance de esta fase.

## Resultado de tests

Comando ejecutado:

```bash
npm run test:run
```

Resultado:

- Test files: 12 passed.
- Tests: 49 passed.
- Estado: verde.

## Observaciones y mejoras detectadas

- No fue necesario modificar codigo productivo ni extraer `SignInCard`.
- La pagina puede testearse desde el default export `LoginPage` con mocks locales suficientes.
- `redirectByRole` se ejecuta tambien al montar la pagina por el `useEffect`; por eso los tests de login exitoso configuran `getSession` con una primera respuesta `null` y una segunda respuesta con rol.
- El componente visual `AuthVisualPanel` y `DotMap` no pertenecen al objetivo del test de login y conviene seguir mockeandolos en tests de autenticacion para evitar ruido de canvas/animaciones.
- En una mejora futura, exportar el formulario interno podria reducir mocks al testear la logica de submit, pero no fue imprescindible.
- No se requieren dependencias nuevas para esta fase.
