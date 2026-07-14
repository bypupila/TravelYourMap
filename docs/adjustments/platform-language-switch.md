# Selector de idioma de la plataforma

## Status

Done

## Problem

El selector `EN` del landing enlazaba directamente al onboarding y no cambiaba el contenido de la página actual. Además, la plataforma solo tenía traducciones parciales en onboarding, por lo que la preferencia no se mantenía al continuar el recorrido.

## Desired Behavior

- `EN` y `ES` cambian el contenido de la página actual.
- La preferencia se conserva al navegar entre superficies públicas.
- El locale queda disponible para render server-side y para componentes client-side.
- Las URLs de onboarding, checkout y enlaces de acceso conservan el idioma seleccionado.

## Resolved Language

- `es` es el locale por defecto.
- `en` es el locale alternativo soportado en esta iteración.
- “Viewer” y “Creator” se mantienen como términos de producto en ambos idiomas cuando funcionan como roles.

## Decisions

- La preferencia se persiste con cookie y se refleja en `lang` para que los enlaces compartibles sean explícitos.
- El selector reutiliza la ruta actual y solo reemplaza el parámetro `lang`.
- La primera cobertura incluye landing, acceso, registro viewer, onboarding, pricing, explore, mapa de error y documentos legales; las herramientas internas y prototipos quedan fuera de esta iteración.

## Constraints

- No romper atribución, `channelId`, `next` ni parámetros UTM existentes.
- Mantener SEO con `html[lang]`, metadatos coherentes y URLs navegables.
- Validar desktop, mobile y navegación entre páginas.

## Open Questions

- Ninguna bloqueante para esta implementación.

## PRD

[platform-language-switch.md](/Users/bypupila/Desktop/0.%20BY%20PUPILA%20-%20Proyectos/Travel/web/docs/prd/platform-language-switch.md)
