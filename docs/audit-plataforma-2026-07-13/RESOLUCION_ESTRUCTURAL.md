# Resolución estructural de la auditoría

**Fecha:** 14 de julio de 2026

**Alcance:** funcionalidad, estado, datos, metadata, localización, accesibilidad semántica y exposición de rutas internas.
**Fuera de alcance:** rediseño visual, espaciados, superposiciones responsive y ampliación visual de objetivos táctiles.

## Decisiones funcionales

### Plan canónico

`src/lib/plans.ts` es la única fuente de verdad para nombre, precio mensual, disponibilidad, prueba, beneficios y slug de checkout. Agency está disponible a USD 199/mes y usa el checkout `creator_plus`.

Landing, `/pricing` y onboarding consumen esta definición. `/pricing` es una página pública con respuesta `200`; los CTAs llevan al onboarding con el plan seleccionado y el locale preservado.

### Búsqueda global del mapa

Una búsqueda escrita en el mapa representa una búsqueda global. Al comenzar a escribir se limpia el país seleccionado y cualquier confirmación de voto pendiente. El rail deja de rotular los resultados con el país anterior.

Filtros de fecha, filtros de actividad y votación mobile son capas mutuamente excluyentes.

### Consentimientos

Los consentimientos pertenecen a un usuario autenticado. `/auth/consents` redirige a auth antes de renderizar si no hay sesión válida. La API conserva su verificación de sesión y el cliente redirige si la sesión vence durante una operación.

### Superficies internas

Los prototipos visuales responden `404` en producción. La ruta legacy `/map-admin-proposal` redirige a `/creator-panel`, preservando los filtros compatibles. Los enlaces operativos internos usan el nombre canónico **Panel del creador**.

## Incidencias resueltas

| Área | Resolución |
|---|---|
| Landing | CTAs de creación unificados; demo y creación tienen destinos distintos; locale inglés preservado |
| Pricing | Página real, canonical, tres planes disponibles y CTAs consistentes |
| Onboarding | Planes consumen el modelo canónico; Agency habilitado; CTA legal bloqueado hasta aceptar; control falso de sponsor eliminado |
| Consentimientos | Protección server-side y recuperación ante sesión vencida |
| Mapa | H1 semántico, canonical, búsqueda global limpia país, overlays exclusivos y plural correcto |
| Explore | Canonical, filtros españoles y nombres de país localizados |
| Perfil público | H1 semántico y metadata dinámica consistente |
| Media Kit demo | Métricas calculadas desde el mismo dataset demo que el perfil; canonical y copy corregidos |
| Creator Panel | Selects principales con nombre accesible; enlaces legacy migrados |
| Brand Portal | Copy de código corregido |
| Status | Metadata propia y copy corregido |
| Prototipos | Bloqueados en producción; enlaces `href="#"` sustituidos por controles semánticos |

## Validación

- `npm run lint`: aprobado.
- `npx tsc --noEmit --incremental false`: aprobado.
- `npm run build`: aprobado.
- Producción local:
  - `/pricing?lang=es` → `200`.
  - `/auth/consents` sin cookie → `307 /auth?next=/auth/consents`.
  - prototipos visuales → `404`.
  - `/map-admin-proposal?tab=videos` → `307 /creator-panel?tab=videos`.
- Navegador mobile `390 × 844`:
  - sin overflow horizontal en pricing, onboarding y Media Kit;
  - filtros y votación no permanecen abiertos simultáneamente;
  - seleccionar Perú y buscar `japan` deja el rail global y muestra resultados de Japón;
  - Media Kit demo muestra 125 videos, 78 países y 214,7 M views.

## Pendiente visual

Se mantienen para una segunda pasada las propuestas P1–P4 y los ajustes de solapamiento, jerarquía, tamaños táctiles y refinamiento responsive descritos en `AUDITORIA_VISUAL_FUNCIONAL.md`.
