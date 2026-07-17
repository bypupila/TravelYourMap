# Auditoria responsive del mapa actual

Fecha: 2026-07-17

## Alcance

- Superficie: `/map`, componente `MapExperienceCore`.
- Objetivo: conservar toda la capacidad funcional de desktop en tablet y mobile sin modificar la experiencia desktop.
- Breakpoints del sistema existente: mobile 320-767 px, tablet 768-1023 px, desktop desde 1024 px.
- Evidencia visual aceptada: `01-desktop-current.png`.
- Evidencia tecnica: estructura responsive y estados de `map-experience-core.tsx`, `video-selection-sheet.tsx` y contrato `Design.MD`.

## Veredicto

El desktop tiene una jerarquia clara de tres columnas, pero la implementacion actual no conserva esa paridad funcional debajo de 1024 px. Ambos rails se ocultan completos. El menu mobile recupera solo la navegacion general y el fan vote tiene un overlay propio; el resto de las funciones del rail izquierdo y derecho queda ausente o sin acceso equivalente.

No conviene comprimir el desktop. La solucion recomendada es mantener un unico globo como canvas principal y construir un chrome responsive complementario:

- Mobile: app bar compacta + globo full-bleed + dock inferior de cuatro destinos + sheets contextuales.
- Tablet: app bar compacta + globo + utility rail tactil; los paneles se abren como columna inline cuando hay ancho suficiente y como sheet en landscape bajo.
- Desktop: mantener exactamente el grid y los rails actuales desde `lg`.

## Riesgos encontrados

1. **Perdida funcional bajo 1024 px — critica.** Se ocultan lista y orden de paises, metricas, sponsors, acciones creator y CTA de creacion. El drawer mobile solo contiene siete links de navegacion.
2. **Mapa comprimido en mobile landscape — critica.** El rail de videos conserva `230px` de alto dentro de un shell de `100dvh`; junto con topbar, paddings y gaps puede dejar el globo casi sin altura en 667x375 y 740x430.
3. **Colision de capas — alta.** `MobileDrawer2` usa `z-[90]`, mientras la topbar usa `z-[120]`; el menu puede quedar visualmente por debajo del header que deberia cubrir.
4. **Controles superiores compitiendo — alta.** Fecha, panel central del punto y filtros comparten `top-4`. En 320-390 px el panel central de 245 px puede superponerse con los controles laterales.
5. **Acciones inferiores compitiendo — alta.** Fan vote y pantalla completa viven simultaneamente en las esquinas inferiores; no existe una zona reservada para el rail de videos, safe area o controles del sistema.
6. **Paridad tablet inexistente — alta.** Entre 768 y 1023 px se usa esencialmente la misma composicion de mobile, aunque hay ancho suficiente para un panel contextual de 280-320 px.
7. **Video sheet vulnerable a 320 px — alta.** Los botones anterior/siguiente tienen `min-width:116px`, el estado ocupa la columna central y existen paddings laterales; la suma puede provocar overflow. Algunos controles miden 36 px, por debajo del target tactil de 44 px.
8. **Sheet no modal — media.** El visor de video usa `modal={false}` y overlay sin pointer events; puede permitir interacciones accidentales con el mapa detrás.
9. **Popovers sin limite vertical — media.** Los menus de fecha y actividad no tienen `max-height` ni scroll interno para landscape bajo.
10. **Safe areas incompletas — media.** No hay reserva sistematica con `env(safe-area-inset-bottom)` para el futuro dock, rail colapsado y sheets del mapa.

## Arquitectura recomendada

### Mobile 320-767 px

- App bar de 56 px: menu, busqueda expansible y compartir. Estado viewer/creator dentro de `Mas` para evitar una segunda fila.
- Globo full-bleed en todo el espacio restante.
- Fila superior del mapa: un solo boton `Filtros` con contador de filtros activos; el selector temporal vive dentro del mismo sheet.
- Dock inferior: `Mapa`, `Destinos`, `Videos`, `Mas`. Altura tactil 56 px + safe area.
- `Destinos`: bottom sheet con total de paises/videos, orden Nuevos/ABC/Vistos, lista, progreso y seleccion.
- `Videos`: rail colapsado de 64-72 px sobre el dock; al tocar abre el listado completo. En landscape bajo solo aparece `Videos · Ver todos`.
- `Mas`: navegacion general, metricas, sponsors, CTA de crear mapa y, en creator, acciones administrativas.
- Fan vote: chip contextual sobre el dock, colapsado por defecto; abre sheet propio. Nunca comparte la misma franja con fullscreen.
- Video seleccionado: sheet modal de hasta 92dvh, un unico scroll interno, cierre fijo, safe area y controles que pasan a dos filas en 320 px.

