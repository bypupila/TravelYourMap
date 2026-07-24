# Runbook de errores y alertas Sentry

## Alcance

Este procedimiento cubre incidentes de producción de TravelYourMap en la organización `by-pupila`, proyecto `youmap`. Sentry se usa con las funciones ya disponibles; Seer y cualquier complemento pago permanecen fuera de alcance salvo aprobación explícita.

## Configuración esperada

- `SENTRY_ENABLED=1` y `NEXT_PUBLIC_SENTRY_ENABLED=1` únicamente en producción.
- `SENTRY_ALLOW_NON_PRODUCTION=0` y `NEXT_PUBLIC_SENTRY_ALLOW_NON_PRODUCTION=0` para impedir que local o Preview contaminen producción.
- `SENTRY_ORG=by-pupila`, `SENTRY_PROJECT=youmap` y ambientes server/browser iguales a `production`.
- DSN server/browser idénticos y token de build limitado al upload de source maps.
- Regla `3737923`: email al usuario asociado a `daguilarfeener@gmail.com` ante primera aparición, regresión, reapertura o resolución; máximo una notificación por incidencia cada 60 minutos.
- Regla `3317543`: email a propietarios del issue para incidencias nuevas o existentes de prioridad alta.

## Triage

1. Confirmar que el evento tenga `environment:production` y una URL pública, no `localhost` ni Preview.
2. Identificar release, ruta, operación y cantidad de usuarios afectados sin copiar PII o tokens.
3. Clasificar:
   - P0: cobros erróneos, fuga o pérdida de datos, acceso entre cuentas, indisponibilidad general.
   - P1: checkout, webhook, login, importación o mapa público inutilizable sin alternativa.
   - P2: función parcial degradada o fallo de Sponsors sin impacto de seguridad/cobro.
   - P3: error cosmético o ruido controlado.
4. Correlacionar con logs de Vercel del mismo release y período.
5. No tratar respuestas esperadas 4xx, rate limits o validaciones como incidentes 5xx.

## Contención y recuperación

- P0/P1: detener promoción, conservar evidencia saneada y volver al último deployment verificado si el defecto proviene del release.
- Pagos: deshabilitar el acceso al checkout antes que alterar suscripciones manualmente; verificar Polar y webhooks antes de reabrir.
- Importación: no duplicar workers. Consultar el estado del run y seguir `docs/IMPORT_RUNBOOK.md`.
- Tokens privados: revocar el enlace afectado y rotarlo; nunca pegarlo en Sentry, tickets o chats.
- Base de datos: usar la rama de respaldo/restore ensayada; no ejecutar rollback destructivo sin verificar el objetivo exacto.

## Cierre

Un issue se resuelve solamente cuando el release corregido está desplegado, la ruta fue regresionada y no reaparece en el período de observación acordado. Registrar causa, corrección, prueba y release. Los issues históricos no se cierran en bloque.

## Control posterior a cada deployment

1. Buscar issues sin resolver de `environment:production` y del release publicado.
2. Consultar eventos de error y logs Vercel del mismo período.
3. Probar status, login, mapa público, checkout, webhook e importación según el alcance del cambio.
4. Confirmar que las alertas `3737923` y `3317543` sigan habilitadas.

## Pendiente organizativo antes del cobro público

El responsable humano, horario de vigilancia y tiempo de respuesta comprometido deben ser aprobados y registrados. La configuración técnica por sí sola no constituye soporte operativo.
