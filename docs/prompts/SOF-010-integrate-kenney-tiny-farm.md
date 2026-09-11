# SOF-010 — Integrate Kenney Tiny Farm assets

## Goal

Use the builder-supplied Kenney Tiny Farm pack as visible, runtime-loaded plaza assets.

## Context/files

- `assest/kenney_tiny-farm/`
- `Game_Asset_Specification.md`
- `src/game/scenes/PreloadScene.ts`
- `src/game/scenes/PlazaScene.ts`
- `scripts/generate-pixel-assets.mjs`
- `scripts/validate-assets.mjs`

## Constraints

- Preserve source files and the included CC0 license.
- Use the actual 16×16 sheet with its documented one-pixel spacing.
- Do not add dependencies or alter gameplay, sponsors, or backend behavior.
- Keep the builder-supplied grass base because Tiny Farm does not include a grass base tile.

## Done when

- Phaser loads the licensed Kenney sheet through the manifest.
- The plaza visibly uses its routes and landscape props.
- Asset validation, automated checks, and browser inspection pass.
