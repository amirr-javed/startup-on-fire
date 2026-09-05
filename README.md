# Startup on Fire

Startup on Fire is an ETHOnline 2026 vertical slice: a cozy pixel city where players discover startup booths, complete a short quest, and give bot-resistant community support represented by a growing bonfire.

> Fire is earned, never bought.

## Current status

The core route now renders a playable greybox plaza with movement, camera follow, collision, three booth interactions, original runtime assets, and the existing Convex health connection. World and ENS feasibility code is retained for later but disabled or offline; GitHub publishing and Vercel deployment are deferred.

## Requirements

- Node.js 22.12 or newer (CI uses 22.20.0)
- pnpm 10.18.3 or newer
- A Convex account for the optional realtime development connection

## Local setup

```bash
pnpm install
pnpm convex:once
pnpm dev
```

`pnpm convex:once` opens the Convex login/configuration flow on first use and writes the real deployment values to the ignored `.env.local`. Do not copy the placeholder URL over that generated file and do not commit it.

Open the URL printed by Vite. Without `VITE_CONVEX_URL`, the canvas still loads and the compact status panel reports that backend setup is pending.

## Plaza controls

- Move with arrow keys or WASD.
- Interact near a booth with E or the contextual button.
- Close the founder introduction with Escape or Continue.
- Landscape touch devices receive a four-direction control pad with 44 px targets.

The current core slice is a guest-accessible greybox plaza. World, ENS, public deployment, fuel, quests, and the minigame remain deferred.

## Runtime assets

```bash
pnpm assets:generate
pnpm assets:validate
```

The generator produces the versioned Phase 2 pixel batch and `public/assets/manifest.json`. See `docs/assets.md` and `docs/asset-validation.md` for provenance and validation status.

## Deferred sponsor feasibility spikes

The World browser screen and server actions are disabled while the core product is built. Re-enabling them later requires an explicit code decision plus `WORLD_SPIKE_ENABLED=true`; do not enable the flag during core development. The retained configuration procedure is:

```bash
pnpm convex env set WORLD_APP_ID app_your_app_id
pnpm convex env set WORLD_RP_ID rp_your_rp_id
pnpm convex env set WORLD_ACTION startup-on-fire-phase-1
pnpm convex env set WORLD_ENVIRONMENT production
pnpm convex env set WORLD_RP_SIGNING_KEY
pnpm convex env set WORLD_SPIKE_ENABLED true
pnpm convex:once
```

Enter the signing key only at the Convex prompt. Never put it in `.env.local`, browser configuration, logs, or Git. A real Sandbox app uses `production`; use `staging` only with World’s simulator. The spike requests `selfieCheckLegacy`, verifies the returned payload server-side, and persists only the stable action/nullifier pair needed to reject replay.

The ENS scripts are offline developer tools and are not loaded by the game. They are also deferred. When sponsor work resumes, the read-only checks can be run with:

```bash
pnpm spike:ens:read
```

For the Sepolia permission experiment, add `ENS_TEST_NAME`, optional `SEPOLIA_RPC_URL`, and `ENS_TEST_OWNER_PRIVATE_KEY` to the ignored `.env.local`, then run `pnpm spike:ens:write`. Use only a disposable, low-value account that owns or controls the test name. The script fresh-resolves the name’s resolver, writes a timestamped text record, confirms resolution, and proves a random outsider cannot write the same record.

See `docs/sponsor-spikes.md` for evidence status, privacy limits, and provider caveats.

## Commands

```bash
pnpm dev          # Run the Vite frontend
pnpm dev:convex   # Run the Convex development watcher
pnpm convex:once  # Configure/push Convex once, then exit
pnpm assets:generate # Rebuild the deterministic greybox PNG batch
pnpm assets:validate # Validate dimensions, RGBA, frames, and hashes
pnpm spike:ens:read  # Check Universal Resolver and CCIP-Read support
pnpm spike:ens:write # Run the gated Sepolia permission experiment
pnpm lint         # Run ESLint
pnpm typecheck    # Run strict TypeScript checks
pnpm test         # Run Vitest once
pnpm build        # Typecheck and create the production bundle
```

## Architecture

- Phaser owns the world canvas and moment-to-moment game behavior.
- Small typed DOM modules own overlays, status, dialogue, and later verification UI.
- Convex owns server-authoritative and realtime state.
- External providers remain behind typed service boundaries.

See `docs/architecture.md` and `docs/scope.md` for the Phase 1 boundaries.

## Secrets

Only placeholder public configuration belongs in `.env.example`. Never commit `.env.local`, private keys, provider signing keys, raw World proof payloads, or personal information.
