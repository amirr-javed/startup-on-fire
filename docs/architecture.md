# Startup on Fire — Architecture

Status: core development through SOF-019. This describes the launch/loading boundary, implemented plaza, protected quest/backend contract, earned public-fuel interface, read-only ENS identity, and the boundaries later features must preserve.

## SOF-005 playable plaza

- `PreloadScene` reads the runtime manifest and loads separately addressable PNGs before entering the plaza.
- `PlazaScene` coordinates rendering, Arcade collision, camera follow, proximity, onboarding, founder interactions, and fire presentation. Static layout constants and terrain selection remain in a pure world module.
- `BugSquashScene` owns timed canvas behavior, bug lifecycle, input, and visual feedback. Through a typed adapter it opens a protected attempt, records each accepted hit, and requests server-derived completion without importing Convex APIs.
- `QuestSession` owns only in-memory onboarding and Practice Spark presentation across Phaser scene transitions. Convex owns protected quest completion and all public-fire eligibility.
- `DigitalInput` unifies touch state without coupling DOM buttons to Phaser internals.
- `GameUiBridge` publishes small typed proximity, dialogue, and discovery snapshots from Phaser to the DOM shell.
- The world is 576×352 (36×22 16-pixel tiles) inside the 480×270 camera, making camera follow observable while remaining compact.
- World provider UI remains outside the scene layer. Realtime/quest access and sanitized ENS identity enter scenes only through typed adapters.

## Runtime boundaries

- **Phaser:** owns the world canvas, scenes, entities, animation, collision, camera, and moment-to-moment input.
- **DOM/CSS:** owns accessible overlays such as the Scout HUD, dialogue, verification, booth cards, and errors.
- **Convex:** owns sessions, booth placement state, quest completion, verification eligibility, fuel records, scores, tiers, and realtime truth.
- **Provider adapters:** isolate World and ENS APIs from scene classes and UI components.
- **Pure domain modules:** calculate deterministic rules such as fire tiers and UTC date keys without framework dependencies.

## SOF-018 launch/loading boundary

`index.html` contains semantic fallback loading markup, while `base.css` and `launch.css` are discovered independently of the game script. `GameLoadBridge` then carries actual Phaser manifest/asset progress into `launchScreen.ts`, which takes over the same first-run DOM surface. The canvas and normal game UI remain inert until assets are ready and the player explicitly enters; focus then moves to Ember’s first onboarding action. The screen reserves stable status space, uses a native progress element, and provides an inline reload action when loading fails.

```text
manifest load --> validated asset list --> Phaser progress --> DOM launch status
      |                    |                       |
      +-- invalid ---------+-- file error --------+--> retry screen
                                                      |
ready plaza + player entry --------------------------> focus onboarding
```

The pure manifest guard rejects empty/duplicate IDs, non-local asset URLs, and incomplete or non-positive sprite frame dimensions before Phaser consumes them.

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

## SOF-017 ENSv2 identity boundary

`boothResolver.ts` lazily creates a Sepolia viem client and resolves normalized booth names without hardcoding a Universal Resolver or implementation resolver. `boothDirectory.ts` wraps the realtime Convex booth subscription, immediately emits its static data, then merges each independently resolved identity. Provider failures and missing records remain display states, not gameplay failures.

```text
Convex booth + ensName --> immediate static booth --> Phaser/dialogue
              |                                  ^
              +--> typed Sepolia resolver -------+
                    bounded text / HTTPS / address
```

The resolver deduplicates in-flight reads, caches successful/missing results for five minutes and failures for 30 seconds, and discards stale subscription results. The optional `VITE_SEPOLIA_RPC_URL` selects public browser transport only; no secret or write authority belongs in browser configuration.

## SOF-019 compatibility and practice fallback

`health.status` publishes a literal game API version in addition to transport health. The browser enables protected gameplay actions only after that exact contract is observed; an older deployment may continue supplying booth data, but it cannot trigger calls to missing quest functions or claim complete readiness.

If protected quest preparation, hit recording, or completion fails, Bug Squash offers a clean local Practice round. `QuestSession` retains whether the completion was local or server-saved. The local route can award and animate only a Practice Spark; the World/public-fuel offer requires server-saved provenance. Partially recorded protected runs are never converted into local public eligibility.

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

The ENS permission experiment remains a local TypeScript write script. Runtime gameplay performs read-only Sepolia enrichment through its typed resolver. Both paths rely on viem’s chain-aware resolution and never pin a Universal Resolver or implementation-resolver address; the write script still discovers the configured resolver immediately before each separately authorized permission test.
