# Funciones próximas: feedback y analítica

## Problem Statement

Las acciones visibles sin funcionalidad real generan expectativas incorrectas y no ofrecen feedback. TravelYourMap tampoco puede cuantificar cuántas personas intentan usar cada capacidad futura para priorizar desarrollo.

## Solution

Convertir cada acción aún no disponible en una función próxima explícita: al activarla se muestra durante diez segundos una notificación flotante con reloj y el texto “Próximamente”. La interacción se registra de forma first-party y el Panel de administración presenta personas únicas y clics totales por función, superficie y periodo.

## User Stories

1. Como visitante, quiero recibir feedback inmediato al pulsar una función no disponible, para entender que mi acción fue reconocida.
2. Como visitante mobile, quiero que la notificación sea visible sin tapar la navegación esencial, para continuar explorando.
3. Como usuario de teclado o lector de pantalla, quiero que el aviso se anuncie de forma accesible, para recibir el mismo feedback.
4. Como potencial cliente Agency, quiero saber que el plan llegará próximamente, para no entrar en un onboarding que no puede completarse.
5. Como usuario del mapa, quiero que Explorar conserve su función actual, para seguir utilizando el producto disponible.
6. Como usuario del mapa, quiero que En vivo, Destinos, Creadores, Guardados, Historial y Comunidad indiquen que llegarán próximamente, para no confundir una selección visual con una navegación real.
7. Como superadmin, quiero conocer cuántas personas únicas intentaron usar cada función próxima, para priorizar el roadmap.
8. Como superadmin, quiero conocer los clics totales, para diferenciar alcance de intensidad de interés.
9. Como superadmin, quiero filtrar los datos a 7, 30, 90 y 180 días, para comparar ventanas consistentes con la analítica existente.
10. Como superadmin, quiero ver la superficie donde ocurrió el clic, para interpretar correctamente el interés.
11. Como operador, quiero que visitantes sin cuenta puedan contarse sin almacenar datos personales directos, para mantener cobertura y privacidad.
12. Como mantenedor, quiero declarar cada función próxima mediante un identificador canónico, para evitar métricas fragmentadas por diferencias de copy.
13. Como mantenedor, quiero reutilizar una sola notificación y una sola función de tracking, para evitar comportamientos divergentes.
14. Como plataforma, quiero limitar y validar el endpoint público, para reducir eventos inválidos o abusivos.
15. Como superadmin, quiero que el reporte tolere una base sin la nueva migración, para que el panel no falle durante despliegues escalonados.

## Implementation Decisions

- Se incorporará una tabla first-party específica para interacciones con funciones próximas.
- Cada evento guardará un identificador canónico de función, etiqueta visible, superficie, ruta, usuario autenticado opcional, identificador anónimo hasheado y fecha.
- El cliente conservará un UUID aleatorio en almacenamiento local para visitantes. El servidor lo convertirá en hash antes de persistirlo.
- La persona única se resolverá por usuario autenticado cuando exista y, en caso contrario, por identificador anónimo. Los clics totales contarán todos los eventos válidos.
- El endpoint público aceptará únicamente funciones y superficies incluidas en un catálogo cerrado y aplicará rate limiting.
- El toast será global y reutilizable, tendrá icono de reloj, región de estado accesible, cierre manual y temporizador reiniciable de diez segundos.
- Pricing mostrará Agency, pero su acción utilizará el feedback de función próxima y no navegará.
- Onboarding mostrará Agency como selección de interés; al elegirla registrará el evento, mostrará el feedback y deshabilitará el CTA final.
- En el menú del mapa, Explorar será una acción real; las demás opciones invocarán el feedback sin adoptar estado activo.
- La analítica de superadmin incorporará un bloque separado con resumen y desglose por función/superficie dentro del filtro temporal existente.
- La documentación de resolución enumerará cualquier otro control verdaderamente inoperante encontrado y convertido al sistema.

## Testing Decisions

- Se probará comportamiento externo y no detalles internos: texto, duración, navegación, persistencia y agregados.
- TypeScript, lint y build cubrirán contratos, App Router y renderizado.
- Las pruebas HTTP verificarán validación del endpoint público y protección superadmin del endpoint agregado.
- Las pruebas de navegador verificarán Pricing, Onboarding y el mapa en desktop y mobile, incluido que Explorar continúe activo y que Agency bloquee el CTA final.
- Se comprobará ausencia de overflow horizontal y accesibilidad básica de la región de notificación.
- La migración se validará con el ejecutor existente del proyecto, sin modificar datos ajenos al feature.

## Out of Scope

- Construir Agency, En vivo, Destinos, Creadores, Guardados, Historial o Comunidad.
- Rediseñar visualmente las páginas auditadas.
- Crear campañas externas de marketing a partir de la lista de interesados.
- Identificar a una misma persona anónima entre navegadores o dispositivos diferentes.

## Further Notes

El issue tracker no está configurado en este workspace; por eso el PRD se conserva en el repositorio. La métrica es una señal de intención, no una conversión ni una lista de espera.
