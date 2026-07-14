# Navegación hacia atrás del onboarding

## Estado

Done

## Problema

El botón `Atrás` del primer paso estaba deshabilitado y su handler solo actualizaba el paso interno. Por eso no devolvía al usuario a la página desde la que había abierto el onboarding.

## Comportamiento esperado

- Desde un paso posterior, `Atrás` vuelve al paso anterior del onboarding.
- Desde el primer paso, `Atrás` vuelve a la página anterior usando el historial del navegador.
- Si no existe historial navegable, se utiliza `/auth` como fallback seguro.
- El botón permanece bloqueado durante la activación o el checkout.

## Restricciones

- No se modifican datos del onboarding al volver.
- Se reutiliza el router existente de Next.js.
- El control mantiene el layout responsive del footer fijo.
