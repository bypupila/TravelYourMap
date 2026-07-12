# Admin map access implementation

## Objective

Allow superadmin users to open creator maps from the admin panel without breaking the existing public map access rules.

## Scope

- `src/lib/map-public.ts`

## Non-goals

- No UI redesign.
- No change to public demo routing.
- No change to creator ownership rules for regular creators.

## Decision

- When resolving a UUID channel map, allow access if the viewer is:
  - the channel owner
  - a superadmin
  - or the map is already public

## Acceptance criteria

- Superadmin can open a private creator map from the admin panel.
- Public map access remains unchanged.
- Demo map behavior remains unchanged.

## Validation

- `GET /map?channelId=<private>` with a signed superadmin session returned `200` and rendered `MapExperienceCore`.
- `GET /creator-panel?channelId=<private>` with a signed superadmin session returned `200` and included the private map URL.
- `GET /map-admin-proposal?channelId=<private>` with a signed superadmin session returned `200` and included the private map URL.
