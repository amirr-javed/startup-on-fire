# Startup on Fire

Startup on Fire is an ETHOnline 2026 vertical slice: a cozy pixel city where players discover startup booths, complete a short quest, and give bot-resistant community support represented by a growing bonfire.

> Fire is earned, never bought.

## Current status

Phase 1 foundation. The repository currently renders a minimal Phaser canvas and can connect to a Convex health query. Plaza gameplay, art assets, fuel rules, World verification, and ENS booth identity are not implemented yet.

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

## Commands

```bash
pnpm dev          # Run the Vite frontend
pnpm dev:convex   # Run the Convex development watcher
pnpm convex:once  # Configure/push Convex once, then exit
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
