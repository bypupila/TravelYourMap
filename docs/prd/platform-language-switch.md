# PRD: Selector de idioma de la plataforma

## Outcome

Una persona puede cambiar TravelYourMap entre español e inglés desde cualquier superficie pública y continuar su recorrido sin perder el idioma seleccionado.

## Acceptance criteria

1. El selector del landing conserva la ruta actual y cambia sus textos al idioma elegido.
2. La preferencia queda persistida y se propaga a acceso, registro, onboarding, pricing y legales.
3. Los links conservan parámetros funcionales existentes como `channelId`, `next` y atribución.
4. `html lang`, labels accesibles y metadatos visibles reflejan el idioma activo donde corresponda.
5. El comportamiento no genera overflow horizontal en mobile.

## Out of scope

Paneles internos, prototipos visuales de administración y contenido editorial generado por usuarios.

## Verification

Lint, TypeScript, navegación en browser, persistencia de locale y revisión responsive.
