# How It Works Accordion

## Problem Statement
Visitors currently see the channel-to-map process as four disconnected cards. The section lacks the editorial topographic character and guided step-by-step interaction selected for the TravelYourMap landing experience.

## Solution
Replace the card row with a responsive split panel. The textured editorial side explains the promise and mirrors the selected step's progress. The process side exposes four accessible accordion rows, with one expanded description at a time. Simplify the nearby landing by removing the sponsor comparison and redundant demo badge, then compact and recolor the demo media kit so it uses the same established dark-mode palette.

## User Stories
1. As a travel creator, I want to understand the four setup steps at a glance, so that I can judge how quickly I can publish my map.
2. As a travel creator, I want to expand each step, so that I can learn what TravelYourMap does without leaving the landing page.
3. As a mobile visitor, I want the section to become a clear single-column flow, so that no content is clipped or compressed.
4. As a keyboard user, I want every step to be reachable and operable, so that I can explore the process without a pointer.
5. As a visitor with reduced-motion preferences, I want the interface to avoid unnecessary movement, so that the interaction remains comfortable.
6. As an English-language visitor, I want the same interaction and hierarchy with localized copy, so that the experience remains consistent across languages.
7. As a visitor, I want the landing sections to share one dark visual system, so that the page feels coherent rather than assembled from unrelated palettes.
8. As a sponsor reviewing the demo media kit, I want credibility information to be compact and immediately scannable, so that the example does not feel sparse.

## Implementation Decisions
- Build an isolated client-side accordion leaf and keep the landing page layout server-rendered.
- Reuse the product's existing topographic raster asset rather than creating a duplicate visual.
- Use local component state because the selected step is isolated to this section.
- Use one open step at a time, with the first step selected initially.
- Use the existing Phosphor icon dependency and one consistent icon weight.
- Animate only transform and opacity-based details, with reduced-motion support.
- Use a two-track desktop grid and a single-column mobile layout.
- Remove the sponsor comparison from the landing render tree and remove its now-unused code.
- Remove only the redundant overlay badge from the demo image; retain the media-kit channel title.
- Map demo media-kit surfaces and text back to established landing tokens instead of introducing blue surfaces.
- Reduce fixed desktop height and vertical gaps while retaining readable grouping.

## Testing Decisions
- Verify user-visible accordion behavior through click and keyboard interaction.
- Verify the Spanish and English landing routes render localized content.
- Compare the rendered desktop section against the supplied visual at a matching aspect ratio.
- Capture and inspect desktop, tablet, and 390px mobile layouts for overflow, clipping, and hierarchy.
- Confirm the sponsor comparison and image badge are absent.
- Run ESLint, TypeScript, and the production build.

## Out of Scope
- Changing navigation, onboarding behavior, or global brand tokens.
- Adding backend state or persisting the selected step.
- Reworking the source topographic texture.

## Further Notes
The supplied visual is the source of truth. Responsive adaptations preserve its hierarchy while changing the layout where required for usability.
