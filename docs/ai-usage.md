# Startup on Fire — AI Usage

This document records material AI assistance for hackathon transparency. It does not imply that generated suggestions were accepted without human review.

## SOF-006 — 2026-09-05

- **Tool:** OpenAI Codex.
- **Purpose:** Separate accumulated work into reviewable Git checkpoints, validate the committed tree, scan staged content for secrets, and publish the builder-authorized `main` branch.
- **External action:** Pushed `main` to `https://github.com/amirr-javed/startup-on-fire.git` after confirming the remote had no branch history.
- **Excluded:** Vercel, production deployment, sponsor activation, and local assistant skill/configuration files.

## SOF-005 — 2026-09-05

- **Tools:** OpenAI Codex, OpenAI image generation, and browser-based visual inspection.
- **Purpose:** Build the first playable plaza and an original runtime-ready greybox asset batch while sponsor work remains disabled.
- **Human decision:** Move to the core-product phase and include generated assets.
- **Changes assisted:** Phaser preload/plaza scenes, movement/collision/camera, typed game/UI input bridge, accessible DOM controls and interaction surfaces, deterministic PNG generator, manifest validator, tests, provenance, validation, and task documentation.
- **Generated reference limitation:** The image-generation output had a painted background and non-runtime scale. Codex retained it only as a visual reference and created separate exact-size runtime art rather than claiming the reference was engine-ready.
- **Validation performed:** Asset dimensions/alpha/hashes/frame divisibility, lint, strict typecheck, unit tests, build, realtime browser connection, rendered plaza inspection, keyboard movement, and one booth interaction.
- **External actions excluded:** No push, public repository action, Vercel work, production deployment, sponsor flow, or blockchain transaction.

## SOF-004 — 2026-09-05

- **Tool:** OpenAI Codex with the installed Convex guidance.
- **Purpose:** Apply the builder's core-first sequencing decision, disable the retained World runtime surface, preserve offline ENS work for later, and configure the supplied GitHub URL without publishing.
- **Human decisions:** Core game before World, ENS completion, GitHub publishing, or Vercel; retain already-built feasibility work in a disabled state.
- **Changes assisted:** Runtime composition, Convex feature gate, tests, roadmap/scope/decision/changelog documentation, prompt archive, and local Git remote configuration.
- **External actions excluded:** No Git push, GitHub publication, Vercel import, production deployment, or sponsor transaction.

## SOF-003 — 2026-09-05

- **Tool:** OpenAI Codex with official World, ENS, viem, and package documentation research.
- **Purpose:** Implement and test isolated World Selfie Check and ENSv2 feasibility harnesses while enforcing server-only secrets, minimal verification persistence, and honest provider evidence.
- **Human decisions:** Use real account-backed spikes, a development-only World screen, a disposable low-value Sepolia account, and no sponsor code in gameplay.
- **Generated or modified areas:** IDKit/Convex adapter, atomic nullifier store, development DOM screen, ENS readiness and permission scripts, tests, dependencies, environment example, README, architecture/scope records, sponsor evidence, feedback, changelogs, decisions, and this disclosure.
- **Validation performed by Codex so far:** Strict typecheck, lint, 21 unit tests, production build, Convex function deployment, browser inspection of default and isolated routes, missing-configuration behavior, Universal Resolver readiness, and CCIP-Read readiness.
- **Limitations disclosed:** World success/replay and ENS Sepolia write/revert need human-owned service resources and remain pending. The first default Ethereum RPC returned HTTP 503 before a successful alternate-RPC run.

## SOF-002 — 2026-09-05

- **Tool:** OpenAI Codex, including browser-based visual inspection.
- **Purpose:** Select compatible package versions, create the Vite/Phaser/Convex application foundation, configure quality tools and CI, provision the development Convex deployment, and validate the rendered result.
- **Human decisions:** Vanilla TypeScript UI shell, Phaser 3, cloud Convex, runnable sponsor spikes after the scaffold checkpoint, and approval-gated commits.
- **Generated or modified areas:** Application source, tests, Convex health function/generated bindings, package/configuration files, CI, README, architecture/scope records, changelogs, decisions, and this disclosure.
- **Validation performed by Codex:** Lint, strict typecheck, 13 unit tests, production build, realtime health subscription, responsive desktop/landscape/portrait checks, and browser console inspection.
- **Limitations disclosed:** The Phaser bundle size warning is unresolved; CI and public deployment are untested until a remote exists; World and ENS behavior is not implemented or claimed in SOF-002.

## SOF-001 — 2026-09-05

- **Tool:** OpenAI Codex.
- **Purpose:** Inspect the selected project directory, develop the Phase 1 implementation plan, initialize the local Git repository, and prepare truthful baseline governance files.
- **Human decisions:** The builder selected the full Phase 1 foundation, vanilla TypeScript UI shell, runnable thin World and ENS spikes, account-backed setup with explicit gates, and approval before each focused commit.
- **Files generated with assistance:** `.gitignore`, `docs/change-log.md`, `docs/decisions.md`, `docs/ai-usage.md`, and `docs/prompts/SOF-001-baseline.md`.
- **Files reviewed but not authored in this task:** `AGENTS.md`, `CHANGELOG.md`, `Game_Asset_Specification.md`, `Startup_on_Fire_Codex_Prompt_Pack.md`, and `Startup_on_Fire_Development_Plan.md`.
- **Validation responsibility:** Codex reviewed repository state, staging, ignore behavior, and potential secret exposure. The human retains approval authority for the commit and all external account actions.
