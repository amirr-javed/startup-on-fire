# SOF-013 — Generate complete original runtime asset pack

## Builder request

Use OpenAI image generation to build all runtime assets required by `Game_Asset_Specification.md`. Do not use Kenney Tiny Farm or any other third-party game pack.

## Constraints

- Original bright top-down 16-bit-style pixel art for the hybrid modern startup campus/cozy market-town direction.
- 16×16 tile basis, approximately 16×32 characters, integer scaling, hard pixel edges, and true transparency where required.
- Palette: grass, cream, wood, charcoal, ember orange, flame yellow, and limited tech blue; avoid purple.
- Produce separately addressable runtime assets and sprite sheets, not a scene collage.
- Preserve raw generated sources in `art/revisions/SOF-013-v001/raw/` and place only validated exports in `public/assets/original/`.
- Do not bake UI, text, scores, characters, fires, or collision-dependent props into terrain.
- Validate dimensions, alpha, frame grids, anchors, seams, animation continuity, manifest hashes, Phaser loading, lint, typecheck, tests, and build before calling the pack complete.

## Required inventory

- Terrain tilesheet: grass variants, path centers/edges/corners, and outer-boundary transitions.
- Three 96×96 startup booths with blank sign panels.
- Fountain, tree, shrub, bench, sign, and lamp props.
- Scout 4-direction, 4-frame walk sheet.
- Three founder NPCs and Ember guide.
- Cold, Hot, and Blazing six-frame fire sheets plus shared fire pit.
- Four-frame Bug Squash bug and hit-effect sheets.

## Generation note

Each prompt requests one asset or one coherent sprite sheet. Raw model outputs are source revisions, not automatically engine-ready. Mechanical export and validation must preserve the original generated artwork while enforcing the exact runtime canvas and grid.
