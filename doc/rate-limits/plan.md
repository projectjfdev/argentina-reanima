# Plan de rate limiting y proteccion antiabuso

Fecha de auditoria: 2026-08-19.

## Alcance

Esta auditoria revisa la superficie expuesta del proyecto actual de Argentina Reanima con foco exclusivo en abuso, rate limiting y mitigacion de trafico malicioso.

No se propone aplicar limites de forma indiscriminada. La estrategia prioriza operaciones publicas, costosas, repetibles o sensibles. El dashboard administrativo ya esta protegido por sesion admin, por lo que solo necesita limites puntuales en operaciones de alto costo o alto impacto.

## Resumen ejecutivo

Los riesgos mas importantes del proyecto no estan en la navegacion publica ni en el dashboard en general. Para el estado actual de Argentina Reanima, con bajo trafico y prioridad de simplicidad, la primera etapa debe concentrarse en cuatro superficies publicas que un bot podria automatizar con impacto real:

1. Login con Credentials via NextAuth: validacion de email/password con `bcrypt.compare`, riesgo de fuerza bruta, costo CPU y enumeracion por diferencias de error.
2. `POST /api/auth/register`: endpoint publico que hashea password, crea usuarios, genera tokens y envia emails de confirmacion por Resend.
3. `POST /api/auth/forgot-password`: endpoint publico que genera tokens y puede disparar emails de recuperacion.
4. `POST /api/donations`: endpoint publico con subida de comprobantes a Cloudinary, escritura en base de datos, revalidacion de cache y notificacion a Telegram.

La estrategia recomendada deja de ser implementar primero un rate limiter propio con Redis, Upstash o PostgreSQL/Neon. La Fase 1 debe aprovechar Vercel Firewall/WAF para cortar abuso antes de ejecutar Functions, Prisma, bcrypt, Resend, Cloudinary o Telegram. Los limites por email, usuario, campana, bloqueo progresivo y almacenamiento propio de contadores quedan como evolucion futura si el trafico o los incidentes reales lo justifican.

Hallazgo separado: `POST /api/telegram` esta expuesto sin autenticacion y dispara mensajes de prueba. No es un caso normal de rate limiting publico; deberia cerrarse, protegerse o excluirse de produccion.

## Superficie revisada

### Rutas publicas de pagina

Rutas bajo `src/app/(front)`:

