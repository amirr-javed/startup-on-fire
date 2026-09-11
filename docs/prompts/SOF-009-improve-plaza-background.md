# SOF-009 — Improve plaza background

## Goal

Replace the visually poor plaza background with a cohesive, tile-aligned game ground.

## Context/files

- `src/game/scenes/PlazaScene.ts`
- `src/game/world/plazaLayout.ts`
- `src/styles/main.css`
- `tests/plaza.test.ts`
- `Game_Asset_Specification.md`

## Constraints

- Preserve the builder-supplied terrain assets and all unrelated uncommitted work.
- Keep the supplied 4×4 terrain field as the active ground; reuse the validated 16×16 path tiles and existing layout constants.
- Do not add dependencies, alter gameplay, or add any new sponsor scope.
- Keep landscape pixel-art rendering crisp and make letterboxing visually unobtrusive.

## Done when

- The plaza uses the supplied grass terrain with a readable, tile-aligned path composition.
- The surrounding page blends into the game at non-landscape aspect ratios.
- Automated checks and a browser visual check pass.
