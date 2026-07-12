# PRD: Responsive Mobile y Tablet de TravelYourMap

## Problem Statement

Quienes usan TravelYourMap desde un telefono o tablet encuentran composiciones pensadas para Desktop: acciones fuera del viewport, controles demasiado pequenos, barras que compiten con el contenido, tarjetas recortadas y overlays cuyo contenido puede quedar inaccesible. La cobertura visual existente se limita a una parte de las rutas y a Desktop, por lo que tampoco permite demostrar que una correccion sea transversal o que Desktop permanezca intacto.

## Solution

Establecer un contrato responsive comun y aplicarlo a las 25 rutas de pagina. La entrega se divide en dos gates: primero Mobile menor a 768 px y despues Tablet entre 768 y 1023 px. Cada gate combina correcciones en primitives y shells compartidos con ajustes puntuales de las familias de landing, autenticacion, onboarding, mapas, paneles y reportes. Fixtures QA locales permiten renderizar estados privados y tokenizados sin relajar seguridad de produccion. Desktop desde 1024 px se protege con comparacion visual y smoke funcional.

## User Stories

1. Como visitante en Mobile, quiero leer y accionar cada pagina sin scroll horizontal accidental, para navegar sin perder contenido.
2. Como visitante en Mobile, quiero encabezados y llamadas a la accion centrados cuando mejora la jerarquia, para comprender rapidamente cada pantalla.
3. Como lector, quiero que textos largos permanezcan alineados para lectura y puedan envolver, para no encontrar recortes en espanol o ingles.
4. Como usuario tactil, quiero que las acciones principales tengan un area minima de 44 por 44 px, para pulsarlas con precision.
5. Como usuario de teclado, quiero foco visible y orden logico incluso dentro de overlays, para completar flujos sin puntero.
6. Como usuario de iPhone o Android, quiero que las barras persistentes respeten safe areas y el teclado virtual, para que ninguna accion quede tapada.
7. Como visitante, quiero que loading, empty y error se adapten igual que el contenido exitoso, para entender el estado y recuperarme.
8. Como creador en onboarding, quiero recorrer los siete pasos en Mobile y Tablet sin perder el CTA ni el progreso, para completar mi alta.
9. Como viewer del mapa, quiero abrir tarjetas, filtros, votaciones y videos sin controles fuera del viewport, para explorar destinos.
10. Como viewer en un mapa horizontal, quiero distinguir un carrusel intencional de un layout roto, para desplazar tarjetas de forma predecible.
11. Como creator, quiero administrar mapa, videos, sponsors y audiencia desde Mobile, para resolver tareas operativas fuera de Desktop.
12. Como superadmin, quiero usar busqueda, tablas, paginacion y cambios de rol desde Tablet, para operar sin celdas o acciones ocultas.
13. Como contacto de marca, quiero consultar el Acceso de marca y sus entregables desde Mobile, para revisar una colaboracion.
14. Como receptor de un Export de reporte, quiero ver metricas y graficos sin columnas truncadas, para interpretar resultados en Tablet o Mobile.
15. Como usuario de auth, quiero labels, helpers, errores y checkboxes con hit areas correctas, para completar formularios sin zoom.
16. Como visitante de paginas legales, quiero parrafos, enlaces y contacto legibles, para consultar la informacion sin esfuerzo.
17. Como usuario con movimiento reducido, quiero evitar animaciones perpetuas o desplazamientos innecesarios, para usar la interfaz con comodidad.
18. Como equipo de producto, quiero estados QA deterministas para rutas privadas, para reproducir y verificar fallos sin datos reales.
19. Como equipo de SEO, quiero que los cambios responsive no alteren metadata, contenido indexable ni URLs canonicas, para preservar posicionamiento.
20. Como usuario Desktop, quiero conservar exactamente la experiencia actual, para no recibir regresiones por una mejora orientada a pantallas menores.

## Implementation Decisions

