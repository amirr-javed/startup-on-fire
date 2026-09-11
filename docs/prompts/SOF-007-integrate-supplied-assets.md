# SOF-007 prompt archive — Integrate supplied visual assets

## Builder request

Add the assets from the supplied composite image to the game.

## Asset interpretation

The supplied 1536×1024 image exactly matches the retained SOF-005 reference by SHA-256. It is a reference sheet, not a runtime atlas: objects share a painted background and have inconsistent bounds. Extract each requested subject non-destructively, preserve the v001 fallback pack, and integrate separately addressable v002 textures.

## Built-in image-generation edit prompt set

Use case: `background-extraction`. Treat the supplied image as the edit target and style source. For each call, isolate exactly one of the following subjects: left wooden booth; blue-awning booth; orange-awning booth; fountain; Scout; glasses founder; headphones founder; beanie founder. Preserve the chosen subject's chunky pixel style, palette, objects, and perspective. Remove the full background, ground halo, flowers, rocks, and every other subject. Center the complete subject on a genuinely transparent canvas with padding. Add no text, labels, watermark, glow, shadow, clipping, or new objects.

## Runtime boundary

The eight outputs remain full-resolution transparent source exports under `art/revisions/SOF-007-v002/`. Matching runtime files live under `public/assets/polished/`, are independently registered in the asset manifest, and are scaled explicitly by Phaser. The deterministic v001 assets remain available as fallbacks.
