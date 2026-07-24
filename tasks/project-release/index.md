# Tareas de release beta

## Completadas

### 01. Sincronizar Neon

- Objetivo: aplicar migraciones 0030–0040.
- Validación: `npm run db:migrations:status` y `npm run release:gate`.
- Estado: completada.

### 02. Corregir CTA del demo

- Objetivo: exponer `Crear cuenta gratis` en el mapa demo.
- Archivo: `src/components/map/map-experience-core.tsx`.
- Validación: `npm run mvp:smoke` (4/4 checks).
- Estado: completada.

## Pendientes

### 03. Configurar Polar para staging

- Objetivo: completar token válido, organización, servidor y webhook.
- Dependencia: credenciales del entorno objetivo.
- Validación: `npm run release:gate` debe quedar sin blockers.

### 04. Rotar token Polar

- Objetivo: reemplazar el token expirado/revocado en Polar y actualizar `POLAR_ACCESS_TOKEN` en Vercel Production y `.env.local`.
- Estado: bloqueada por credencial externa; el gate identifica `401 invalid_token`.
- Verificación adicional: los tokens de Production y Preview tampoco autentican contra Polar.
