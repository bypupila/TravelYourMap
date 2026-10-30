# Microsoft Clarity en TravelYourMap

**Variable:** `NEXT_PUBLIC_CLARITY_PROJECT_ID`. Vacía, Clarity queda desactivado y no aparece el aviso. En desarrollo solo funciona con `NEXT_PUBLIC_ENABLE_CLARITY_IN_DEV=1`.

**Consentimiento**
- Sin decisión guardada aparece un aviso bilingüe con Aceptar / Rechazar, solo en las rutas permitidas. Antes de aceptar no se solicita nada a `clarity.ms`.
- La decisión se guarda en localStorage como `travel_clarity_consent_v1` (`accepted` o `declined`).
- Al aceptar se envía Consent V2 (analítica concedida, publicidad denegada) y se carga la etiqueta una sola vez.
- Para revocar: `/privacy` > "Cambiar preferencias de analítica" > Rechazar. Se llama a `clarity("consent", false)` y la página se recarga.

**Allowlist (únicas rutas donde puede cargar Clarity)**
`/`, `/explore`, `/pricing`, `/privacy`, `/terms`.
Quedan fuera, entre otras: `/dashboard`, `/creator-panel`, `/auth/*`, `/onboarding/*`, `/admin`, `/map-admin-proposal`, `/map`, `/u/*`, `/brand-portal/*` y `/sponsor-report/*`. `/map` y `/u/*` dependen de la sesión o del votante; añadirlas es decisión del propietario.
Si una navegación interna sale de la allowlist con Clarity ya cargado, se revoca y se recarga la página.

**Pasos manuales del propietario**
1. Crear el proyecto en Clarity y copiar su ID.
2. Configurar el enmascaramiento en **Strict**: la app muestra datos de creadores y sponsors.
3. Pegar el ID en Vercel, entorno Production, como `NEXT_PUBLIC_CLARITY_PROJECT_ID`, y redeployar: Next.js fija esta variable en el build.
4. No añadir datos personales ni tokens a eventos personalizados.

**Verificación**
Sin ID: no aparece el aviso ni se añade `clarity.ms`. Con ID y sin decisión: no se pide `clarity.ms`. Al aceptar: una sola etiqueta con el ID correcto. Al revocar: cesa la carga tras recargar. `/brand-portal/*` y `/sponsor-report/*`: sin etiqueta. Revisar el aviso a 390 y 1440 px, en español e inglés.

Referencia: <https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2> y <https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking>.
