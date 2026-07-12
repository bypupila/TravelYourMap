# Admin map access

## Issue

The admin panel links to a creator map, but private creator maps were only being resolved for:

- public channels
- the channel owner

That blocked superadmin users from opening private creator maps from the admin surface.

## Inferred answer

- Superadmin should be allowed to open private creator maps.
- Public access behavior must remain unchanged.
- The fix belongs in map payload resolution, not in the admin button.

## Source

- Source: codebase
- `src/app/map/page.tsx`
- `src/lib/map-public.ts`
- `src/app/creator-panel/page.tsx`

