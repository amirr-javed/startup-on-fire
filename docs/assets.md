# Asset provenance

## SOF-013 — Original generated runtime pack v001

- **Tool and purpose:** Built-in OpenAI image generation created one isolated asset or coherent sprite sheet per call for the complete required game inventory. No Kenney or other third-party game pack was referenced.
- **Raw sources:** `art/revisions/SOF-013-v001/raw/` retains the 21 initial outputs plus the rejected terrain edit revision. These high-resolution RGBA files are source art, not direct runtime claims.
- **Runtime exports:** `public/assets/original/` contains 21 separately addressable exact-size RGBA PNGs. `scripts/export-generated-assets.mjs` detects alpha bounds, crops conceptual cells, applies nearest-neighbour scaling, fixes bottom-center anchors, and assembles exact grids. `scripts/generate-pixel-assets.mjs` records hashes and metadata in the runtime-only manifest.
- **Terrain exception:** The first terrain generation had dark cell dividers; the edit removed them but baked a checkerboard and lost alpha. The accepted runtime terrain is assembled from the first transparent revision while excluding divider pixels. Both attempts remain retained for audit.
- **Integration:** The manifest and Phaser plaza now use only SOF-013 assets. Older builder-supplied and polished art remains on disk for rollback but is not registered or loaded. No Kenney directory or manifest reference exists.
- **Prompt record:** `docs/prompts/SOF-013-generate-complete-original-asset-pack.md` records the builder request, shared visual constraints, complete inventory, and source/runtime handling rules.
- **License/provenance note:** The artwork was generated specifically for this project. No third-party asset license is relied upon; this record does not provide a legal ownership guarantee.

## SOF-012 — Kenney Tiny Farm removed

- **Previous input:** Tiny Farm 1.0 by Kenney, supplied under `assest/kenney_tiny-farm/` with a CC0 1.0 license.
- **Removal:** At the builder's request, both the source pack and `public/assets/kenney-tiny-farm/` runtime copy were removed. Its sheet is no longer registered in the manifest or loaded by Phaser.
- **Current runtime art:** The plaza keeps only the builder-supplied grass terrain and Scout poses, plus the existing booth, founder, fountain, and Scout portrait assets.

## SOF-008 — Builder-supplied terrain and Scout direction set

- **Input:** 16 RGBA world tiles under `assest/backgound/` and eight 48×48 RGBA directional Scout idle poses under `assest/player 1/Idle/rotations/`, supplied by the builder on 2026-09-10.
- **Runtime outputs:** The original directional files are copied to `public/assets/supplied/characters/`. The world tiles are cropped only to remove the source's white export margin and stored as `public/assets/supplied/world-clean/`; the source files remain untouched.
- **Integration:** `PlazaScene` assembles the 4×4 clean tile grid at 144×144 display cells. The Scout uses its supplied south, cardinal, and diagonal poses while moving. The old `scout-walk` sheet remains registered but unused as a rollback fallback.
- **Metadata and provenance:** `public/assets/manifest.json` records actual dimensions, SHA-256 hashes, source revision `builder-supplied-2026-09-10`, grid positions, and collision metadata.
- **Limitation:** The Scout export includes idle poses only; it is not represented as a completed multi-frame walking animation.

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

## SOF-007 — Supplied-reference extractions v002

- **Input:** The builder-supplied composite was SHA-256-identical to `art/references/sof-005-plaza-style-reference.png`; no duplicate reference blob was added.
- **Tool:** Built-in OpenAI image generation, background-extraction edit mode. The service did not expose a model version.
- **Outputs:** Three transparent booth textures, one transparent fountain, one Scout portrait, and three transparent founder textures.
- **Source retention:** Full extraction outputs are preserved under `art/revisions/SOF-007-v002/`; runtime copies are under `public/assets/polished/`.
- **Integration:** The manifest generator reads the existing polished files, records their actual dimensions and hashes, and registers them without overwriting the deterministic v001 fallback files.
- **Important limitation:** These are large AI-extracted PNGs displayed at a much smaller game scale. They are visually richer but not yet optimized into hand-cleaned 16-pixel production sheets. The Scout extraction is used as the DOM HUD portrait while the existing four-direction sheet continues to drive player movement.
