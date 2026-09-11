# Asset validation

## SOF-013 — Complete original runtime pack

- `pnpm assets:generate` reproducibly exports 21 exact-size RGBA PNGs from retained OpenAI-generated sources using nearest-neighbour sampling and fixed anchors.
- `pnpm assets:validate` passes for all 21 manifest entries: paths resolve, dimensions and SHA-256 hashes match, PNG color type is RGBA, and every sheet divides exactly into its declared frame grid.
- Verified inventory: 96×48 terrain sheet (18 16×16 cells, 17 used); three 96×96 booths; 64×128 Scout sheet (4×4 frames at 16×32); four 16×32 NPCs; fountain 48×64; tree 48×64; shrub 16×16; bench/sign 32×32; lamp 16×48; fire pit 64×32; three 384×96 fire sheets (six 64×96 frames); bug 64×16 (four 16×16 frames); and hit 128×32 (four 32×32 frames).
- Final sprites were visually inspected at native resolution. The generated terrain, paths, booths, founders, Scout, Ember, props, and three animated fire tiers were then verified in the live Phaser plaza after a clean browser reload.
- The first screenshot occurred while the dev page was hot-reloading and showed only the shell; a reload completed normally and showed the entire scene with connected realtime status. This was not counted as a pass until the scene rendered.
- Remaining evidence: frame-by-frame continuity capture, physical-device touch review, and in-scene Bug Squash playback once that scene exists.

## SOF-012 — Kenney Tiny Farm removal

- The Kenney source and runtime directories are removed; the manifest no longer includes an indexed-PNG asset.
- `pnpm assets:generate` and `pnpm assets:validate` now cover only the current original runtime set. Browser review verifies the original terrain, Scout, booths, founders, and fountain load without a missing texture.

## SOF-008 — Builder-supplied terrain and Scout direction set

- `pnpm assets:validate` passed for all 46 registered RGBA PNG assets, including every supplied terrain tile and Scout direction.
- All terrain tiles load at their retained grid order and form a 576×576 world ground layer. A source-export white margin was confirmed in preview and removed only from derived runtime copies; no white gaps remain in the running world.
- The 48×48 Scout direction images load as independent textures. Browser inspection confirmed the visible Scout, the Ember Studio interaction prompt, and a connected realtime status after the scene loaded.
- The supplied world tiles have a subtle green-tone transition at one horizontal source-row join. This is retained as a source-art continuity limitation; it does not block loading, collisions, or player interaction.

## SOF-005 — Greybox plaza batch v001

### Automated checks

- `pnpm assets:validate` passed for 14 PNG files.
- Every manifest path resolved, PNG dimensions matched metadata, color type was RGBA, SHA-256 matched, and sprite-sheet dimensions divided exactly by their frame grids.
- Terrain is 272×16 with 17 untrimmed 16×16 frames.
- Scout is 64×128 with 16 untrimmed 16×32 frames in down/left/right/up row order.
- Booths are 96×96; founders are 16×32; prop dimensions match `Game_Asset_Specification.md`.

### Phaser and visual checks

- The manifest loaded all 14 files through `PreloadScene` without an application error.
- The 36×22-tile ground repeated at nearest-neighbour scale without visible gaps in the inspected plaza view.
- The Scout, all three booths/founders, fountain, benches, lamps, shrub, tree, and sign rendered as separate objects.
- Keyboard movement visibly changed the Scout position; the character stayed pixel-sharp and its feet remained on a stable bottom-center anchor.
- Collision bodies are separate from booth/fountain visual bounds. Camera follow and depth updates are active.
- The Ember Studio proximity prompt and founder interaction were manually exercised; the counter changed from 0/3 to 1/3 and the compact dialogue remained over the world.

### Remaining validation and polish

- Automated browser traversal of all three booth routes and physical-device touch testing remain pending; pure layout tests confirm three unique in-bounds interaction points.
- Collision overlays, 1×/2×/3× comparison boards, and a frame-by-frame walk-cycle review should be completed before promoting this greybox batch to production art.
- Terrain/path art is intentionally sparse, and founders are static. Stronger silhouettes, more transition variants, and animation polish are future revisions.
- Fire and minigame asset batches do not exist yet and are not represented as complete.

## SOF-007 — Polished extraction integration

- Eight RGBA PNGs were extracted independently from the supplied reference and registered with actual dimensions and SHA-256 hashes.
- Phaser uses the three new booth textures, fountain, and founder textures as separate world objects. The Scout extraction appears in the DOM HUD; the animated v001 Scout remains the controllable sprite to preserve four-direction movement.
- The v001 asset paths remain loaded and available as fallbacks.
- Full-resolution source and runtime copies are intentionally retained until an optimized downscale/cleanup revision is reviewed.
