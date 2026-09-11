# Startup on Fire — Architecture

Status: core development through SOF-016. This describes the implemented plaza, protected quest/backend contract, earned public-fuel interface, and the boundaries later features must preserve.

## SOF-005 playable plaza

- `PreloadScene` reads the runtime manifest and loads separately addressable PNGs before entering the plaza.
- `PlazaScene` coordinates rendering, Arcade collision, camera follow, proximity, onboarding, founder interactions, and fire presentation. Static layout constants and terrain selection remain in a pure world module.
- `BugSquashScene` owns timed canvas behavior, bug lifecycle, input, and visual feedback. Through a typed adapter it opens a protected attempt, records each accepted hit, and requests server-derived completion without importing Convex APIs.
- `QuestSession` owns only in-memory onboarding and Practice Spark presentation across Phaser scene transitions. Convex owns protected quest completion and all public-fire eligibility.
- `DigitalInput` unifies touch state without coupling DOM buttons to Phaser internals.
- `GameUiBridge` publishes small typed proximity, dialogue, and discovery snapshots from Phaser to the DOM shell.
- The world is 576×352 (36×22 16-pixel tiles) inside the 480×270 camera, making camera follow observable while remaining compact.
- World and ENS provider UI remain outside the scene layer. Realtime/quest access enters scenes only through the typed gameplay adapter.

## Runtime boundaries

- **Phaser:** owns the world canvas, scenes, entities, animation, collision, camera, and moment-to-moment input.
- **DOM/CSS:** owns accessible overlays such as the Scout HUD, dialogue, verification, booth cards, and errors.
- **Convex:** owns sessions, booth placement state, quest completion, verification eligibility, fuel records, scores, tiers, and realtime truth.
- **Provider adapters:** isolate World and ENS APIs from scene classes and UI components.
- **Pure domain modules:** calculate deterministic rules such as fire tiers and UTC date keys without framework dependencies.

## Implemented Phase 1 shell

`src/main.ts` composes runtime configuration, the Phaser game, and the DOM status shell. `src/services/convex/client.ts` owns the browser WebSocket client, persisted opaque guest credential, typed gameplay adapter, and cleanup. `convex/booths.ts`, `convex/gameActions.ts`, and internal stores own realtime state and protected mutations; scenes never call generated Convex APIs directly.

The canvas renders at a 480×270 logical resolution using fit scaling, pixel-art filtering, and rounded pixels. This is a foundation preview, not the final plaza layout.

## SOF-016 earned public-fuel boundary

`publicFuelPanel.ts` owns the compact disclosure, status, QR/link handoff, cancellation, retry, and accepted-fuel feedback. It receives only the typed gameplay and `WorldSelfieVerifier` interfaces; it does not import IDKit, generated Convex functions, or provider proof types. `selfieVerifier.ts` owns the provider request, proof polling, session-bound server verification, and sanitized failure reduction. IDKit and its WASM are dynamically imported only after the player explicitly starts verification, so guest exploration does not pay the sponsor SDK download cost.

```text
Practice Spark + booth proximity
              |
              v
      optional DOM panel -- preflight fuel --> already verified? --> atomic fuel
              |                                      |
              +--> typed World verifier              +--> realtime booth query
                        |
          session-bound signed challenge
                        |
              World App / IDKit proof
                        |
               Convex server verify
                        |
                 atomic public fuel
```

The first fuel call is an idempotent server preflight using the same key retained through every safe retry. An already verified session can complete immediately; an unverified session enters World. Cancellation cannot create local success, and the panel never updates the fire itself—the realtime booth subscription remains authoritative.

## Data flow

```text
VITE_CONVEX_URL
      |
      v
runtime config --> Convex client --> health query subscription
      |                                  |
      v                                  v
Phaser bootstrap                   DOM status update
```

Missing or invalid public configuration leaves the game running and reports a setup state. Backend data is validated before it reaches the UI.

## Lifecycle rule

Every subscription, listener, timer, tween, and external client must return or register a cleanup path. The current shell disconnects Convex and destroys Phaser during page unload.

## Sponsor and gameplay World boundaries

The retained development spike is no longer the only World surface. The normal route now composes the earned-fuel panel, while provider code remains outside Phaser and appears only after quest completion plus booth proximity. The browser requests an RP context from `convex/worldActions.ts`; the signing key never leaves Convex. IDKit returns a legacy Selfie Check payload to memory, which the browser passes to a Convex action. That action enforces the configured action, environment, session-derived signal hash, single selfie response, and nullifier shape before forwarding the payload to World’s verifier. Only a canonical decimal action/nullifier plus its guest-session binding is stored, through one atomic Convex mutation.

```text
development-only DOM -> Convex RP signature -> IDKit / World App
          |                                      |
          +---- typed proof -> Convex action ----+
                                  |
                         World server verifier
                                  |
                       atomic nullifier consume
```

The ENS experiment is a local TypeScript script, not browser or gameplay code. viem selects the Universal Resolver for reads. The Sepolia write script discovers the configured resolver immediately before the authorized write and again before the simulated unauthorized write; it never pins a Universal Resolver or implementation-resolver address.
