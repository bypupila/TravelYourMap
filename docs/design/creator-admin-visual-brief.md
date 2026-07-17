# Creator Admin — visual redesign brief

Date: 2026-07-17  
Surface: `/creator-panel?qa=responsive`  
Audience: travel creators managing their map, content, audience and commercial operation.

## Outcome

Make the creator admin faster to scan, more visual and easier to act on. Reduce persistent explanatory copy, preserve detail on demand, and turn each section into a focused workflow with one obvious next action. The result should feel dynamic and minimal without hiding operational state.

## Existing product language to preserve

- TravelYourMap uses a near-black graphite canvas, white typography and a coral primary accent, with amber/green/blue reserved for state.
- The current admin uses a compact left navigation, a creator header, country/video thumbnails, Phosphor icons, thin dividers and restrained radii.
- Existing entities and actions are real product constraints. Do not invent unrelated features or remove required workflows.
- Use Spanish UI copy and realistic creator data from the reference captures.
- Whenever the UI refers to a country or destination, pair its textual name with a consistent product icon: prefer the country flag, and use a globe, map pin or geographic silhouette when a flag is not appropriate. Never show isolated country codes such as `TH`, `JP` or `US`; icons complement accessible text and do not replace it. Avoid emoji-style iconography.

## Captured evidence

Desktop references, all at 1440 × 1024:

1. `.artifacts/creator-admin-audit-2026-07-17/01-resumen.png`
2. `.artifacts/creator-admin-audit-2026-07-17/02-videos.png`
3. `.artifacts/creator-admin-audit-2026-07-17/03-paises.png`
4. `.artifacts/creator-admin-audit-2026-07-17/04-votaciones.png`
5. `.artifacts/creator-admin-audit-2026-07-17/05-sponsors.png`
6. `.artifacts/creator-admin-audit-2026-07-17/06-media-kit.png`
7. `.artifacts/creator-admin-audit-2026-07-17/07-negocio.png`
8. `.artifacts/creator-admin-audit-2026-07-17/08-audiencia.png`
9. `.artifacts/creator-admin-audit-2026-07-17/09-actividad.png`

Responsive references, all at 390 × 844:

- `.artifacts/creator-admin-audit-2026-07-17/10-mobile-resumen.png`
- `.artifacts/creator-admin-audit-2026-07-17/11-mobile-videos.png`
- `.artifacts/creator-admin-audit-2026-07-17/12-mobile-negocio.png`

## Cross-panel audit

### What already works

- The dark product shell and coral focus color are distinctive and consistent.
- The country split view, content thumbnails and restrained status colors give a useful foundation.
- Most sections expose the right domain objects and actions.
- Mobile Videos already collapses the desktop table into readable content rows.

### Highest-impact issues

- Too many modules have equal visual weight. KPI cards, insight cards, alerts, empty states and long lists all compete for first attention.
- Small uppercase labels and muted body copy are frequent, causing low-contrast, high-effort reading.
- Icon-only primary navigation makes section discovery slower; Audiencia and Actividad are visually demoted although they complete key workflows.
- Repeated cards and borders create visual noise. Several surfaces could be a single grouped list with dividers.
- The alert rail obscures core content instead of adapting the layout or appearing contextually.
- Empty states consume large areas while explaining rather than helping the creator perform the next action.
- On mobile, KPI cards become a long vertical wall and the Negocio subnavigation overflows into unreadable labels.
- Important states often rely on color and compact chips; add shape, icon or copy so state is not color-only.

## Section-by-section redesign goals

### Resumen

Replace the grid of equal-weight metrics with one primary “next best action,” a compact health overview and a visual pulse of recent performance. Keep map readiness, current priority and recent activity; move secondary metrics behind progressive disclosure.

### Videos

Turn the wide management table into a scannable content queue. Prioritize thumbnail, destination, visibility, location confidence and the single action needed. Use bulk controls only after selection. On mobile, keep row cards compact and expose actions via a clear menu or swipe-safe affordance.

