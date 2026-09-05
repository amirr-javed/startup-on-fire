# Asset validation

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
