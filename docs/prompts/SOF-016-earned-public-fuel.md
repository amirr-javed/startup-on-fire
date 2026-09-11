# SOF-016 — Earned public fuel

## Requested outcome

Continue the prioritized improvements at a high quality bar, commit regularly, and track every small change. Complete the player-facing World Selfie Check/public-fuel slice without weakening the rule that fire is earned and never bought.

## Constraints applied

- Keep guest exploration and Practice Spark available without a wallet or verification wall.
- Show public verification only after the protected Kindred Labs quest and local spark feedback.
- Keep provider/Convex details outside Phaser and outside the DOM presentation component.
- Never treat local state, client timestamps, client score, or proof submission as accepted public fuel.
- Never store or log a selfie, raw proof, signing key, or sensitive provider payload.
- Preserve one request key across safe retries, expose cancellation and recovery, and lazy-load optional provider code.
- Do not deploy Convex, configure credentials, or claim account-backed success without explicit authorization and evidence.

## Done when

- The normal route mounts a compact, accessible earned-fuel panel when backend composition is available.
- Already verified sessions can fuel without repeating World; unverified sessions require verified server acceptance before final fuel.
- Cancellation, provider/configuration failure, limits, duplicate booth fuel, expired session, retry, and success have specific copy.
- Component tests cover visibility, verified fast path, verification-before-fuel, idempotent retry, and Escape cancellation.
- Lint, typecheck, full tests, production build, responsive visual checks, documentation, secret scan, and a focused Git commit pass.
