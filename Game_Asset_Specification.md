# Startup on Fire — Game Asset Specification

Revision: September 5, 2026. Status: production contract; assets have NOT been generated or validated by this document update.

## What “generate assets” means

Deliver reusable, individually addressable runtime art plus metadata and provenance. A single full-scene image, collage, or illustrated sprite-sheet mockup is not a completed asset pack. Generate in coherent batches; list what is delivered, validated, and still missing. Use the approved concept as a style reference, not the map background.

## Visual invariants

- Bright, original top-down 16-bit-style pixel art; cozy market town plus modern startup campus.
- 16×16 base tiles, approximately 16×32 characters, integer scaling and nearest-neighbour rendering.
- Grass green, cream, wood, charcoal, orange/yellow fire, restrained tech blue; no purple art accents even if present in a concept draft.
- Exactly three MVP startup booths around a fountain. Cold, Hot, and Blazing bonfires communicate real support; illustrated crowds are not live users or evidence of popularity.
- Compact Scout HUD is DOM/CSS. Render names, labels, dialogue, fuel count, and changing scores as runtime text, not baked into artwork.

## Proposed runtime inventory

These dimensions are implementation targets, not claims about generated output. Confirm them against greybox collision footprints before production; log any revision.

| Batch | Deliverable | Target and minimum contents |
|---|---|---|
| A: Terrain | terrain.png | 16×16 untrimmed tile grid: 4 grass variants, 9 path center/edge/corner tiles, 4 outer boundary transitions; record every index |
| B: Booths | booth-01.png through booth-03.png | Three isolated 96×96 RGBA buildings with blank sign areas; ground footprint separate from roof overhang |
| B: Props | fountain.png, tree.png, shrub.png, bench.png, lamp.png, sign.png | Separate transparent props; target fountain/tree 48×64, shrub 16×16, bench/sign 32×32, lamp 16×48 |
| C: Player | scout-walk.png | 16×32 frames, four direction rows (down/left/right/up), four frames per row; 64×128 sheet; one designated idle frame per direction |
| C: NPCs | founder-01.png through founder-03.png, ember-guide.png | Four distinct 16×32 idle sprites; animated idle and walking crowds are optional later |
| D: Fire | fire-cold.png, fire-hot.png, fire-blazing.png | Each sheet 384×96: six 64×96 frames in one row with identical base anchor; visible fire grows inside the fixed frame |
| D: Fire base | fire-pit.png | Separate 64×32 transparent stone/log base, aligned with all tiers |
| E: Minigame | bug.png, hit.png | Four 16×16 bug frames; four 32×32 hit frames; explicit timing metadata |
| F: Optional polish | fountain animation, fuel burst, crowd variants | Separate sheets only after required assets pass; define grids before generation |

## Export and metadata contract

- Runtime exports: PNG; true alpha for isolated objects, no checkerboard baked in. Terrain may be opaque.
- Keep a consistent source-pixel grid. Do not shrink a high-resolution illustration and call it pixel-perfect without inspection/cleanup.
- Sprite sheets use untrimmed frames, zero padding and spacing unless the manifest explicitly states otherwise. No frame overlap, clipping, embedded labels, or unrelated decorative borders.
- Use fixed anchors across frames: character bottom-center; fire common ground anchor; props explicit base anchor. Define collision rectangles separately from full visual bounds.
- Proposed timing: player walk 8 fps; fire 8 fps looping; hit 12 fps non-looping. Verify visually and log tuning changes.
- Store exports under public/assets/{terrain,buildings,props,characters,fire,minigame}/. Store source art and retained revisions under art/source/ and art/revisions/. Store references under art/references/.
- Maintain public/assets/manifest.json with asset ID, URL, dimensions, frame dimensions/count, rows/direction order, animation keys/ranges/fps/repeat, origin, collision footprint, source revision, and validation status. Match its schema to the actual Phaser loader rather than inventing unsupported loader fields.
- Record SHA-256 file hashes, prompt, generator/tool where known, generation date, edits, and license/provenance in docs/assets.md. Never invent model versions, ownership guarantees, or license terms.
- Name unapproved iterations with -v001, -v002, etc.; approved runtime paths can remain stable for code references while Git preserves approved replacements. Do not delete source revisions without approval.

## Production workflow

1. Confirm Git baseline and allocate a task ID before generating anything.
2. Inspect reference, greybox, and existing assets; write a manifest for the requested batch. Identify missing references or generation capability.
3. Generate each requested asset or coherent sheet using the available image tool. One output is not a substitute for the inventory. Do not stop after concept art and claim completion.
4. Inspect output. Correct inconsistent geometry, transparency, frame alignment, seams, or style. If the tool cannot provide exact runtime structure, mark it raw/unvalidated and explain the remaining cleanup.
5. Export and validate actual PNG dimensions, alpha, frame divisibility/counts, manifests, and path resolution. A generated preview alone does not pass these checks.
6. Load the batch in a Phaser test scene: animate each sheet, show nearest-neighbour 1×/2×/3× previews, repeat terrain edges, overlay collision footprints, and check roof/character depth ordering.
7. Inspect for jitter, changing character proportions, foot sliding, clipped effects, path seams, inconsistent outlines, and unreadable scale. Record pass/fail and evidence in docs/asset-validation.md.
8. Update change log, AI-use record, provenance, and relevant code references. Review the diff and previews, then commit after approval.

## Batch acceptance

An asset is ready only when file and visual checks pass and it loads correctly in the engine. A batch handoff lists every file, dimensions, frame count, animation keys, validation results, remaining gaps, and commit status. If no game exists, file-level validation is possible but in-engine validation remains explicitly pending.

## Not part of an asset request

Do not add gameplay, sponsor integrations, new districts, monetization, coins, or a permanent directory panel. Do not generate a new concept image unless requested. Do not imply generated crowds are actual connected people or grant public fire score through visual effects.
