# Roadmap de trabajo TravelYourMap

Fecha: 2026-07-24

## P0 — Preparar una entrega verificable

1. **Consolidar cambios del working tree**: clasificar, revisar diff, ejecutar validaciones y crear una rama de release.
2. **Sincronizar Neon**: aplicar/verificar migraciones 0030–0040 en staging; comprobar tablas, columnas, ownership y checksums.
3. **Cerrar configuración Polar**: completar organización/servidor correctos y probar checkout + webhook con un plan real.
4. **Corregir el CTA del modo demo**: el smoke actual falla porque `/map?channelId=demo-channel` no expone la llamada a registro.
5. **Repetir release gate y smoke** con servidor local y entorno staging.

## P1 — Beta utilizable

1. Validar un canal real con ownership verificado y una importación completa.
2. Ejecutar QA responsive en 390×844 y desktop para onboarding, processing, mapa y media kit.
3. Añadir pruebas E2E mínimas para auth, consentimientos, demo→registro, checkout e importación.
4. Activar Sentry/observabilidad en staging y definir alertas operativas.
5. Completar el Go/No-Go checklist con evidencia y responsables.

## P2 — Producto público y crecimiento

1. Medir conversión landing → demo → registro → checkout.
2. Mejorar Explore, thumbnails y deep links según datos de uso.
3. Validar SEO por creador, sitemap dinámico y canonical en producción.
4. Endurecer límites por plan y operación de sponsors.

## Futuro

- Experimentos de pricing y adquisición.
- Automatizaciones comerciales y colaboraciones.
- Ampliación de analytics, comunidad y catálogo geográfico.
