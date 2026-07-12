# Responsive Mobile y Tablet de la plataforma

## Status
Done

## Problem
Las paginas de TravelYourMap no comparten un contrato responsive completo. En Mobile y Tablet existen controles demasiado pequenos, elementos que salen del viewport, composiciones Desktop que no colapsan correctamente y superficies privadas que no pueden certificarse sin datos deterministas.

## Desired Behavior
Las 25 rutas de pagina deben ser utilizables sin solapamientos, recortes, scroll horizontal accidental ni acciones inaccesibles. Se resuelve y certifica primero Mobile y, una vez cerrado ese hito, Tablet. Desktop conserva su composicion y comportamiento actuales.

## Resolved Language
- **Mobile**: viewports menores a 768 px.
- **Tablet**: viewports entre 768 y 1023 px.
- **Desktop**: viewports desde 1024 px; no debe recibir cambios visuales ni funcionales intencionales.
- **Panel del creador**: espacio privado donde el creador gestiona su mapa y negocio, segun `CONTEXT.md`.
- **Fixture QA local**: estado determinista disponible solo en desarrollo o pruebas para validar una superficie privada sin debilitar autenticacion de produccion.

## Decisions
- El alcance incluye las 25 rutas de pagina, incluidas propuestas, demos locales y las rutas dinamicas de perfil, Media Kit, Acceso de marca y reportes. Las APIs quedan fuera salvo el soporte minimo de fixtures QA.
- Mobile se implementa y valida antes de iniciar Tablet.
- Portrait se valida en todas las rutas. Landscape se valida en mapas, onboarding, paneles, formularios complejos y overlays.
- En Mobile se centran encabezados, resumenes, llamadas a la accion y estados. Formularios, lectura larga, datos tabulares y controles espaciales mantienen alineacion izquierda.
- Los objetivos tactiles de acciones principales deben medir al menos 44 por 44 px. Controles visuales menores deben ampliar su hit area sin deformar el contenido.
- Las colecciones amplias usan una columna, wrapping o scroll horizontal intencional y senalizado; nunca overflow accidental del documento.
- Mapas, drawers, dialogs, sheets y barras persistentes respetan `100dvh`, safe areas, teclado virtual y scroll interno alcanzable.
- Los estados loading, empty y error conservan la misma geometria responsive que el estado exitoso y muestran una accion recuperable cuando corresponda.
- Los fixtures QA reutilizan datos demo existentes, no se indexan, no persisten mutaciones y no pueden activarse en produccion.
- El documento responsive previo de onboarding se considera reabierto porque la auditoria detecto una regresion a 768 px.

## Constraints
- Preservar cambios locales existentes y evitar duplicar logica responsive entre paginas.
- Mantener Tailwind CSS 3 y los breakpoints `md`/`lg` actuales.
- No introducir dependencias nuevas; Phosphor y Framer Motion ya estan disponibles.
- Mantener SEO, metadata, autenticacion, analiticas, checkout y persistencia de produccion.
- Probar contenido largo en espanol e ingles, errores, estados vacios y medios faltantes.
- Respetar `prefers-reduced-motion`; animar solo transform y opacity.

## Open Questions
Ninguna.

## Verification
- 25 rutas validadas en Mobile portrait a 320, 390 y 430 px sin overflow accidental, recortes accionables ni runtime errors.
- Superficies criticas validadas en Mobile landscape a 667×375 y 740×430.
- 25 rutas validadas en Tablet portrait a 768, 820 y 1023 px; landscape critico validado a 900×600 y 1023×768.
- Inspeccion visual realizada sobre landing, onboarding, mapas, Panel del creador, admin, Media Kit y Export de reporte.
- Desktop verificado a 1024, 1280 y 1440 px; no se introdujeron cambios responsive por encima de `lg`.
- ESLint, TypeScript, `git diff --check`, sintaxis del capturador y build de produccion finalizaron correctamente.

## PRD
[PRD responsive Mobile y Tablet](../prd/platform-responsive-mobile-tablet.md)
