# PRD: Planes canónicos y permisos de Sponsors

Estado: implementado localmente y verificado; despliegue y E2E Polar Sandbox pendientes.

## Problem Statement

La persona que evalúa TravelYourMap recibe una oferta distinta según la pantalla: Viewer gratis se presenta como si fuera un plan Creator, Creator de USD 29 promete un sponsor aunque comercialmente no debe incluir Sponsors, y home/pricing omiten Creator aunque onboarding sí lo ofrece. Además, el servidor sólo comprueba si existe una suscripción activa y no distingue qué plan habilita las capacidades comerciales. Esto permite que el texto, el checkout y los permisos reales diverjan.

## Solution

TravelYourMap tendrá una única jerarquía comercial y de autorización:

- Viewer gratis: cuenta de audiencia para votar, guardar e interactuar; no crea ni importa un canal.
- Creator — USD 29/mes: mapa, videos y herramientas Creator sin capacidades propias de Sponsors.
- Creator Pro — USD 79/mes: incluye Sponsors, reportes y herramientas comerciales.
- Agency — USD 199/mes: próximo lanzamiento, orientado a portafolios.

La misma definición canónica alimentará home, pricing, onboarding, checkout y permisos. Toda operación privada de Sponsors se autorizará server-side según el plan del propietario del canal. Al perder el entitlement, los sponsors del creador y sus superficies privadas o tokenizadas dejan de estar disponibles; los anuncios o sponsors operados por la plataforma pueden seguir apareciendo.

## User Stories

1. As a Viewer, I want to register for free, so that I can vote, save favorites, and interact without believing I am creating a channel.
2. As a prospective creator, I want to see Creator at USD 29 on home and pricing, so that the entry price is transparent before onboarding.
3. As a prospective creator, I want to understand that Creator excludes Sponsors, so that I can compare it honestly with Creator Pro.
4. As a prospective creator, I want to see that Creator Pro includes Sponsors, so that the reason for paying USD 79 is concrete.
5. As a prospective agency customer, I want Agency marked as upcoming, so that I do not attempt an unavailable checkout.
6. As a Creator subscriber, I want access to map and video functionality, so that the plan remains useful without commercial tooling.
7. As a Creator subscriber, I want Sponsors surfaces to explain that they require Creator Pro, so that the upgrade path is understandable.
8. As a Creator subscriber, I want direct Sponsors API calls rejected, so that UI hiding cannot be bypassed.
9. As a Creator Pro subscriber, I want Sponsors CRUD, assignment, reports, CRM, Media Kit sponsor data and Brand Portal to continue working.
10. As a downgraded Creator, I want existing creator-owned sponsors and private commercial links disabled without destructive deletion, so that upgrading again can restore the data.
11. As a public visitor, I do not want creator-owned sponsors from an ineligible channel exposed, so that public output matches the creator's current plan.
12. As a public visitor, I may still see platform-operated advertising, so that platform monetization is independent from the creator's entitlement.
13. As an operator, I want entitlement decisions based on the channel owner, so that superadmin access cannot accidentally lend another user's plan.
14. As an operator, I want legacy plan aliases normalized, so that `starter`, `pro`, and `creator_plus` behave consistently with their canonical names.
15. As an operator, I want entitlement denials to be controlled 403 responses, so that expected upgrade attempts do not pollute Sentry.
16. As a Spanish or English user, I want equivalent plan benefits and limitations, so that language selection does not alter the offer.
17. As a keyboard or mobile user, I want pricing and upgrade controls to remain accessible and responsive, so that the new tier does not break the purchase journey.
18. As a billing operator, I want checkout slugs unchanged, so that this adjustment does not silently replace Polar product identities before Sandbox certification.

## Implementation Decisions

- Extend the canonical plan model with explicit capabilities rather than inferring permissions from display text.
- Treat `free` as the Viewer acquisition tier in presentation; it is not an active Creator entitlement.
- Normalize the technical aliases `starter → Creator`, `pro → Creator Pro`, and `creator_plus → Agency`.
- Authorize Sponsors against the active, non-expired subscription of the channel owner.
- Creator Pro and Agency have Sponsors capability; Creator and Viewer do not. Agency remains unavailable for new checkout.
- Return a stable forbidden response with an upgrade code for authenticated users lacking the capability.
- Apply the guard to creator-owned Sponsor CRUD, ordering, bulk assignment, metrics, reports, schedules, CRM, commercial inquiries, Media Kit sponsor data and Brand Portal access.
- Preserve existing sponsor records on downgrade; disable exposure and operations rather than deleting data.
- Keep platform-owned advertising and sponsor inventory separate from creator-owned Sponsors entitlement.
- Present Creator and Creator Pro on home, pricing and onboarding using the same canonical data.
- Route the Viewer free CTA to Viewer registration, not Creator onboarding.
- Keep current checkout identities and defer Polar product creation or replacement to the Sandbox certification task.
- Record expected entitlement denials as controlled business responses, not Sentry incidents.

## Testing Decisions

- Test at the highest observable seams: rendered pricing/onboarding, authenticated API responses, public map payloads and tokenized commercial pages.
- Verify Viewer CTA destination and that Viewer is never sent to Creator checkout.
- Verify Creator receives 403 with a stable upgrade code for private Sponsors operations.
- Verify Creator Pro retains successful Sponsors operations and existing ownership/IDOR behavior.
- Verify a downgraded Creator retains database records but loses public/private exposure.
- Verify public platform advertising remains independent from creator-owned Sponsors.
- Verify Spanish and English plan names, features, prices and availability.
- Run focused lint and TypeScript checks, the complete release check, and browser regression at mobile and desktop pricing/onboarding viewports.
- Reuse the existing QA role and Sponsors matrix as the end-to-end regression seam; do not test internal helper implementation details.

## Out of Scope

- Creating Polar Sandbox products, prices, discounts or webhooks.
- Charging a real payment method.
- Launching Agency.
- Deleting historical sponsor, campaign, report or portal data after downgrade.
- Redesigning Sponsors or CRM beyond the required upgrade state.
- Changing platform advertising policy or inventory.

## Further Notes

- This change closes the commercial inconsistency identified during launch certification, but public payment remains No-Go until Polar Sandbox and import E2E are approved.
- Existing data must remain recoverable if a creator upgrades back to Creator Pro.
