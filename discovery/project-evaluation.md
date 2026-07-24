# Evaluación del proyecto TravelYourMap

Fecha: 2026-07-24  
Fuente: revisión del repositorio, documentación, build, release gate y smoke local.

## Estado actual

- Producto: MVP amplio y funcional en landing, onboarding, auth, mapa público/creator, explore, sponsors, analytics y billing Polar.
- Arquitectura: Next.js 16 + React 19, Neon Postgres, YouTube API, Polar, Sentry/PostHog opcionales.
- Calidad estática: `npm run lint`, `npx tsc --noEmit --incremental false` y `npm run build` pasan.
- Smoke local: 3 de 4 checks pasan; falla el CTA de registro esperado en el mapa demo.
- Entorno/DB: release gate `ready=false`; las migraciones 0030–0040 están pendientes y el build detecta que falta `channels.ownership_status` al generar sitemap.
- Entrega: hay muchos cambios modificados/no commiteados en `main`; no conviene iniciar nuevas features antes de consolidarlos.

## Preguntas de decisión

### Alta

1. **¿Cuál es el entorno objetivo de la siguiente entrega?**
   - Impacto: define migraciones, Polar, ownership y criterios de validación.
   - Recomendación: staging/preview aislado antes de producción.
   - Estado: abierta.

2. **¿Se va a lanzar como beta cerrada o como producto público?**
   - Impacto: determina verificación de titularidad, observabilidad, soporte y tolerancia a datos demo.
   - Recomendación: beta cerrada con 1–3 canales verificados.
   - Estado: abierta.

3. **¿Qué flujo es prioritario para la primera conversión?**
   - Impacto: landing → demo → registro → checkout/importación.
   - Recomendación: demo pública → onboarding real → checkout Polar → importación.
   - Estado: inferida por el producto; confirmar.

### Media

4. **¿El idioma MVP principal es español?** Recomendación: sí, con inglés como variante validada por separado. Estado: inferida.
5. **¿El demo debe ser sólo lectura y no persistente?** Recomendación: sí. Estado: implementado según tracker; falta verificar CTA en smoke.
6. **¿Qué canales pueden ser públicos?** Recomendación: sólo canales con `ownership_status=verified`. Estado: implementado en código, bloqueado por migraciones pendientes.
7. **¿Cuál es la fuente operativa de verdad para planes?** Recomendación: `src/lib/plans.ts` + IDs Polar/Neon sincronizados. Estado: implementado; falta gate real de producción.

### Baja/Futuro

- Refinamiento visual responsive de onboarding, procesamiento y mapa.
- Tests E2E de auth → onboarding → checkout → importación.
- Experimentos de adquisición, sponsors avanzados y colaboración comercial.

## Riesgos principales

1. Código nuevo consulta columnas/tablas que la base configurada todavía no tiene.
2. Cambios no commiteados dificultan distinguir regresiones de trabajo pendiente.
3. Falta una suite de pruebas automatizadas persistente; hoy el smoke depende de servidor local.
4. El checkout tiene credenciales parciales en el entorno actual (`POLAR_ORGANIZATION_ID` y `POLAR_SERVER` faltantes según gate).

## Criterio de cierre de la evaluación

No iniciar una feature nueva hasta: sincronizar DB, cerrar el CTA del demo, consolidar cambios en una rama de release y ejecutar el checklist Go/No-Go en un entorno objetivo.
