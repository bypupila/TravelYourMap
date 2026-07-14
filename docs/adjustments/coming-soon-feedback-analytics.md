# Notificación y analítica de funciones próximas

## Status
Done

## Problem
Algunas acciones visibles todavía no tienen una función disponible. Hoy pueden parecer operativas, navegar a un flujo que no corresponde o cambiar visualmente de estado sin producir un resultado real. Además, el equipo no puede medir el interés de las personas en esas funciones.

## Desired Behavior
Cada función no disponible debe responder con una notificación flotante “Próximamente”, acompañada por un reloj, visible durante diez segundos. Cada interacción debe registrarse y el Panel de administración debe mostrar personas únicas y clics totales por función, superficie y periodo.

## Resolved Language
- **Función próxima**: capacidad visible que todavía no está disponible para uso real.
- **Persona única**: cuenta autenticada o, para visitantes, navegador identificado mediante un identificador anónimo persistente.

## Decisions
- La medición cubre todas las funciones próximas, no solamente Agency.
- Explorar continúa siendo la única navegación operativa del menú principal del mapa.
- Agency permanece visible como oferta futura, pero no inicia onboarding ni checkout.
- En el último paso del onboarding, Agency puede seleccionarse para mostrar interés; la selección muestra el aviso y bloquea el CTA de creación del mapa.
- El reporte administrativo permite comparar periodos de 7, 30, 90 y 180 días.
- Una misma persona puede producir varios clics; ambas métricas se conservan.

## Constraints
- Un único sistema reutilizable de notificación y tracking para todas las superficies.
- Notificación accesible, visible en desktop y mobile, sin bloquear el contenido y con cierre automático a los diez segundos.
- El registro público debe validar entradas, limitar abuso y no exponer identidad personal.
- La consulta agregada debe estar protegida por rol superadmin.
- No se modifican los diseños generales diferidos de la auditoría visual.

## Open Questions
Ninguna.

## Inventario de controles convertidos

- Pricing: plan Agency.
- Landing: CTA del plan Agency.
- Onboarding, paso Planes: tarjeta Agency.
- Mapa, navegación desktop y mobile: En vivo, Destinos, Creadores, Guardados, Historial y Comunidad.
- Mapa en modo creador: Extraer videos, Crear votación y gestión simulada de patrocinadores.

Explorar, búsqueda, compartir, filtros, selección de países, reproducción, actividad de videos, fan vote real, apertura del Panel del creador y CTAs con navegación válida se conservaron como acciones operativas. No se añadieron avisos a controles deshabilitados por estado, permisos o validación porque no son funciones próximas.

## PRD
[PRD](../prd/coming-soon-feedback-analytics.md)
