# Planes canónicos y permisos de Sponsors

## Status
Done — implementación local verificada; despliegue y E2E Polar pendientes

## Problem
La presentación comercial no coincide entre home, pricing y onboarding. Además, el catálogo actual describe Free como un plan de creador y Creator como un plan con un sponsor, mientras la definición comercial confirmada establece que el acceso gratuito corresponde a Viewer y que Creator no incluye Sponsors.

El backend sólo comprueba que exista una suscripción activa; todavía no aplica permisos de Sponsors según el plan. Cambiar únicamente el texto dejaría una promesa comercial que no coincide con el comportamiento real.

## Desired Behavior
- Viewer gratis registra una cuenta de audiencia y no crea ni importa un canal.
- Creator cuesta USD 29 al mes y no incluye capacidades de Sponsors propias del creador.
- Creator Pro cuesta USD 79 al mes e incluye Sponsors.
- Agency cuesta USD 199 al mes, permanece como próximamente y conserva su orientación a portafolios.
- Home, pricing, onboarding, checkout, permisos y catálogo usan la misma definición canónica.

## Resolved Language
- [Viewer gratis](../../CONTEXT.md): cuenta gratuita de audiencia, no una suscripción Creator.
- [Creator](../../CONTEXT.md): plan de USD 29 sin Sponsors.
- [Creator Pro](../../CONTEXT.md): plan de USD 79 con Sponsors.
- [Plan canónico](../../CONTEXT.md): fuente comercial compartida por todas las superficies.

## Decisions
- Mantener los slugs técnicos existentes: `creator → starter`, `creator_pro → pro`, `agency → creator_plus`.
- No reutilizar `free` como entitlement de creador; su CTA debe llevar al registro Viewer.
- No cambiar IDs de Polar hasta crear y certificar el catálogo Sandbox.

## Constraints
- El control de Sponsors debe ser server-side; ocultar botones no es una autorización suficiente.
- La UI debe explicar con claridad la diferencia entre Creator y Creator Pro en español e inglés.
- La presentación debe conservar responsive, foco, SEO y analítica existentes.
- Los sponsors o anuncios propiedad de la plataforma no deben confundirse con la capacidad comercial del creador.

## Open Questions
- Ninguna bloqueante.

## PRD
[Planes canónicos y permisos de Sponsors](../prd/canonical-plans-and-sponsor-entitlements.md)

Issue de seguimiento: [#51](https://github.com/bypupila/TravelYourMap/issues/51)

## Implemented
- `src/lib/plans.ts` es la fuente canónica de nombres, aliases, precios, copy y capacidad `sponsors`.
- Viewer apunta al registro de audiencia; Creator y Creator Pro mantienen los aliases de checkout existentes.
- El entitlement de Sponsors se resuelve server-side desde la suscripción activa/trialing y el plan asociado.
- Creator recibe `403 sponsor_plan_upgrade_required` en operaciones privadas de Sponsors; los recursos ajenos conservan `404` antes del control de plan.
- Mapas, tracking, reportes, Media Kit, CRM y Brand Portal dejan de exponer capacidades del creador al bajar de plan, sin borrar sus datos.
- Home, pricing, onboarding y Creator Panel muestran la misma jerarquía comercial en español e inglés.
- Validación: `release:check` PASS y evidencia responsive móvil/desktop en `output/qa/2026-07-21-launch-certification/visual-regression/`.
