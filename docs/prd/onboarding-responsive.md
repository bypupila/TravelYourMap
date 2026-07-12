# PRD: responsive del onboarding

## Problem Statement

Al entrar desde “Crear mi mapa”, las personas que usan mobile o tablet reciben el mismo volumen de información que en desktop dentro de una composición que no aprovecha bien el espacio disponible. Las áreas fijas pueden comprimir el contenido, el stepper completo compite por ancho y algunos pasos requieren desplazamiento sin que el layout lo contemple claramente.

## Solution

Adaptar la composición del onboarding a cada ancho sin cambiar sus siete pasos ni su información. Mobile tendrá una cabecera compacta, progreso textual, contenido con scroll natural y navegación inferior persistente. Tablet mostrará el stepper completo con desplazamiento horizontal y composiciones de hasta dos columnas. Desktop conservará la experiencia amplia existente con mejoras de resiliencia vertical.

## User Stories

1. Como creador en mobile, quiero completar los siete pasos sin perder información, para entender toda la propuesta antes de crear mi mapa.
2. Como creador en mobile, quiero saber en qué paso estoy y cuántos faltan, para orientarme en el flujo.
3. Como creador en mobile, quiero desplazar el contenido naturalmente, para leer pasos largos aunque mi pantalla tenga poca altura.
4. Como creador en mobile, quiero acceder siempre a Atrás y Continuar, para avanzar sin volver a buscar los controles.
5. Como creador en mobile, quiero que formularios y acciones se adapten al ancho, para completar datos sin zoom ni desplazamiento horizontal.
6. Como creador en tablet, quiero ver los nombres de los siete pasos, para navegar con el mismo contexto que en desktop.
7. Como creador en tablet, quiero que las tarjetas aprovechen dos columnas cuando entren, para escanear el contenido con comodidad.
8. Como creador, quiero que los errores y estados de validación permanezcan visibles, para saber cómo corregir un dato.
9. Como usuario de teclado, quiero foco visible y controles alcanzables, para completar el onboarding sin depender de un puntero.
10. Como creador bilingüe, quiero que textos largos en español e inglés no rompan el layout, para usar el flujo en ambos idiomas.
11. Como creador en desktop, quiero conservar toda la funcionalidad actual, para que el rediseño responsive no cambie el recorrido conocido.

## Implementation Decisions

- Se conservará el componente y la máquina de pasos existentes; el cambio será de composición y estilos responsive.
- El stepper tendrá una variante compacta exclusiva de mobile y la variante completa será visible desde tablet.
- El contenedor principal dejará de depender de centrado absoluto y permitirá scroll vertical con espacios seguros para encabezado y footer.
- La navegación inferior respetará safe areas del dispositivo y distribuirá las acciones de manera táctil y legible.
- Las grids pasarán gradualmente de una a dos o más columnas según el ancho, sin ocultar elementos.
- Los formularios apilarán campos y botones en mobile.
- No habrá cambios de APIs, base de datos, analíticas, checkout ni contenido.

## Testing Decisions

- Las pruebas observarán resultados visibles y navegación, no clases CSS internas.
- Se verificará `/onboarding?demo=1` en 360×800, 390×844, tablet y desktop.
- En cada tamaño se comprobará que los siete pasos son alcanzables, que no existe overflow horizontal y que el contenido puede desplazarse por completo.
- Se comprobarán formularios, validación de canal, estados de error, selección de plan, checkbox legal y botones Atrás/Continuar.
- Se ejecutarán lint, TypeScript y build como controles de regresión.

## Out of Scope

- Reducir o combinar pasos.
- Cambiar copy, precios, planes o lógica comercial.
- Rediseñar el mapa, landing o procesamiento posterior.
- Cambiar APIs o persistencia del onboarding.

## Further Notes

La misma información debe estar disponible en todos los dispositivos. Responsive significa adaptar jerarquía y composición, no recortar contenido.
