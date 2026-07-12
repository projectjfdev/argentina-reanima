# Fase 8 - Validacion final y rollback

Fecha de ejecucion: 2026-07-12

## Objetivo

Confirmar la estabilidad global del proyecto despues de las fases de mantenimiento de dependencias y dejar una ruta clara de rollback por grupos.

## Alcance ejecutado

- Instalacion limpia.
- Generacion explicita de Prisma Client.
- Tests configurados.
- Build productivo.
- Auditoria final.
- Revision final de dependencias desactualizadas.
- Revision final del arbol npm.
- Estado Git de cierre.

No se instalaron dependencias nuevas en esta fase y no se aplicaron fixes automaticos.

## Validaciones automaticas

| Comando | Resultado | Observacion |
| --- | --- | --- |
| `npm ci` | OK | Instalo 609 paquetes, audito 610 y ejecuto `postinstall` con `prisma generate`. |
| `npx prisma generate` | OK | Genero Prisma Client `v6.19.3` en `src/generated/prisma`. El primer intento dentro del sandbox fallo por `EPERM`; al ejecutarlo con permisos aprobados paso correctamente. |
| `npm run test:run` | OK | Vitest `v4.1.10`: 1 archivo, 1 test pasado. |
| `npm run build` | OK | Next.js `16.2.10`; compila, corre TypeScript y genera 38 paginas. |
| `npm audit --json` | Con hallazgos conocidos | 6 vulnerabilidades: 5 moderadas y 1 alta, sin criticas. |
| `npm outdated --json` | Con majors conocidas | Solo lista majors pendientes; no hay patch/minor pendientes. |
| `npm ls --all --json` | Con inconsistencias conocidas | Mantiene 5 paquetes `extraneous` ya documentados. |

## Build final

El build final paso correctamente:

- Compilacion: OK.
- TypeScript: OK.
- Generacion estatica: OK, 38 paginas.
- Rutas API y dinamicas: detectadas correctamente por Next.js.

Warning persistente, ya registrado desde fases anteriores:

```text
Turbopack build encountered 1 warnings:
./next.config.ts
Encountered unexpected file in NFT list
Import trace:
  App Route:
    ./next.config.ts
    ./src/generated/prisma/index.js
    ./src/app/api/news/[id]/route.ts
```

No aparecieron warnings nuevos en esta fase.

## Auditoria final

Estado final de `npm audit --json`:

- Total: 6 vulnerabilidades.
- Moderadas: 5.
- Altas: 1.
- Criticas: 0.

### Produccion

| Paquete | Severidad | Ruta | Estado |
| --- | --- | --- | --- |
| `next` | Moderada | Directa, via `postcss` | Pendiente upstream o decision futura. `npm audit` propone downgrade mayor improcedente. |
| `postcss` | Moderada | `next -> postcss@8.4.31` | Nodo anidado dentro de Next. El `postcss` de tooling esta corregido. |
| `next-auth` | Moderada | Directa, via `next` y `uuid` | Pendiente upstream o decision futura. `npm audit` propone downgrade mayor improcedente. |
| `uuid` | Moderada | `next-auth -> uuid@8.3.2` | Transitiva de NextAuth 4.x. |

### Desarrollo/tooling

| Paquete | Severidad | Ruta | Estado |
| --- | --- | --- | --- |
| `brace-expansion` | Moderada | Ecosistema ESLint -> `minimatch@3.1.5` | Afecta tooling, no runtime productivo. |
| `flatted` | Alta | `eslint -> file-entry-cache -> flat-cache` | Afecta tooling/cache de ESLint. No hay script `lint` activo. |

## Outdated final

`npm outdated --json` solo lista majors pendientes:

| Paquete | Actual | Latest | Decision vigente |
| --- | ---: | ---: | --- |
| `@types/bcrypt` | `5.0.2` | `6.0.0` | Recomendada ahora en cambio aislado futuro. |
| `@prisma/client` | `6.19.3` | `7.8.0` | Postergable. |
| `prisma` | `6.19.3` | `7.8.0` | Postergable. |
| `@types/node` | `20.19.43` | `26.1.1` | Postergable. |
| `eslint` | `9.39.5` | `10.7.0` | Postergable. |
| `lucide-react` | `0.511.0` | `1.24.0` | Postergable. |
| `react-day-picker` | `9.14.0` | `10.0.1` | Postergable. |
| `react-dropzone` | `14.4.1` | `16.0.0` | Postergable. |
| `react-player` | `2.16.1` | `3.4.0` | No recomendada actualmente. |
| `typescript` | `5.9.3` | `7.0.2` | Postergable. |

