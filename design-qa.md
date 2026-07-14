# Design QA · Onboarding móvil fiel a referencia

- Source visual truth: `/Users/bypupila/.codex/generated_images/019f6276-5b2a-7340-b631-8b5dbd63eb3e/exec-19ccc759-fb58-4753-8f3d-1538e949c624.png`
- Implementation route: `http://localhost:3000/onboarding?demo=1&plan=creator`
- Viewport: `390 × 844` CSS px (equivalente móvil de la referencia 853 × 1844 px).
- Implementation screenshot: `/Users/bypupila/.codex/visualizations/2026/07/14/019f6276-5b2a-7340-b631-8b5dbd63eb3e/onboarding-exact-qa/implementation-390x844-final.png`
- Side-by-side comparison: `/Users/bypupila/.codex/visualizations/2026/07/14/019f6276-5b2a-7340-b631-8b5dbd63eb3e/onboarding-exact-qa/comparison-reference-vs-implementation-final.png`
- Seven-step evidence: `/Users/bypupila/.codex/visualizations/2026/07/14/019f6276-5b2a-7340-b631-8b5dbd63eb3e/onboarding-exact-qa/verified-step-1-390x844.png` through `verified-step-7-390x844.png`.

## Final visual assessment

No actionable P0, P1 or P2 differences remain for the requested mobile scope.

- The shell follows the reference's 71 px header, continuous rounded content panel and 98 px fixed action area.
- The title, eyebrow and supporting copy use the same left alignment, wrapping, hierarchy and coral/cream contrast.
- Plan cards match the selected and inactive states, radio treatment, badge, border radii and compact vertical proportions.
- The selected Creator card keeps the exact two-column feature reading order shown in the source.
- Legal consent and the Polar action remain fully visible without scrolling at 390 × 844.
- [P3] Outfit's browser rasterization produces minor glyph-width differences from the generated source image.
- [P3] The black `N` control in development screenshots is the Next.js development indicator and is not part of the production UI.

## Iteration history

1. **P1 — wrong design language:** the previous mobile implementation was a generic compact centered layout instead of the supplied editorial reference.
   - Fixed the mobile shell, hierarchy, alignment, header, panel and footer from the reference measurements.
2. **P2 — plan state mismatch:** cards did not reproduce the source's active/inactive density and radio/badge treatment.
   - Rebuilt both plan states and retained full desktop detail from the `md` breakpoint upward.
3. **P2 — clipping and rhythm:** the legal card and CTA competed for vertical space and the selected plan was too tall.
   - Matched the 243 px selected card, 140 px inactive card, 58 px legal card and fixed action area.
4. **P2 — feature ordering:** the first pass rendered the feature grid row-major rather than the source's column-major order.
   - Switched the mobile grid flow so both visual rows match the reference exactly.

## Functional and responsive verification

- Traversed all seven onboarding steps sequentially at 390 × 844.
- Confirmed every step exposes its H1 and visible primary action.
- Tested Creator and Creator Pro selection states.
- Tested the legal consent checkbox.
- Preserved tablet and desktop behavior through existing `md` responsive rules.
- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Production build (`next build`): passed.
- Git whitespace validation: passed.

final result: passed
