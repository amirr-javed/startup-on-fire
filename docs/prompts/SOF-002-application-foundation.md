# SOF-002 Prompt Archive — Application Foundation

## Goal

Create the initial single-package browser application using vanilla TypeScript, Vite, Phaser 3, and Convex, with strict automated checks and CI.

## Constraints

- Preserve the SOF-001 baseline and all planning files.
- Keep Phaser, DOM UI, Convex, and later provider integrations separated.
- Render only a minimal solid-color foundation scene; do not add gameplay or art.
- Add no World, ENS, Foundry, The Graph, authentication, or wallet integration.
- Make missing Convex browser configuration safe and visible.
- Keep secrets out of tracked files and request approval before committing.

## Done When

- Dependencies install with a locked pnpm graph.
- The Phaser canvas and DOM status shell render.
- A configured Convex health query connects in realtime.
- Lint, typecheck, tests, formatting check, and production build pass.
- CI and exact local setup instructions are present.
