# PRD · Creación automática del Media Kit

## Problem Statement

Un creador puede guardar el formulario del Media Kit desde el Panel del creador, pero no puede compartir la presentación si su mapa aún no es público o el canal todavía está pendiente de verificación. Esto contradice el objetivo comercial de obtener nuevos sponsors.

## Solution

El primer guardado crea la configuración del Media Kit y lo deja disponible mediante su enlace compartible. La disponibilidad del Media Kit se controla por su propio estado activo, no por la publicación o verificación del mapa. El contenido comercial solo puede editarlo el propietario desde el Panel del creador. Si el mapa no está publicado, el Media Kit no se indexa ni presenta un enlace hacia él.

## User Stories

1. Como creador, quiero que mi primer guardado cree mi Media Kit, para poder compartirlo sin pasos técnicos adicionales.
2. Como creador, quiero abrir y copiar el enlace tras guardar, para enviarlo a posibles sponsors.
3. Como creador con un mapa aún privado, quiero compartir el Media Kit, para captar sponsors antes de publicar el mapa.
4. Como creador, quiero actualizar el mismo Media Kit en guardados posteriores, para mantener una única presentación comercial vigente.
5. Como visitante con el enlace, quiero ver el Media Kit activo, para conocer la propuesta comercial del creador.
6. Como visitante, no quiero que el Media Kit exponga un mapa que no es público, para respetar la visibilidad elegida por el creador.
7. Como buscador, no quiero indexar un Media Kit ligado a un canal aún no publicado, para evitar contenido comercial descubierto antes de tiempo.
8. Como creador, quiero recibir mensajes claros de guardado y disponibilidad del enlace, para saber cuándo puedo compartirlo.

## Implementation Decisions

- Mantener una configuración única por canal y crearla mediante el `upsert` existente en el primer guardado.
- Resolver el Media Kit compartible por su canal, aun si el mapa no es público o el ownership está pendiente.
- Conservar el requisito de que el Media Kit esté activo para resolver la página compartible.
- Separar la disponibilidad del enlace de la visibilidad del mapa: ocultar los accesos al mapa cuando no puede visitarse públicamente.
- Usar metadatos `noindex` mientras el canal no sea público y verificado; conservar canonical y SEO indexable solo cuando lo sea.
- Cambiar la etiqueta de la acción privada a «Guardar cambios» y mostrar el enlace cuando la configuración exista.

## Testing Decisions

- Verificar que un `PATCH` autorizado cree una fila si no existe y devuelva el enlace del Media Kit.
- Verificar que la carga pública de un Media Kit activo funcione con canal privado o pendiente.
- Verificar que la misma carga se oculte al desactivar el Media Kit.
- Verificar que la página no muestre navegación al mapa privado y no sea indexable en ese estado.
- Ejecutar TypeScript, lint y una comprobación de render responsive de la página pública.

## Out of Scope

- Múltiples Media Kits por creador.
- Media Kits personalizados por empresa, propuestas, vencimientos o borrado.
- Cambios al flujo de verificación de propiedad del canal o publicación del mapa.

## Further Notes

El Media Kit se usa para captar nuevos sponsors y no debe confundirse con el Sponsor Kit privado definido en el glosario.
