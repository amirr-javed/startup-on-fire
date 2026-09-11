# World Selfie Check Integration Feedback

Status: preliminary integration feedback after gameplay UI integration; the account-backed Sandbox flow is still pending.

- The vanilla `@worldcoin/idkit-core` 4.x builder cleanly separates the browser request from server-side RP signing.
- `selfieCheckLegacy` is explicit, but the interaction between a real Sandbox app and the SDK’s `production` environment is easy to misread; a prominent Sandbox-versus-simulator note near the preset example would reduce setup errors.
- The typed completion result makes cancellation and provider rejection straightforward to handle without exposing proof details.
- The verifier accepts the IDKit result as-is, which reduces fragile field remapping. A small canonical example of the successful verifier response for Selfie Check would make safe nullifier extraction clearer.
- The SDK normalizes the legacy Face identifier to `selfie`, but that compatibility detail is not obvious from the high-level credential description.
- The connector flow benefits from a first-class progress contract (handoff, polling, verification) so non-React games can keep provider behavior outside their UI components. A concise vanilla TypeScript example would reduce integration work.
- IDKit’s WASM is large enough that examples should emphasize dynamic import for optional checks; Startup on Fire keeps the SDK outside the guest-play startup path.

This feedback will be revised after the required real success and replay/rejection attempts. No claim about camera UX, completion latency, Sandbox availability, or provider error quality is made before those attempts occur.
