# SOF-018 — Fire City launch/loading screen

## Builder request

Continue working through the priorities with high quality. Complete and validate each task, commit focused changes, and track every small change.

## Implemented interpretation

Complete the missing P0 landing/loading experience before deployment work. Give players a clear first impression and honest loader feedback while preserving guest access and keeping deployment/provider actions out of scope.

## Constraints

- Drive percentage and terminal states from actual Phaser loader events, never a cosmetic timer.
- Render useful semantic fallback markup and critical CSS before the game script executes.
- Keep the surface in DOM/CSS and the asset loader in Phaser behind a typed state bridge.
- Preserve the approved pixel-campus palette, minimal hierarchy, and “Fire is earned, never bought” rule.
- Clearly state that guest play requires no wallet.
- Use a real button with a 44px target and visible focus; prevent behind-screen controls from entering the Tab order.
- Provide loading, ready/success, and recoverable error states without layout shift.
- Respect reduced motion by using no landing entrance animation.
- Validate untrusted manifest shape before loading assets.
- Test state transitions, manifest failures, retry, entry, inert behavior, and focus handoff.
- Verify desktop, landscape, and portrait layouts in the real local game.
- Update tracking and create one local SOF-018 commit. Do not push or deploy.

## Done when

- A player sees truthful progress, an explicit ready action, and clear guest/no-wallet copy.
- Asset failures provide a retry rather than a blank canvas or uncaught manifest error.
- Entry reveals the plaza and moves focus into onboarding.
- Asset validation, lint, strict typecheck, full tests, build, and responsive browser checks pass.
