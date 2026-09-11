# AGENTS.md — Startup on Fire

## Mission

Build the ETHOnline 2026 vertical slice of Startup on Fire: a cozy pixel city where players discover startup booths, complete a short quest, and give bot-resistant community support represented by a growing bonfire.

The product rule is: **Fire is earned, never bought.**

## Read First

Before changing code, read:

1. `Startup_on_Fire_Development_Plan.md`
2. Relevant files under `docs/`
3. Tests for the subsystem being changed
4. `Game_Asset_Specification.md` for any asset task
5. `CHANGELOG.md` and `docs/change-log.md` when present

For a complex or cross-cutting task, inspect first and present a short plan before editing.

## Git First and Complete Change Tracking

- Before scaffolding or asset generation, confirm the intended project directory and inspect whether it is already inside a Git repository. Never initialize the scratch/workspace root accidentally or nest a repository inside another.
- For a genuinely new project, initialize Git with `git init -b main`, add a secret-safe `.gitignore`, copy the approved planning files, and create an honest baseline commit after approval. Verify the configured author; ask if missing rather than inventing an identity.
- If code or assets already exist, preserve and disclose them in the baseline. Never rewrite timestamps or history to imply pre-existing work was created during the event.
- At task start inspect `git status --short` and the relevant diff; preserve unrelated user changes.
- Give every task a sequential ID, such as SOF-001. Record requested outcome, changed paths, reasons, behavior before/after, validation results, and pending work in `docs/change-log.md` in the same change set. Include additions, modifications, renames, deletions, dependencies, config, art, and documentation.
- Maintain a concise `CHANGELOG.md` and append important design/architecture decisions to `docs/decisions.md`. Archive relevant prompts in `docs/prompts/` and record AI assistance in `docs/ai-usage.md`.
- Before committing inspect the diff and staged diff, check for secrets, and stage only explicit task-owned paths. Request approval for each focused commit unless the user grants standing commit permission.
- Include the task ID in the commit message. Report commit hash and status when committed; otherwise clearly report uncommitted work. The task's commit maps to its log entry through the ID; do not attempt to embed a commit's own hash inside itself.
- Git records saved checkpoints, not every keystroke. Never claim unsaved edits or uncommitted binary revisions are recoverable. Retain intentional asset revisions until approved for removal.
- Do not push, publish, force-push, squash, amend, delete branches, or rewrite history without the relevant explicit authorization. Use a new corrective commit for normal fixes.

## Game Assets Mean Runtime Assets

- A request to generate assets means a usable set of separately addressable game assets, not one full-scene illustration or a decorative collage.
- Follow `Game_Asset_Specification.md`: tiles, isolated props/buildings, character animation sheets, fire sheets, minigame sprites, and metadata. Generate in coherent batches and report incomplete assets honestly.
- Concept art is a style reference only. Do not bake characters, fire, text, HUD, or collision-dependent props into the map background.
- Validate pixel dimensions, alpha, frame grid, anchors, animation continuity, seams, and Phaser loading before marking runtime assets ready. Generated art often needs cleanup; do not claim it is engine-ready without those checks.
- Keep source/revisions, final exports, manifests, generation prompts, provenance, and validation evidence. Never silently replace approved art or use a concept screenshot as the finished asset pack.

## Locked Scope

Required:

- One compact plaza.
- Three startup booths and founder NPCs.
- Keyboard and landscape mobile movement.
- One Bug Squash minigame.
- Cold, Hot, and Blazing fire states.
- Guest exploration.
- World Selfie Check for public-fuel eligibility.
- Server-authoritative daily limits and realtime fire.
- ENSv2 on Sepolia for booth identity and founder permissions.
- Public deployment, tests, documentation, and demo.

Do not add unless explicitly requested:

- Directory/search panel.
- Founder submission/dashboard/admin systems.
- More minigames or districts.
- Coins, inventory, cosmetics, stickers, pets, housing, chat, or day/night cycle.
- NFTs, tokens, swaps, DeFi, investments, or pay-to-fuel mechanics.
- The Graph integration before the core P0 path is stable.
- Any new sponsor integration.

## Approved Design

- Hybrid modern startup campus and cozy market town.
- Bright top-down 16-bit-style pixel art.
- 16×16 tile basis; characters approximately 16×32.
- Integer scaling, nearest-neighbour filtering, `pixelArt: true`, and rounded pixels.
- Minimal Scout HUD.
- Landscape-first responsive game.
- Bonfires are the main visual hierarchy.
- No permanent large overlay or list.
- Palette: grass, cream, wood, charcoal, ember orange, flame yellow, limited tech blue. Avoid purple.
- UI should remain compact and keep the world visible.
- Use only original or correctly licensed assets; maintain license attribution.

## Architecture Boundaries

- Phaser renders the world and moment-to-moment game behavior.
- DOM/CSS renders dialogue, HUD, verification, cards, and errors.
- Convex owns sessions, fuels, score, tier, quest state, and realtime truth.
- World adapter owns provider-specific proof flow; verification is server-side.
- ENS adapter owns ENSv2 reads/writes and Sepolia configuration.
- Pure modules own deterministic calculations such as tiers and UTC keys.
- Scene classes coordinate systems; they must not contain provider or database logic.
- External providers must be behind typed interfaces so they can be tested.

## Security Invariants

- Never trust client-provided score, tier, limits, verification state, or timestamps.
- Server derives the UTC date key.
- Maximum three fuels per verified human per UTC day.
- Maximum one fuel per booth per verified human per UTC day.
- Fuel mutation is atomic and idempotent.
- World proof is validated server-side using current official guidance.
- Persist only the minimum pseudonymous verification value required for abuse prevention.
- Never store selfie images.
- Never commit or log secrets, private keys, raw sensitive proof payloads, or personal information.
- Ordinary players do not need a wallet to explore or play.
- Fire cannot be purchased or affected by sponsorship.

## Engineering Rules

- TypeScript strict mode.
- Prefer small typed modules over large scene files.
- Avoid `any`; explain unavoidable exceptions.
- Do not duplicate domain constants.
- Validate external and client inputs at trust boundaries.
- Handle provider timeouts and failures explicitly.
- Clean up Phaser listeners, timers, tweens, and DOM subscriptions on shutdown.
- Do not add production dependencies without explaining the need and tradeoff.
- Do not refactor unrelated files during a feature task.
- Preserve the public API of unaffected modules.
- Keep accessible keyboard controls and touch targets.
- Optimize for lower-powered devices and slow connections.

## Expected Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the repository differs, update this file and README together.

## Definition of Done for Every Task

- Requested behavior works.
- Relevant tests are added or updated.
- Lint, typecheck, tests, and production build pass.
- Provider/deployment behavior is manually checked where relevant.
- Diff contains no unrelated changes.
- Documentation and `.env.example` are updated when behavior/config changes.
- AI assistance is appended to `docs/ai-usage.md`.
- Codex reviews the final diff and reports remaining risks.
- Create one focused Git commit after human approval.

## AI and Hackathon Transparency

- Record Codex-assisted tasks, important prompts, generated files, and human decisions in `docs/ai-usage.md`.
- Preserve relevant planning/specification prompts under `docs/prompts/`.
- Never describe unimplemented or mocked sponsor behavior as complete.
- Clearly distinguish placeholders, Sandbox behavior, testnet behavior, and production behavior.
- Commit regularly; avoid a single large final commit.

## Task Interaction Pattern

Every implementation request should provide:

- Goal
- Context/files
- Constraints
- Done When

For ambiguous requirements, ask before choosing a direction that affects product behavior, sponsor eligibility, privacy, or architecture.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