### Países

Make geography the hero. Combine a map or visual destination field with a ranked list and one contextual detail panel. Avoid repeating the same “Oportunidad” badge on every row; encode opportunity strength visually and reveal the relevant CTA after selection.

### Votaciones

Make the active poll or poll composer the hero. The empty state should show a fast template choice and a lightweight preview rather than duplicate “Nueva votación / Crear votación” actions and leave most of the screen unused.

### Sponsors

Frame sponsor work as monetizable inventory and assignments, not a long list of repeated “Crear” buttons. Show coverage visually by country/video/global scope, surface the biggest opportunity, and keep the wizard as a contextual flow.

### Media Kit

Show an editable live preview, completion meter and only the fields needed for the current step. Replace abstract zero-metric blocks with proof, readiness and public preview. Loading, empty and error states must preserve the layout and explain the next action briefly.

### Negocio

This is the densest surface. Consolidate six metrics, six subviews, agenda, automations and pricing into a commercial command center. Use a focused pipeline/agenda view with one contextual secondary view, responsive tabs or a selector, and clear exception states. Never allow raw errors such as “Channel not found for this user” to dominate the UI.

### Audiencia

Tell one story: where intent is coming from and what the creator should do next. Use visual trends, ranked destinations/videos and a concise YouTube-vs-map comparison. Reduce repeated KPI and insight cards; connect signal to recommended content or sponsor action.

### Actividad

Use a compact, filterable timeline grouped by day and entity. Prioritize warnings, failed syncs and reversible changes. Healthy low-volume states should feel intentional rather than empty.

## Responsive and accessibility constraints

- Design desktop at 1440 × 1024 and validate the information model at 390 × 844.
- No horizontal overflow for navigation, filters, tables or business subviews.
- Minimum body size 14 px; minimum interactive target 44 × 44 px on mobile.
- Keep contrast suitable for dark surfaces and never communicate status by color alone.
- Primary navigation needs persistent labels on desktop and clear text labels in the mobile menu or bottom navigation.
- Use at most two typefaces and no more than three semantic accent colors on one screen.
- Avoid nested cards, decorative charts without meaning, glassmorphism haze, excessive gradients and repeated badges.

## Three visual directions

### Direction A — Editorial Focus

A creator-first, calm editorial interface with a warm off-white working canvas, graphite type, coral actions and large destination imagery. Navigation uses labels, sections behave like magazine spreads, and detail appears in a contextual drawer. Best for emotional clarity and text reduction.

### Direction B — Dark Control Room

An evolution of the current dark identity. Use a compact labeled sidebar, a persistent contextual command bar, subtle data visualization and highly disciplined grouped surfaces. Best for operational speed, familiarity and information density without visual noise.

### Direction C — Living Atlas

A geographic, visual-first system where map, country imagery and destination signals become the main organizing layer. Lists and metrics orbit the selected place or content object. Use motion cues and responsive bottom sheets conceptually, while keeping the composition minimal. Best for product differentiation and creator inspiration.

## ImageGen deliverables per direction

Generate one independent, production-quality desktop UI mockup for each of the nine sections: Resumen, Videos, Países, Votaciones, Sponsors, Media Kit, Negocio, Audiencia and Actividad. Each image must be a single focused screen at 1440 × 1024, without browser chrome.

Also generate responsive companion mockups for Resumen, Videos and Negocio at 390 × 844. These three screens cover the main responsive patterns: overview cards, content management and dense commercial navigation.

Attach the matching current screenshot to each ImageGen call as a reference image. The reference is grounding material, not a target to copy. Preserve entities and workflows but recompose hierarchy, copy density and interaction emphasis according to the chosen direction.

Use Spanish text, exact section names and plausible data anchored to 2026-07-17. Do not combine multiple screens or multiple visual directions in one image.
