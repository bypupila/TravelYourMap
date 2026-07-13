# Auth Access Switches

## Status

Done

## Problem

La pantalla `/auth` no ofrecía una ruta visible para iniciar el registro de creador ni un cambio claro entre el acceso creator y viewer.

## Desired Behavior

- El selector Creador/Viewer cambia el contexto de autenticación conservando la atribución disponible en la URL.
- El selector Login/Registro muestra ambas acciones en la tarjeta de acceso.
- Registro abre el onboarding de creador en `/onboarding`.

## Decisions

- Se reutiliza `intent=viewer`, que ya era el contrato existente para el acceso viewer.
- Ambos switches usan el mismo estilo `tym-nav-pill`; el estado activo se diferencia con el color de marca rojo.

## Constraints

- Mantener targets táctiles responsive y no romper `channelId`, `next` ni parámetros UTM.
- La página debe seguir funcionando sin depender de JavaScript adicional para la navegación entre contextos.
