# Startup on Fire — Architecture

Status: core development through SOF-005. This describes the implemented shell/plaza and the boundaries later features must preserve.

## SOF-005 playable plaza

- `PreloadScene` reads the runtime manifest and loads separately addressable PNGs before entering the plaza.
- `PlazaScene` coordinates rendering, Arcade collision, camera follow, proximity, and animation. Static layout constants and terrain selection remain in a pure world module.
- `DigitalInput` unifies touch state without coupling DOM buttons to Phaser internals.
- `GameUiBridge` publishes small typed proximity, dialogue, and discovery snapshots from Phaser to the DOM shell.
- The world is 576×352 (36×22 16-pixel tiles) inside the 480×270 camera, making camera follow observable while remaining compact.
- Sponsor adapters remain disabled and outside all scene, input, and UI paths.

## Runtime boundaries

- **Phaser:** owns the world canvas, scenes, entities, animation, collision, camera, and moment-to-moment input.
- **DOM/CSS:** owns accessible overlays such as the Scout HUD, dialogue, verification, booth cards, and errors.
- **Convex:** owns sessions, booth placement state, quest completion, verification eligibility, fuel records, scores, tiers, and realtime truth.
- **Provider adapters:** isolate World and ENS APIs from scene classes and UI components.
- **Pure domain modules:** calculate deterministic rules such as fire tiers and UTC date keys without framework dependencies.

## Implemented Phase 1 shell

`src/main.ts` composes runtime configuration, the Phaser game, and the DOM status shell. `src/services/convex/client.ts` owns the browser WebSocket client and its cleanup. `convex/health.ts` supplies the foundation health query.

The canvas renders at a 480×270 logical resolution using fit scaling, pixel-art filtering, and rounded pixels. This is a foundation preview, not the final plaza layout.

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

## Sponsor spike boundaries

The World UI is dynamically imported only when `?spike=world` is present. It does not enter Phaser, the default app path, or permanent player UI. The browser requests an RP context from `convex/worldActions.ts`; the signing key never leaves Convex. IDKit returns a legacy Selfie Check payload to memory, which the browser passes to a Convex action. That action enforces the configured action, environment, stable signal hash, single selfie response, and nullifier shape before forwarding the payload to World’s verifier. Only a canonical decimal action/nullifier pair is stored, through one atomic Convex mutation.

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
