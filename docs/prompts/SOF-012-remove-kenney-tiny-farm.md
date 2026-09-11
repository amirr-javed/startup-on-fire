# SOF-012 — Remove Kenney Tiny Farm assets

## Goal

Remove all Kenney Tiny Farm assets and return the live plaza to the builder's original artwork.

## Constraints

- Delete the verified Kenney source and runtime directories only.
- Preserve the supplied terrain and Scout, and the booth, founder, and fountain runtime assets.
- Do not change game mechanics, providers, or backend behavior.

## Done when

- No Kenney asset is registered, loaded, or retained in the workspace.
- The original plaza artwork renders without missing textures.
- Asset validation and automated checks pass.
