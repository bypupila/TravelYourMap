# How It Works Accordion

## Status
Implementing

## Problem
The current four-step landing section reads as a generic row of cards and does not match the selected TravelYourMap visual direction.

## Desired Behavior
The landing presents the process as one large split panel: editorial content over the existing topographic texture on the left and an interactive four-step accordion on the right. The composition must closely match the approved visual reference and remain clear and usable from mobile through large desktop screens. The surrounding landing is simplified and visually normalized so this section sits within one coherent dark-mode system.

## Resolved Language
No new domain vocabulary is introduced. Existing localized landing terminology remains canonical.

## Decisions
- Reuse the existing TravelYourMap topographic texture and landing palette.
- Keep the first step open by default and allow exactly one step to be open at a time.
- Preserve Spanish and English localized content.
- Use the existing Phosphor icon family and keep icon weight consistent.
- Collapse the split panel into a strict single-column layout below the desktop breakpoint.
- Respect reduced-motion preferences while providing restrained accordion transitions.
- Remove the sponsor comparison section.
- Remove the redundant image-overlay demo-channel badge while preserving the media-kit example name.
- Recalibrate the demo media kit to the existing charcoal, warm-white, and coral landing tokens.
- Reduce the demo media kit height and excessive credibility whitespace without weakening its hierarchy.

## Constraints
- Match the selected reference's proportions, hierarchy, borders, texture, spacing, and density at its desktop aspect ratio.
- Maintain semantic buttons, keyboard operation, visible focus, adequate contrast, and practical mobile tap targets.
- Avoid horizontal overflow and clipped copy at 390px, 768px, 1024px, and large desktop widths.
- Do not add new dependencies or duplicate the topographic asset.
- Validate content, lint, TypeScript, build, interactions, responsive layouts, and visual fidelity across both edited sections.

## Open Questions
None. The selected visual and explicit request close the design and interaction scope.

## PRD
[How It Works Accordion PRD](../prd/how-it-works-accordion.md)
