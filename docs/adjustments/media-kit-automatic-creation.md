# Creación automática del Media Kit

## Status
Done

## Problem
El creador puede completar el formulario del Media Kit, pero su enlace público queda bloqueado cuando el mapa todavía no es público o el canal está pendiente de verificación. La acción «Guardar y publicar» comunica un resultado que no se corresponde con la disponibilidad real del enlace.

## Desired Behavior
El primer guardado desde el Panel del creador crea automáticamente el Media Kit único del canal. Mientras esté activo, el creador puede compartirlo para captar sponsors, sin depender de la visibilidad o verificación del mapa. Los guardados posteriores actualizan el mismo Media Kit.

## Resolved Language
Media Kit: presentación comercial única y compartible del creador para captar sponsors. No es un Sponsor Kit privado ni una propuesta por empresa.

## Decisions
- La creación ocurre al primer guardado; no hay una acción de creación separada.
- La página se puede compartir si el Media Kit está activo, aunque el mapa no lo esté.
- No se agregan múltiples Media Kits, fechas de caducidad ni borrado en este ajuste.

## Constraints
- Los datos comerciales permanecen editables únicamente desde el Panel del creador con autorización de propietario.
- El Media Kit no se indexa mientras el canal no cumpla las condiciones de publicación del mapa.
- La interfaz debe comunicar «Guardar cambios» y la disponibilidad real del enlace con contenido accesible y responsive.

## Open Questions
Ninguna para este ajuste.

## PRD
[PRD: creación automática del Media Kit](../prd/media-kit-automatic-creation.md)