- `/`
- `/actividades`
- `/campanas-dea`
- `/capacitaciones`
- `/capacitaciones/[id]`
- `/certificado/validar/[publicId]`
- `/contacto`
- `/filiales`
- `/galeria`
- `/homenaje-sergio-marcos`
- `/marco-normativo`
- `/nuestra-musica`
- `/politica-de-donaciones`
- `/politica-de-privacidad`
- `/quiero-ser-parte`
- `/quienes-somos`
- `/rcp-y-cuidado-emocional`
- `/redes-sociales`
- `/terminos-y-condiciones`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/mi-perfil`

La mayoria son paginas estaticas o de lectura. El rate limiting debe enfocarse en los endpoints que esas paginas llaman, no en bloquear la navegacion normal.

### Dashboard administrativo

Rutas bajo `/dashboard`:

- `/dashboard`
- `/dashboard/noticias`
- `/dashboard/cursos`
- `/dashboard/certificados`
- `/dashboard/campanas-dea`

Proteccion actual:

- `src/proxy.ts` usa `withAuth` de NextAuth.
- El matcher cubre `/dashboard/:path*`.
- Solo autoriza `token?.role === "ADMIN"`.
- `src/app/(front)/dashboard/layout.tsx` vuelve a validar sesion y rol en servidor.

Conclusion: no conviene rate limiting general agresivo sobre el dashboard. Si un atacante no tiene sesion admin, queda fuera. Si un admin legitimo trabaja rapido, un limite global puede degradar la operacion. La proteccion debe aplicarse a APIs admin costosas y a intentos no autenticados repetidos.

### Server Actions

No se encontraron Server Actions reales con `"use server"` en la aplicacion. La superficie dinamica revisada esta concentrada en Route Handlers y formularios cliente que hacen `fetch` o integraciones externas.

## Protecciones existentes

### Next.js App Router

Lo que aporta:

- Separacion clara entre paginas y Route Handlers.
- Manejo de metodos HTTP por archivo `route.ts`.
- Posibilidad de cachear resultados con `"use cache"`, `cacheLife` y `cacheTag`.
- `connection()` fuerza renderizado en request time para endpoints que no deben confundirse con contenido estatico.
- Headers `Cache-Control: no-store` configurados para APIs sensibles en `next.config.ts`.

Lo que no aporta:

- No hay rate limiting automatico por IP, usuario o endpoint.
- No bloquea fuerza bruta de login.
- No limita subidas multipart por frecuencia.
- No detecta bots por si solo.
- No evita floods a Route Handlers dinamicos.
- No impide que un endpoint publico costoso sea llamado repetidamente.

### Cache actual

Existe cache de aplicacion en:

- `getPublicNews` y `getLatestPublicNews`, con `cacheLife` y `cacheTag`.
- `getPublicCourses` y `getPublicCourseById`, con `cacheLife` y `cacheTag`.

Esto reduce carga en lecturas publicas repetidas de noticias y cursos. No reemplaza rate limiting: consultas con muchos parametros distintos, rutas con `no-store`, endpoints con `connection()`, escrituras, uploads y auth siguen pegando al servidor.

### Headers no-store

`next.config.ts` define `no-store` para:

- `/api/admin/:path*`
- `/api/auth/:path*`
- `/api/me/certificates`
- `/api/certificates`
- `/api/certificates/:path*`
- `/api/donation-campaigns`
- `/api/donation-campaigns/:path*`
- `/api/donations`

Esto es correcto para datos privados, auth y donaciones. Pero `no-store` tambien significa que esas respuestas no se apoyan en cache HTTP/CDN para absorber trafico repetido.

### NextAuth

Lo que aporta:

- Sesiones JWT.
- Proteccion de `/dashboard`.
- Helpers de sesion server-side.
- Flujo OAuth con Google.
- Protecciones propias de NextAuth para sus rutas internas, como manejo de CSRF en flows soportados.

Lo que no aporta suficientemente:

- No implementa por defecto bloqueo progresivo de login por usuario/IP.
- No evita fuerza bruta contra Credentials.
- No limita abuso de endpoints custom como register, forgot-password o reset-password.

### Vercel Firewall, WAF y Bot Protection

No hay configuracion en el repo que confirme reglas especificas de Vercel Firewall, WAF, Bot Protection o Challenge Mode. Por lo tanto, no se debe asumir que ya estan activas. La estrategia recomendada es configurarlas en Vercel como primera capa antes de agregar infraestructura propia.

Segun la documentacion oficial vigente de Vercel:

- Vercel Firewall inspecciona las requests en capas: mitigacion DDoS de plataforma, IP blocking, WAF Custom Rules y WAF Managed Rulesets.
- La mitigacion DDoS de plataforma esta disponible en todos los planes y no requiere configuracion.
- Vercel WAF esta disponible en todos los planes y permite Custom Rules, IP blocking, Managed Rulesets y Attack Challenge Mode segun disponibilidad del plan.
- WAF Custom Rules estan disponibles en todos los planes. Limites por plan: Hobby hasta 3 reglas, Pro hasta 40, Enterprise hasta 1000.
- WAF Rate Limiting permite fixed window en todos los planes y token bucket en Enterprise. La ventana minima es 10s; Hobby/Pro permiten hasta 10min y Enterprise hasta 1h.
- Las claves incluidas para contar rate limits en Hobby/Pro son IP y JA4 Digest. Enterprise agrega User-Agent y headers arbitrarios.
- El numero de reglas de rate limiting cambia por plan: Hobby 1 por proyecto, Pro 40 por proyecto, Enterprise 1000 por proyecto.
- Bot Protection Managed Ruleset esta disponible en todos los planes y puede ejecutarse en Log o Challenge Mode. Desafia trafico que no se comporta como navegador real y excluye bots verificados como Google.
- AI Bots Managed Ruleset esta disponible en todos los planes para registrar o denegar crawlers de IA conocidos.
- OWASP Core Ruleset es una capacidad Enterprise.
- `@vercel/firewall` permite invocar rate limiting desde codigo con `checkRateLimit` y `rateLimitKey` cuando hacen falta condiciones de aplicacion no expresables solo desde el dashboard.

Fuentes oficiales verificadas:

- Vercel Firewall: https://vercel.com/docs/vercel-firewall
- Vercel WAF: https://vercel.com/docs/vercel-firewall/vercel-waf
- WAF Rate Limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- WAF Custom Rules: https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
- Bot Management: https://vercel.com/docs/bot-management
- Rate Limiting SDK: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk
- Usage and Pricing: https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing

Lo que Vercel resuelve bien para este proyecto:

- Bloquear o limitar requests antes de ejecutar Route Handlers.
- Reducir abuso de bots genericos contra endpoints publicos obvios.
- Aplicar limites por path, metodo, IP y JA4 sin escribir codigo.
- Observar top IPs, paths, user agents y acciones del firewall antes de endurecer reglas.

Lo que Vercel no resuelve completamente en Fase 1:

- Limites por email normalizado.
- Limites por usuario autenticado.
- Limites por campana de donacion.
- Bloqueo progresivo por cuenta.
- Reglas basadas en el resultado interno de la operacion, por ejemplo fallos de login o archivos invalidos.
- Proteccion de EmailJS si el formulario se envia directamente desde cliente hacia EmailJS.

### Validaciones existentes relevantes

Puntos positivos:

- Donaciones validan que el comprobante exista.
- Comprobantes aceptan solo JPEG/PNG, maximo 5 MB, y validan firma real del archivo.
- Archivos de facturas admin tambien validan firma JPEG/PNG.
- Campanas limitan imagenes adicionales y facturas a 2 archivos.
- APIs publicas paginadas limitan `pageSize`.
- Recuperacion de password usa respuesta generica para no revelar si existe el email.
- Tokens de email/password se hashean antes de guardarse.
- Certificados usan `publicId` unico, no ID numerico publico.

Limitaciones:

- La validacion de archivo ocurre despues de leer `formData`, por lo que un flood multipart igual consume recursos.
- `POST /api/donations` sube a Cloudinary antes de validar toda la donacion en base de datos.
- Registro devuelve `409` cuando el email existe; eso puede facilitar enumeracion.
- Login devuelve errores diferenciados desde Credentials.
- No hay limites por IP, email, usuario, sesion o endpoint.
- `POST /api/telegram` esta expuesto sin autenticacion.
- Contacto usa EmailJS desde cliente, fuera del control de Route Handlers propios.

## Clasificacion por endpoint y funcionalidad

### Autenticacion

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `POST /api/auth/[...nextauth]` - login Credentials | Si | Rate limit estricto | Alto | Fuerza bruta, costo CPU por bcrypt, enumeracion por mensajes, intentos masivos contra admins | Alta |
| `GET /api/auth/[...nextauth]` - sesion, CSRF, providers, callbacks | Parcial | Rate limit liviano / excluir subrutas internas criticas de CSRF | Bajo/Medio | Ruido, carga de sesion, posible degradacion de auth si se limita mal | Futura |
| OAuth Google via NextAuth | No en app propia | Debe excluirse completamente de limites agresivos | Bajo | Bloquear callbacks romperia login legitimo; Google ya aplica protecciones propias | Baja |
| `POST /api/auth/register` | Si | Rate limit estricto | Alto | Creacion masiva de usuarios, envio de emails de confirmacion, consumo de bcrypt y DB, enumeracion de emails existentes | Alta |
| `POST /api/auth/forgot-password` | Si | Rate limit estricto | Alto | Bombardeo de emails, generacion masiva de tokens, abuso de Resend, ruido operativo | Alta |
| `POST /api/auth/reset-password` | Si | Rate limit medio | Medio/Alto | Fuerza bruta de tokens aunque sean fuertes, costo de bcrypt si el token es valido, ruido de intentos | Futura |
| `GET /api/auth/verify-email?token=...` | Si | Rate limit medio | Medio | Enumeracion/flood de tokens, carga de DB, consumo de tokens validos si hay automatismos raros | Futura |
| Paginas `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` | Solo liviano a nivel plataforma | Rate limit liviano | Bajo | Scraping/carga de pagina; el riesgo real esta en los POST/GET de API | Baja |

Recomendacion:

- Fase 1: proteger solo login Credentials, registro y forgot-password con Vercel WAF Rate Limiting por path/metodo, contado por IP y JA4.
- No implementar todavia limites por email, bloqueo progresivo ni persistencia propia de intentos.
- Reset password y verify-email quedan como endurecimiento futuro: tienen tokens fuertes y menor probabilidad de abuso inicial que login, registro y recuperacion.
- No aplicar limites agresivos a callbacks OAuth ni rutas CSRF/proveedores de NextAuth.

### Donaciones publicas

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `POST /api/donations` | Si | Rate limit estricto | Muy alto | Uploads a Cloudinary, almacenamiento de comprobantes, DB writes, revalidaciones, notificaciones Telegram, posible costo economico | Alta |
| Formulario de donacion en `/quiero-ser-parte` | Si, a traves del endpoint | Rate limit estricto | Muy alto | Envio repetido de comprobantes falsos o archivos grandes; saturacion administrativa | Alta |
| `GET /api/donation-campaigns/current` | Si | Rate limit liviano | Bajo/Medio | Carga repetida de DB; endpoint `no-store`; usado al cargar pagina de donacion | Futura |
| `GET /api/donation-campaigns` | Si | Rate limit liviano | Bajo/Medio | Scraping o flood de listado; pagina publica legitima | Futura |
| `GET /api/donation-campaigns/[id]/donors` | Si | Rate limit liviano | Medio | Scraping de nombres publicos, paginacion repetida contra DB | Futura |
| Pagina `/campanas-dea` | No directo | No requiere rate limit | Bajo | Pagina publica; limitar endpoint si hace falta | Baja |
| Pagina `/quiero-ser-parte` | No directo | No requiere rate limit | Bajo | Pagina publica; proteger `POST /api/donations` | Baja |

Recomendacion:

- Fase 1: proteger `POST /api/donations` con Vercel WAF Rate Limiting por path/metodo, contado por IP y JA4, antes de que se ejecute la Function.
- No implementar todavia limites por email, campana ni concurrencia propia en la aplicacion.
- Mantener validacion de archivo y tamano como defensa de aplicacion, pero asumir que Vercel WAF es la primera barrera contra bots que repiten submits.
- Las lecturas publicas de campanas quedan como baja prioridad/futuras para no afectar navegacion normal.

### Contacto

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| Formulario `/contacto` con EmailJS cliente | Si, pero no desde backend actual | Rate limit medio | Medio/Alto | Spam, abuso de cuota EmailJS, exposicion operativa de servicio/template/public key, ruido en casilla | Futura |
| Pagina `/contacto` | No directo | No requiere rate limit | Bajo | Pagina publica; el riesgo esta en el envio EmailJS | Baja |

Recomendacion:

- No incluir contacto en Fase 1 de rate limiting porque no pasa por un Route Handler propio.
- Como tarea operativa futura, revisar protecciones del lado de EmailJS: dominio permitido, cuotas, captcha si esta disponible y templates restringidos.
- Mover contacto a un Route Handler propio solo si aparece spam real o se necesita control fino.

### Certificados

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `GET /certificado/validar/[publicId]` | Si | Rate limit liviano/medio | Medio | Scraping/enumeracion de certificados, carga DB, generacion QR en pagina | Futura |
| `GET /api/certificates/validate/[publicId]` | Si | Rate limit medio | Medio | Enumeracion de `publicId`, scraping de datos del certificado, carga DB | Futura |
| `GET /api/me/certificates` | Si | Rate limit liviano por usuario | Bajo/Medio | Usuario autenticado puede refrescar y cargar DB; datos propios | Baja |
| `GET /api/certificates` admin | Opcional | No requiere rate limit por ahora | Bajo | Admin autenticado, paginado y limitado; riesgo bajo con pocos admins | Baja |
| `POST /api/certificates` admin | Opcional | Rate limit liviano | Bajo/Medio | Creacion repetida si una sesion admin esta comprometida; DB writes | Baja |
| `GET /api/certificates/[publicId]` admin | Opcional | No requiere rate limit por ahora | Bajo | Admin autenticado, lectura puntual | Baja |
| `PUT /api/certificates/[publicId]` admin | Opcional | Rate limit liviano | Bajo/Medio | Cambios repetidos; impacto depende de sesion admin | Baja |
| `DELETE /api/certificates/[publicId]` admin | Opcional | Rate limit liviano | Medio | Desactivacion masiva si hay sesion admin comprometida; rate limit no reemplaza auditoria/permisos | Futura |
| `POST /api/certificates/bulk` admin - validar Excel | Si | Rate limit medio | Medio | Parseo Excel en servidor, consumo CPU/memoria, respuesta con preview | Futura |
| `POST /api/certificates/bulk` admin - crear certificados | Si | Rate limit medio | Medio/Alto | Creacion masiva en DB, seriales, publicIds, posible operacion pesada | Futura |

Recomendacion:

- No incluir certificados en Fase 1 salvo evidencia concreta de scraping o enumeracion.
- Validacion publica: en una fase futura, evaluar limite liviano/medio por IP/JA4 desde Vercel WAF. Limites por `publicId` requeririan logica de aplicacion y no son necesarios ahora.
- Bulk admin: queda como evolucion futura; si se protege, conviene hacerlo por usuario admin con SDK o storage propio, no en la primera etapa.
- Para `DELETE` admin, priorizar logs/auditoria y confirmaciones funcionales; el rate limit ayuda pero no es la defensa principal.

### Noticias

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `GET /api/news` | Opcional | Rate limit liviano | Bajo | Lectura publica cacheada por `getPublicNews`; filtros/search pueden generar variantes | Baja |
| `GET /api/news/[id]` | Opcional | Rate limit liviano | Bajo | Lectura publica por ID; tiene `connection()` y DB lookup | Baja |
| `GET /api/news/lastThreeNews` | No por ahora | No requiere rate limit | Bajo | Lectura cacheada de ultimas noticias | Baja |
| `GET /api/news/get-all` | Si | Rate limit liviano o restringir a admin en futuro | Medio | Devuelve todas las noticias sin paginacion; usado por contexto dashboard pero publico | Futura |
| `POST /api/news` admin | Opcional | Rate limit liviano | Bajo/Medio | Puede subir imagen base64 a Cloudinary y escribir DB, pero requiere admin | Baja |
| `PUT /api/news/[id]` admin | Opcional | Rate limit liviano | Bajo/Medio | Puede destruir/subir imagen en Cloudinary y revalidar | Baja |
| `DELETE /api/news/[id]` admin | Opcional | Rate limit liviano | Bajo/Medio | Borra DB y asset Cloudinary; riesgo principal es sesion admin comprometida | Baja |
| Paginas `/noticias` y home con ultimas noticias | No directo | No requiere rate limit | Bajo | Proteger endpoints si aparece abuso | Baja |

Recomendacion:

- No priorizar noticias en Fase 1.
- `get-all` publico es mas un tema de exposicion/datos y paginacion que de rate limiting. Si se mantiene publico, limite liviano.

### Cursos / capacitaciones

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `GET /api/courses` | Opcional | Rate limit liviano | Bajo | Lectura publica cacheada con filtros/search | Baja |
| `GET /api/courses/[id]` | Opcional | Rate limit liviano | Bajo | Lectura publica cacheada por ID | Baja |
| `GET /api/courses/get-all` | Si | Rate limit liviano o restringir a admin en futuro | Medio | Devuelve todos los cursos con lecciones sin paginacion; usado por dashboard pero publico | Futura |
| `POST /api/courses` admin | Opcional | No requiere rate limit por ahora | Bajo | Admin autenticado, DB write simple | Baja |
| `PUT /api/courses` admin | Opcional | Rate limit liviano | Bajo/Medio | Borra y recrea lecciones; puede ser costoso si se repite | Baja |
| `PUT /api/courses/[id]` admin | Opcional | Rate limit liviano | Bajo/Medio | Borra y recrea lecciones | Baja |
| `DELETE /api/courses/[id]` admin | Opcional | Rate limit liviano | Bajo/Medio | Borrado admin; riesgo principal es cuenta comprometida | Baja |
| Paginas `/capacitaciones` y `/capacitaciones/[id]` | No directo | No requiere rate limit | Bajo | Lectura publica normal | Baja |

Recomendacion:

- No priorizar en Fase 1.
- Mantener limites de `pageSize` y cache.
- Revisar si `get-all` debe ser publico o admin-only en una fase de endurecimiento.

### Campanas y donaciones admin

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `GET /api/admin/donations` | Opcional | No requiere rate limit por ahora | Bajo | Admin autenticado, paginado | Baja |
| `GET /api/admin/donations/[id]` | Opcional | No requiere rate limit por ahora | Bajo | Lectura admin puntual | Baja |
| `GET /api/admin/donations/[id]/receipt` | Si | Rate limit liviano/medio | Medio | Genera URL firmada Cloudinary para comprobante privado; abuso puede exponer muchas URLs si hay sesion comprometida | Futura |
| `POST /api/admin/donations/[id]/approve` | Opcional | Rate limit liviano | Medio | Cambia estado, recalcula campana, revalida vistas | Futura |
| `POST /api/admin/donations/[id]/reject` | Opcional | Rate limit liviano | Bajo/Medio | Cambia estado de donacion | Baja |
| `POST /api/admin/donations/[id]/reopen` | Opcional | Rate limit liviano | Medio | Reabre, recalcula campana, revalida | Futura |
| `PATCH /api/admin/donations/[id]/amount` | Opcional | Rate limit liviano | Medio | Cambia montos aprobados y progreso publico | Futura |
| `GET /api/admin/donation-campaigns` | Opcional | No requiere rate limit por ahora | Bajo | Admin autenticado, paginado | Baja |
| `POST /api/admin/donation-campaigns` | Si | Rate limit medio | Medio/Alto | Uploads a Cloudinary de imagen del lugar, facturas e imagenes adicionales; DB writes | Futura |
| `GET /api/admin/donation-campaigns/[id]` | Opcional | No requiere rate limit por ahora | Bajo | Lectura admin puntual | Baja |
| `PUT /api/admin/donation-campaigns/[id]` | Si | Rate limit medio | Medio/Alto | Puede reemplazar imagenes/facturas, destruir assets, subir nuevos assets | Futura |
| `PATCH /api/admin/donation-campaigns/[id]` | Opcional | Rate limit liviano | Medio | Cambia estado publico de campana; revalida | Futura |
| `GET /api/admin/donation-campaigns/[id]/donors-export` | Si | Rate limit medio | Medio | Genera Excel en memoria con datos de donantes aprobados | Futura |

Recomendacion:

- No incluir APIs admin en Fase 1. Ya requieren sesion admin y el trafico esperado es bajo.
- Para uploads admin, exports y URLs firmadas, dejar rate limits como evolucion futura si el uso administrativo crece o aparece abuso con sesion valida.
- No limitar cada click del dashboard; si se agregan limites futuros, deben enfocarse solo en operaciones que escriben, exportan, firman URLs o suben archivos.

### Telegram

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `POST /api/telegram` | No deberia estar publico | Debe excluirse completamente | Muy alto | Cualquier visitante puede disparar mensajes al chat configurado; spam, bloqueo de bot, ruido operacional | Alta |
| Notificacion interna desde `POST /api/donations` | Si indirecto | Cubierto por limite estricto en donaciones | Alto | Cada donacion falsa puede disparar Telegram | Alta |

Recomendacion:

- Sacar `POST /api/telegram` de produccion publica o protegerlo con admin/session/secreto.
- No basta con rate limit liviano porque el endpoint no representa una accion publica legitima.

### Perfil de usuario

| Endpoint / funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `/mi-perfil` | No directo | No requiere rate limit | Bajo | Pagina server-side autenticada; redirige si no hay sesion | Baja |
| `GET /api/me/certificates` | Si leve | Rate limit liviano | Bajo/Medio | Consultas repetidas de certificados propios | Baja |

Recomendacion:

- Limite por usuario autenticado amplio. No aplicar limites que hagan molesta la experiencia de perfil.

### Paginas estaticas, assets y contenido institucional

| Funcionalidad | Necesita rate limit | Clasificacion | Riesgo | Impacto de abuso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| Paginas institucionales sin formularios | No | No requiere rate limit | Bajo | Trafico estatico o render normal; CDN/plataforma absorben mejor que la app | Baja |
| Archivos en `public/` | No desde app | Debe excluirse completamente | Bajo | Limitar assets puede romper UX; usar CDN/cache/plataforma | Baja |
| Imagenes remotas Cloudinary usadas en paginas | No desde app | Debe excluirse completamente | Bajo | Cloudinary/CDN gestiona delivery; no poner limites en app propia | Baja |

## Estrategia tecnologica recomendada

La decision tecnologica debe estar alineada con el estado actual del proyecto: bajo trafico, pocos endpoints realmente criticos, necesidad de simplicidad y bajo mantenimiento. No se necesita una solucion pensada para millones de requests.

| Alternativa | Ventajas | Desventajas | Complejidad / mantenimiento | Costo | Momento recomendado |
| --- | --- | --- | --- | --- | --- |
| Vercel WAF | Integrado a la plataforma; corta requests antes de ejecutar Functions; no requiere Redis, tablas ni middleware propio; permite reglas por path/metodo/IP/JA4; aporta observabilidad y Bot Protection | Menos granularidad de negocio; en Hobby solo hay 1 regla de rate limiting por proyecto; IP/JA4 no permite limitar por email, usuario o campana | Baja. Se configura desde Vercel Dashboard y se ajusta con logs | WAF Rate Limiting se cobra por allowed requests segun region; Vercel documenta precio base desde USD 0.50 por 1M allowed requests | Fase 1, recomendacion principal |
| Upstash Redis | Muy bueno para rate limits por claves de negocio; serverless-friendly; permite email/usuario/campana/endpoint con precision | Agrega servicio, credenciales, dependencia operativa y codigo propio | Media. Requiere helpers, variables, tests y monitoreo | Costo adicional segun plan/uso de Upstash | Futura, si Vercel no alcanza o se necesitan limites por negocio |
| PostgreSQL/Neon | No agrega proveedor; auditable en la misma DB; suficiente para bajo trafico si se implementa con operaciones atomicas | Cada check golpea la base; no bloquea antes de la app; bajo flood puede cargar Neon; requiere tabla y limpieza | Media. Requiere schema, migracion, helper, queries atomicas y mantenimiento | Sin proveedor nuevo, pero consume recursos de Neon | Fallback futuro si se necesita granularidad sin sumar servicios |
| Arcjet | SDK para Next.js con rate limiting, bot protection, email validation y WAF app-level; buena ergonomia para reglas por ruta | Agrega proveedor, SDK, key, costo mensual/uso y decisiones dentro del codigo | Media/Alta. Es mas producto del necesario para esta etapa | Planes pagos y cobro por uso segun features | Futura, si se busca una capa app-level mas completa que Vercel WAF |

Recomendacion explicita para este proyecto: empezar con Vercel WAF y Bot Protection. La primera implementacion no debe agregar Redis, Upstash, PostgreSQL como rate limiter, Arcjet, middleware propio ni una tabla `RateLimit`. Para Argentina Reanima hoy, Vercel resuelve el problema mas probable: bots genericos o automatizacion simple contra endpoints publicos costosos.

## Estrategia recomendada

### Principio de aplicacion

La Fase 1 debe proteger solo cuatro endpoints criticos con Vercel Firewall/WAF:

- Login Credentials via `POST /api/auth/[...nextauth]`.
- `POST /api/auth/register`.
- `POST /api/auth/forgot-password`.
- `POST /api/donations`.

No implementar todavia:

- Redis, Upstash o PostgreSQL/Neon como backend de rate limiting.
- Tabla `RateLimit`.
- Middleware propio.
- Logica distribuida de contadores.
- Bloqueo progresivo.
- Limites por email.
- Limites por usuario autenticado.
- Limites por campana.

### Criterios de Vercel WAF para Fase 1

Usar condiciones simples:

- Request Path.
- HTTP Method.
- IP.
- JA4 Digest, si esta disponible como counting key en el plan.
- Accion inicial `Log` cuando se quiera observar primero.
- Accion final `429` o `Challenge` cuando la regla este validada.

No usar en Fase 1:

- Inspeccion de body.
- Claves de email.
- Claves de usuario.
- Claves de campana.
- Dependencias en codigo.
- Reglas para todo `/api/*` salvo que el plan Hobby obligue a agrupar por tener una sola regla de rate limiting.

### Umbrales iniciales sugeridos

Los valores exactos deben ajustarse desde el dashboard de Vercel observando trafico real. Para bajo trafico, conviene empezar conservador:

| Endpoint | Ventana | Limite inicial | Accion inicial | Accion final sugerida |
| --- | --- | --- | --- | --- |
| Login Credentials | 60s | 10 requests por IP/JA4 | Log | 429 |
| `POST /api/auth/register` | 10min | 5 requests por IP/JA4 | Log | 429 |
| `POST /api/auth/forgot-password` | 10min | 5 requests por IP/JA4 | Log | 429 |
| `POST /api/donations` | 10min | 3 requests por IP/JA4 | Log | 429 o Challenge |

Notas:

- Si el proyecto esta en Hobby y solo hay 1 regla de rate limiting, priorizar una regla agrupada para los cuatro endpoints criticos por path/metodo, con umbral conservador. Si se necesita separar reglas por endpoint, evaluar Pro antes de escribir infraestructura propia.
- Si Vercel permite usar Challenge para bots sospechosos sin afectar navegadores reales, `POST /api/donations` es el mejor candidato porque evita Cloudinary, Prisma y Telegram antes de ejecutar la app.
- Mantener fuera de reglas agresivas los callbacks OAuth, rutas CSRF/proveedores de NextAuth, assets y paginas institucionales.

### Bot Protection

Activar Bot Protection Managed Ruleset primero en Log Mode. Revisar durante un periodo inicial:

- Top paths afectados.
- User agents.
- IPs y JA4.
- Requests desafiadas o candidatas a desafio.
- Posibles falsos positivos en login, registro y donaciones.

Pasar a Challenge Mode solo si los logs muestran trafico automatizado o si no afecta flujos legitimos.

### Evolucion futura

Solo si aparecen limitaciones reales:

- Usar `@vercel/firewall` SDK si se necesita `rateLimitKey` desde codigo y se quiere seguir dentro de Vercel.
- Usar Upstash Redis si se necesitan limites por email, usuario, campana o bloqueo progresivo con mejor tolerancia a serverless.
- Usar PostgreSQL/Neon si se quiere granularidad de negocio sin sumar proveedor, aceptando que cada check toca la base.
- Usar Arcjet si se quiere combinar rate limiting, bot protection, validacion de email y WAF app-level dentro del codigo.

## Plan por fases

### Fase 1 - Vercel-first, sin codigo

Objetivo: cubrir los cuatro endpoints que pueden generar costo, spam o abuso directo sin agregar infraestructura ni mantenimiento propio.

1. Crear una regla WAF para Login Credentials via `POST /api/auth/[...nextauth]`, acotada al path/metodo real usado por NextAuth Credentials. Contar por IP/JA4. Empezar en Log si se quiere observar; pasar a `429` cuando se valide.
2. Crear una regla WAF para `POST /api/auth/register`. Contar por IP/JA4. Usar limite bajo por ventana de 10 minutos.
3. Crear una regla WAF para `POST /api/auth/forgot-password`. Contar por IP/JA4. Usar limite bajo por ventana de 10 minutos.
4. Crear una regla WAF para `POST /api/donations`. Contar por IP/JA4. Usar limite estricto y considerar `Challenge` si aparece trafico automatizado.
5. Activar Bot Protection Managed Ruleset en Log Mode.
6. Revisar `POST /api/telegram` como hallazgo separado: cerrarlo, protegerlo o quitarlo de produccion. No tratarlo como endpoint publico normal.

No hacer en Fase 1:

- No instalar librerias.
- No modificar Route Handlers.
- No crear tabla `RateLimit`.
- No agregar middleware.
- No implementar limites por email, usuario, sesion o campana.
- No implementar bloqueo progresivo.

### Fase 2 - Ajuste con observabilidad

Objetivo: usar datos reales antes de sumar complejidad.

1. Revisar en Vercel Firewall los paths, top IPs, JA4, user agents, acciones y volumen de requests.
2. Ajustar umbrales si hay falsos positivos o si los limites quedan demasiado laxos.
3. Pasar Bot Protection a Challenge Mode solo si el Log Mode muestra bots reales y el flujo de usuarios legitimos no se ve afectado.
4. Evaluar si hace falta proteger certificados publicos, `reset-password`, `verify-email`, contacto o endpoints admin. Por defecto quedan fuera.
5. Revisar si `GET /api/news/get-all` y `GET /api/courses/get-all` deben seguir siendo publicos. Esto es mas una decision de exposicion que de rate limiting.

### Fase 3 - Evolucion opcional

Objetivo: incorporar granularidad solo si el trafico o incidentes reales lo justifican.

1. Evaluar `@vercel/firewall` SDK para mantener contadores en Vercel pero decidir desde codigo.
2. Evaluar Upstash Redis para limites por email, usuario, campana o bloqueo progresivo.
3. Evaluar PostgreSQL/Neon como fallback simple si se quiere evitar un proveedor nuevo.
4. Evaluar Arcjet si se busca proteccion app-level mas amplia.
5. Agregar monitoreo/alertas para picos en `POST /api/donations`, auth failures y forgot-password si la operacion lo requiere.

## Tabla final priorizada por riesgo

| Prioridad | Endpoint / funcionalidad | Riesgo | Accion recomendada |
| --- | --- | --- | --- |
| Alta | Login Credentials via `POST /api/auth/[...nextauth]` | Alto | Vercel WAF Rate Limiting por path/metodo, contado por IP/JA4; empezar en Log y pasar a 429 |
| Alta | `POST /api/auth/register` | Alto | Vercel WAF Rate Limiting por IP/JA4, limite bajo por ventana |
| Alta | `POST /api/auth/forgot-password` | Alto | Vercel WAF Rate Limiting por IP/JA4, limite bajo por ventana |
| Alta | `POST /api/donations` - envio de comprobantes | Muy alto | Vercel WAF Rate Limiting estricto por IP/JA4; considerar Challenge si aparecen bots |
| Alta tecnica separada | `POST /api/telegram` | Muy alto | Cerrar, proteger o quitar de produccion; no tratar como rate limit publico normal |
| Baja/Futura | `POST /api/auth/reset-password` | Medio/Alto | Evaluar Vercel WAF o SDK si aparece abuso; no implementar en Fase 1 |
| Baja/Futura | `GET /api/auth/verify-email` | Medio | Evaluar limite futuro si aparecen floods de tokens |
| Baja/Futura | `GET /api/certificates/validate/[publicId]` y `/certificado/validar/[publicId]` | Medio | Mantener analisis; evaluar WAF liviano si aparece scraping |
| Baja/Futura | Formulario `/contacto` con EmailJS cliente | Medio/Alto | Revisar protecciones de EmailJS; backend propio solo si hay spam real |
| Baja/Futura | `GET /api/donation-campaigns/current`, `GET /api/donation-campaigns`, `GET /api/donation-campaigns/[id]/donors` | Bajo/Medio | No implementar en Fase 1; evaluar si hay scraping o carga repetida |
| Baja/Futura | `POST /api/certificates/bulk` | Medio/Alto | Evaluar por usuario admin con SDK/storage propio si crece el uso |
| Baja/Futura | Uploads y exports admin de campanas/donaciones | Medio/Alto | Mantener fuera de Fase 1; evaluar si hay abuso con sesion admin |
| Baja/Futura | `GET /api/news/get-all` y `GET /api/courses/get-all` | Medio | Revisar si deben ser admin-only; no priorizar rate limit inicial |
| Baja | `GET /api/news`, `GET /api/news/[id]`, `GET /api/news/lastThreeNews` | Bajo | Sin rate limit por ahora |
| Baja | `GET /api/courses`, `GET /api/courses/[id]` | Bajo | Sin rate limit por ahora |
| Baja | Dashboard admin autenticado | Bajo | Sin rate limit general por ahora |
| Baja | Paginas institucionales y assets publicos | Bajo | Excluir de rate limits de aplicacion; usar CDN/plataforma |
