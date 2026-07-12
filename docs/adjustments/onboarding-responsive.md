# Responsive del onboarding

## Status
Done

## Problem
El onboarding conserva una composición de escritorio en pantallas pequeñas. El encabezado, el stepper, el panel central y la navegación inferior compiten por el alto disponible y pueden comprimir o recortar contenido.

## Desired Behavior
El flujo mantiene los mismos siete pasos y la misma información en mobile, tablet y desktop. Mobile prioriza un encabezado compacto, progreso legible, scroll natural y acciones persistentes. Tablet conserva el stepper desplazable y usa dos columnas cuando el contenido lo permite.

## Resolved Language
**Onboarding**: flujo completo de siete pasos que comienza desde “Crear mi mapa”.

## Decisions
- No se elimina, resume ni reorganiza información según el dispositivo.
- Mobile muestra el progreso como “Paso X de 7”; los nombres completos siguen disponibles en tablet y desktop.
- El documento debe desplazarse naturalmente y dejar espacio seguro para las acciones inferiores.
- Las acciones Atrás y Continuar permanecen accesibles en la parte inferior.
- Tablet utiliza composiciones de dos columnas cuando exista espacio suficiente sin reducir la legibilidad.

## Constraints
- Conservar la lógica, analíticas, validaciones, checkout y traducciones existentes.
- Evitar overflow horizontal y contenido oculto en viewports pequeños o de poca altura.
- Mantener foco visible, objetivos táctiles adecuados y compatibilidad con teclado.
- Validar mobile, tablet y desktop, además de errores y contenido largo.

## Open Questions
Ninguna.

## Verification
- Los siete pasos fueron recorridos a 390×844 sin overflow horizontal ni errores de consola.
- Se comprobó el render inicial a 768×1024 y 1440×1000 sin overflow horizontal.
- ESLint, TypeScript y el build de producción finalizaron correctamente.

## PRD
[PRD responsive del onboarding](../prd/onboarding-responsive.md)