- Se mantendran Tailwind CSS 3 y los breakpoints existentes: Mobile como base, Tablet desde `md` y Desktop desde `lg`.
- Se creara una capa pequena de reglas/primitives responsive compartidas para containers, grupos de acciones, hit areas, scroll intencional, tablas, overlays y safe areas. Las paginas consumiran esas reglas en lugar de repetir media queries.
- La variante Mobile usara una columna y ancho completo para composiciones asimetricas. El centrado sera la regla para jerarquia y acciones, con excepciones explicitas para formularios, lectura larga, datos y controles de mapa.
- Navegaciones y toolbars envolveran, colapsaran o se convertiran en scrollers accesibles antes de cortar contenido. Los scrollers mantendran indicadores semanticos y no aumentaran el `scrollWidth` del documento.
- Dialogs, sheets, popovers y paneles fijos usaran limites de `100dvh`, safe-area insets y una unica region de scroll. El foco y los botones de cierre permaneceran alcanzables.
- Tarjetas y media usaran `min-width: 0`, relaciones de aspecto estables, texto con wrapping/truncado solo donde haya una alternativa accesible y controles superpuestos con hit area ampliada.
- Las superficies de mapa conservaran la interaccion espacial: en Mobile el mapa sera la escena principal y sidebar, rail, filtros, detalle y votaciones se presentaran como overlays/sheets o carruseles contenidos. Tablet combinara mapa y panel solo cuando cada region conserve ancho util.
- Los formularios apilaran campos y acciones en Mobile; labels iran arriba, helpers y errores debajo. Tablas densas cambiaran a filas apiladas o contenedores con scroll horizontal explicitamente limitado.
- Se reutilizaran `demo-data` y loaders existentes para fixtures QA. Un resolver central rechazara fixtures en produccion; las rutas QA tendran `noindex`, no escribiran datos y cubriran creator, superadmin, procesamiento, Acceso de marca y reportes.
- Se corregira la hidratacion no determinista observada en la propuesta de mapa haciendo que las etiquetas renderizadas en servidor y cliente compartan la misma normalizacion inicial.
- Se actualizara la biblioteca visual para enumerar las 25 rutas, sus variantes QA y la matriz Mobile/Tablet/Desktop, separando rutas bloqueadas o fallidas de referencias aprobadas.
- No se agregaran dependencias, APIs publicas, cambios de base de datos ni nuevos estados globales.

## Testing Decisions

- Las pruebas validaran comportamiento visible: ancho del documento, bounds de elementos visibles, hit areas, reachability por scroll, foco, apertura/cierre de overlays y continuidad de acciones. No dependeran de nombres de clases.
- Gate Mobile: todas las rutas en 320, 360, 390 y 430 px portrait; mapas, onboarding, paneles, formularios complejos y overlays tambien en landscape de baja altura.
- Gate Tablet: todas las rutas en 768, 820 y 1023 px portrait; las mismas superficies criticas tambien en landscape.
- Las rutas dinamicas usaran `/u/demo`, dashboard demo y fixtures QA reservados para creator, superadmin, procesamiento, Acceso de marca y reportes.
- Cada ruta debe tener `document.scrollWidth <= viewportWidth`, salvo scroll interno intencional; cero elementos interactivos recortados; acciones principales con hit area minima de 44 por 44 px.
- Se recorreran los siete pasos de onboarding, filtros y detalle de mapa, reproduccion/video sheet, votacion, tabs del Panel del creador, formularios auth, tablas/admin y acciones de reportes.
- Se probaran strings largos ES/EN, loading, empty, error, ausencia de imagen y listas con datos minimos/maximos.
- Desktop se comprobara a 1024, 1280 y 1440 px con capturas de referencia y smoke de interacciones; cualquier diferencia intencional detiene el trabajo para revision.
- La verificacion final ejecutara ESLint, TypeScript sin emitir y build de produccion, ademas del crawl Playwright sin errores de pagina o hidratacion.

## Out of Scope

- Redisenar la identidad visual o cambiar la arquitectura de informacion Desktop.
- Reducir contenido, pasos de onboarding o capacidades para hacer que entren en Mobile.
- Cambiar precios, planes, copy comercial, reglas de auth, checkout, analiticas o persistencia.
- Corregir problemas de datos o backend no necesarios para renderizar fixtures QA; se documentaran como hallazgos separados.
- Publicar las rutas locales de propuesta/demo en produccion.

## Further Notes

- La auditoria inicial detecto desborde visual en mapas y `/demo-diseno`, un CTA fuera del viewport en onboarding a 768 px, controles de 20 a 40 px y una hidratacion divergente en `/map-proposal-2`.
- El fallo SQL observado al consultar un token inexistente de Acceso de marca es un riesgo backend separado; el fixture QA evitara depender de datos reales, pero no debe ocultar el hallazgo.
- No hay issue tracker configurado en este entorno, por lo que el PRD se conserva en el repositorio como fuente de verdad.
