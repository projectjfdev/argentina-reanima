# Auth V2 - Reporte Fase 4

Fecha: 2026-07-06

## Alcance implementado

- Se activo `POST /api/auth/register` para registro publico.
- El endpoint ahora valida:
  - nombre obligatorio;
  - email con formato valido y normalizado a lowercase;
  - contrasena con minimo de 8 caracteres;
  - email no existente.
- El endpoint crea usuarios con:
  - `name`;
  - `email`;
  - password hasheada con bcrypt;
  - `role: USER`;
  - `emailVerified: null`.
- Se genera un token aleatorio de confirmacion, se guarda solo su hash SHA-256 y se configura vencimiento de 24 horas.
- No se envia email todavia. El envio por Resend queda para Fase 5.
- Se actualizo la UI de registro para usar `Nombre y Apellido` en lugar de `Username`.
- Se corrigio el doble `res.json()` del cliente.
- La UI muestra estado de registro pendiente sin iniciar sesion automaticamente.

## Rutas modificadas

- `src/app/api/auth/register/route.ts`
- `src/app/(front)/auth/register/page.tsx`
- `doc/authV2/reports/fase-4-registro-publico-email-pendiente.md`

## Verificacion

- `npm run build`: OK.

Build completo con TypeScript correcto. Next.js informo un warning de Turbopack sobre trazado NFT/import trace hacia Prisma desde una API; no bloqueo la compilacion.

## Pendiente

- No se inicio Fase 5.
- Falta integrar Resend, enviar el email de confirmacion y crear endpoint/pagina de verificacion.
- Los usuarios creados por este flujo quedan bloqueados para login credentials hasta confirmar `emailVerified`, tal como quedo definido en Fase 2.
