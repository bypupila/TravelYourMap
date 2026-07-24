# Contrato de implementación: preparar release beta

Fecha: 2026-07-24

## Objetivo

Dejar la base configurada y el flujo demo verificables para continuar con una beta cerrada.

## Alcance ejecutado

- Aplicar migraciones Neon pendientes `0030`–`0040`.
- Corregir el CTA del modo demo para que el smoke test y la conversión usen `Crear cuenta gratis`.
- Validar gate de release, build y smoke local.

## Fuera de alcance

- No modificar secretos ni inventar credenciales de Polar.
- No marcar canales reales como verificados sin evidencia de titularidad.
- No crear commit ni desplegar.

## Dependencias y riesgo restante

- `POLAR_ACCESS_TOKEN` configurado en el entorno actual devuelve `401`; falta renovar/configurar credenciales y `POLAR_ORGANIZATION_ID`.
- El gate de release queda bloqueado únicamente por configuración Polar.
- El organization ID y `POLAR_SERVER=production` ya quedaron configurados en `.env.local` y en Vercel Production.
- La rotación del token requiere una acción autenticada en Polar; no se puede generar desde el código.
- Se verificaron Vercel Production y Preview; ningún token disponible autentica contra `api.polar.sh`.

## Criterios de aceptación

- Las 40 migraciones aparecen aplicadas.
- `channels.ownership_status` existe y el gate valida ownership.
- `/map?channelId=demo-channel` responde `200`, muestra modo demo y `Crear cuenta gratis`.
- Lint, TypeScript, build y smoke pasan.

## Validación

- `npm run db:migrate`: aplicado correctamente.
- `npm run release:gate`: 1 blocker restante, Polar.
- `npm run mvp:smoke`: 4/4 checks correctos.
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: correcto, sin warning de sitemap.
- `npm run release:gate`: 1 blocker restante, configuración Polar.
