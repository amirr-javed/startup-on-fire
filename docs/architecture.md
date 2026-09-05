# Startup on Fire — Architecture

Status: Phase 1 foundation. This describes both the implemented shell and the boundaries later features must preserve.

## Runtime boundaries

- **Phaser:** owns the world canvas, scenes, entities, animation, collision, camera, and moment-to-moment input.
- **DOM/CSS:** owns accessible overlays such as the Scout HUD, dialogue, verification, booth cards, and errors.
- **Convex:** owns sessions, booth placement state, quest completion, verification eligibility, fuel records, scores, tiers, and realtime truth.
- **Provider adapters:** isolate World and ENS APIs from scene classes and UI components.
- **Pure domain modules:** calculate deterministic rules such as fire tiers and UTC date keys without framework dependencies.

## Implemented Phase 1 shell

`src/main.ts` composes three independent pieces: runtime configuration, the Phaser game, and the DOM status shell. `src/services/convex/client.ts` owns the browser WebSocket client and its cleanup. `convex/health.ts` is the only backend function at this checkpoint.

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