### Tablet 768-1023 px

- Utility rail persistente de 64-72 px con iconos: Mapa, Destinos, Videos, Actividad/Mas.
- Globo ocupa el resto del ancho por defecto.
- En portrait, panel contextual inline de 288-320 px cuando se abre Destinos, Videos o Mas; nunca flota encima del globo.
- En landscape bajo (altura menor a 640 px), los paneles pasan a sheet lateral/bottom y el rail de videos queda colapsado.
- Los controles del mapa quedan en una barra unica; no se mantienen tres elementos superpuestos en `top-4`.
- El video se abre en sheet lateral de 360-420 px cuando la altura lo permite y en bottom sheet en landscape bajo.

## Matriz de paridad funcional

| Funcion desktop | Mobile | Tablet |
|---|---|---|
| Navegacion principal | Sheet `Mas` | Utility rail + panel |
| Paises, conteos y progreso | Sheet `Destinos` | Panel inline `Destinos` |
| Orden Nuevos / ABC / Vistos | Header del sheet | Header del panel |
| Busqueda | App bar, dialog responsive | App bar |
| Ultima extraccion | Detalle en `Mas` | App bar o panel `Mas` |
| Crear mapa | CTA en `Mas` | CTA en panel `Mas` |
| Viewer / Creator | Selector en `Mas` | Control compacto en app bar |
| Compartir | Icono en app bar | Icono en app bar |
| Ventana temporal y actividad | Un unico sheet `Filtros` | Popover/panel unico |
| Pantalla completa | Control flotante exclusivo | Control flotante exclusivo |
| Seleccion de pais en globo | Conservada | Conservada |
| Videos para inspirarte | Peek colapsado + sheet | Panel inline o rail colapsado |
| Ver todos los videos | Sheet full-height | Panel/listado |
| Reproductor y relacionados | Bottom sheet modal | Side/bottom sheet adaptativo |
| Metricas | `Mas` | Panel `Actividad/Mas` |
| Sponsors | `Mas` | Panel `Mas` |
| Fan vote | Chip + sheet | Panel contextual |
| Acciones creator | `Mas` con seccion prioritaria | Panel `Creator` |

## Orden de implementacion recomendado

1. Crear un `ResponsiveMapChrome` para `<lg` reutilizando estados y callbacks actuales.
2. Mantener `ProposalSidebar2`, `ProposalRightRail2` y el grid desktop sin cambios desde `lg`.
3. Convertir el rail permanente de videos en peek + sheet para `<lg`.
4. Crear sheets reutilizables para Destinos, Filtros y Mas; no duplicar logica de datos.
5. Corregir jerarquia de z-index, safe areas y targets de 44 px.
6. Ajustar el visor de video para 320 px y landscape bajo.
7. Validar interacciones y ausencia de overflow en toda la matriz de `Design.MD`.

## Matriz minima de QA

- Mobile portrait: 320x760, 360x800, 390x844, 430x932.
- Tablet portrait: 768x1024, 820x1180, 1023x1180.
- Landscape: 667x375, 740x430, 900x600, 1023x768.
- Desktop regresion, sin cambios: 1024x900, 1280x900, 1440x1000.

## Limites de evidencia

El navegador de captura no aplico el override de viewport y mantuvo 1280x720. Por eso se acepto solo la captura desktop y los hallazgos mobile/tablet se verificaron contra la estructura responsive real del codigo. Antes de implementar o aprobar visualmente se necesitan capturas efectivas de todos los tamaños de la matriz y pruebas de teclado, foco, zoom, lectores de pantalla y gestos tactiles.
