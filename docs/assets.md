# Asset provenance

## SOF-005 — Greybox plaza batch v001

- **Date:** 2026-09-05
- **Purpose:** Original, game-loadable art for the first playable plaza; not the final production polish pass.
- **Visual reference:** `art/references/sof-005-plaza-style-reference.png`, generated with OpenAI image generation from the archived SOF-005 prompt. The service did not expose a model version. It produced a painted background and non-runtime scale, so it is retained only as reference and is not loaded by the game.
- **Runtime generator:** `scripts/generate-pixel-assets.mjs`, authored with Codex assistance. It deterministically draws and encodes exact-size RGBA PNGs using the approved project palette. No third-party source art is embedded.
- **Exports:** 17-frame 16×16 terrain strip; three 96×96 booths; fountain, tree, shrub, bench, lamp, and sign props; a 64×128 Scout four-direction/four-frame walk sheet; and three 16×32 founder sprites.
- **Metadata:** `public/assets/manifest.json` records paths, dimensions, frame grids, origin/collision metadata, source revision, validation status, palette, and SHA-256 for each of 14 PNG files.
- **License note:** These files were generated specifically for this project. No external asset license is relied upon; this record does not make a legal ownership guarantee.
- **Edits:** Runtime files are not crops or reductions of the generated reference. They are deterministic pixel constructions informed by its broad shape and the pre-approved visual specification.

The next art batches are fire tiers and Bug Squash sprites. Optional animation/polish remains gated until the core loop is stable.
