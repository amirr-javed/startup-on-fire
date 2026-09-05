# Startup on Fire — AI Usage

This document records material AI assistance for hackathon transparency. It does not imply that generated suggestions were accepted without human review.

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