## Arbol npm final

`npm ls --all --json` mantiene estos paquetes como `extraneous` aun despues de `npm ci`:

- `@emnapi/core@1.11.1`
- `@emnapi/runtime@1.11.1`
- `@emnapi/wasi-threads@1.2.2`
- `@napi-rs/wasm-runtime@0.2.12`
- `@tybys/wasm-util@0.10.3`

No se eliminaron manualmente porque no son dependencias directas del proyecto y persisten tras instalacion limpia.

## Estado Git de cierre

Salida de `git status --short`:

```text
 M package-lock.json
 M package.json
?? doc/dependencies/
```

Los cambios esperados del mantenimiento son:

- `package.json`
- `package-lock.json`
- reportes y plan bajo `doc/dependencies/`

## Pruebas manuales pendientes

No se ejecutaron pruebas manuales con navegador ni integraciones reales porque requieren entorno interactivo, credenciales, datos de prueba y/o servidor activo.

Antes de merge o deploy, validar manualmente:

- Login con credentials.
- Login con Google si hay credenciales configuradas.
- Registro.
- Verificacion de email.
- Recuperacion y reset de contrasena.
- Logout.
- Acceso a `/dashboard`.
- Roles admin/user.
- Panel de cursos.
- Panel de noticias.
- Panel de certificados.
- Creacion de certificados.
- Validacion publica de certificados.
- Descarga de certificados.
- Subida/reemplazo/borrado de imagenes en Cloudinary.
- Envio de emails con Resend.
- Formulario de contacto con EmailJS.
- Pagina `/filiales` con Leaflet.
- Paginas que usan ReactPlayer.
- Formularios que usan React Hook Form y calendario.
- Componentes Radix: dialog, select, accordion, tooltip y navigation menu.

## Estrategia de rollback

### Rollback recomendado por grupo

Si se agrupan commits por fase, revertir en orden inverso:

1. Fase 7: limpieza y declaraciones directas.
2. Fase 6: NextAuth 4.x.
3. Fase 5: Prisma 6.x.
4. Fase 4: servicios externos.
5. Fase 3: UI, formularios y cliente DOM.
6. Fase 2: core y tooling.

Comando por commit:

```bash
git revert <commit>
npm ci
npx prisma generate
npm run test:run
npm run build
```

### Rollback si falla produccion

Usar rollback inmediato si aparece cualquiera de estas condiciones:

- Fallo de build o deploy.
- Error de generacion de Prisma.
- Error de conexion o queries Prisma.
- Ruptura de login, sesion, cookies o permisos.
- Fallo en registro, recuperacion o verificacion de email.
- Fallo en creacion, validacion o descarga de certificados.
- Fallo en subida o borrado de archivos.
- Fallo en envio de emails.
- Error de hidratacion o pantalla rota en rutas publicas criticas.

### Rollback operativo

1. Identificar el ultimo commit estable anterior a la fase que introdujo el problema.
2. Revertir solo el commit o grupo afectado.
3. Ejecutar `npm ci`.
4. Ejecutar `npx prisma generate`.
5. Ejecutar `npm run test:run`.
6. Ejecutar `npm run build`.
7. Repetir la prueba manual que fallo.

No usar `git reset --hard` salvo decision explicita del responsable del repositorio.

## Criterios de aceptacion

- Instalacion limpia: cumplido.
- Prisma Client generado: cumplido.
- Tests configurados: cumplido.
- Build productivo: cumplido.
- Warnings explicados: cumplido.
- Vulnerabilidades restantes clasificadas: cumplido.
- Majors pendientes clasificadas: cumplido.
- Rollback documentado: cumplido.
- Pruebas manuales criticas: pendientes de ejecucion en entorno con credenciales.

## Estado final

Fase 8 completada.

El proyecto queda tecnicamente validado por instalacion limpia, generacion Prisma, tests y build. El mantenimiento no deja patch/minor pendientes segun `npm outdated`; solo quedan majors evaluadas y vulnerabilidades residuales ya justificadas. El siguiente paso antes de merge/deploy es ejecutar la bateria manual sobre auth, dashboard, certificados, uploads, emails, Leaflet y ReactPlayer.
