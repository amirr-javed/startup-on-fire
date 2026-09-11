# Startup on Fire — AI Usage

## SOF-018 — 2026-09-12

- **Tools:** OpenAI Codex, the frontend quality/craft guidelines, local Vitest/TypeScript/ESLint/build tooling, and controlled Windows browser inspection.
- **Purpose:** Complete the missing P0 landing/loading experience at production-minded visual and accessibility quality.
- **Changes assisted:** Immediate pre-script fallback markup/styles, actual Phaser loader progress, terminal state control, defensive manifest validation, a branded guest entry screen, inert/focus lifecycle, retry UI, responsive CSS, automated tests, development/production visual checks, and project tracking.
- **Human decision:** Continue implementing the agreed P0 priorities with high quality and focused commits.
- **Limitations disclosed:** Browser testing used local Vite and emulated viewports, not a physical touch device or deployed production URL. No provider, deployment, chain, or secret action was performed.

## SOF-017 — 2026-09-12

- **Tools:** OpenAI Codex, official ENS developer documentation, official viem documentation, local automated tests, and production build tooling.
- **Purpose:** Add player-visible read-only ENSv2 booth identity while preserving a reliable guest experience.
- **Changes assisted:** Typed ENS resolver/directory adapters, input validation, cache and stale-result lifecycle behavior, Phaser-to-DOM identity flow, safe external link rendering, focused tests, configuration, and documentation.
- **Human decision:** Continue the reviewed P0 priorities with high quality and commit every focused change.
- **Limitations disclosed:** Codex did not register a name, write a record, use a private key, deploy the app/backend, or prove that the placeholder `firecity.eth` names resolve. Runtime identity falls back honestly until those account-backed steps are completed.

This document records material AI assistance for hackathon transparency. It does not imply that generated suggestions were accepted without human review.

## SOF-016 — 2026-09-12

- **Tools:** OpenAI Codex, frontend interaction/craft guidance, TypeScript, Vitest, jsdom, and local browser inspection.
- **Purpose:** Implement the next P0 priority: an honest, optional player-facing World verification and public-fuel flow.
- **Changes assisted:** Separated provider behavior into a typed World adapter, mounted the earned-fuel panel on the normal route, preserved one idempotency key across retries, added cancellation/focus/live-region states, lazy-loaded IDKit and QR generation, aligned World result types, added five DOM interaction tests, and updated integration documentation.
- **Human decision:** Continue prioritized work at a high quality bar and commit/track small changes. No Convex deployment or provider credential installation was authorized in this task.
- **Validation:** Lint, strict typecheck, 49 tests, production build, and isolated responsive browser checks passed. A real game walkthrough stopped safely at the quest synchronization error because the final backend actions are not deployed.
- **Limitations disclosed:** No real Selfie Check, provider replay, accepted public fuel, multi-client fire update, Convex deployment, physical-device test, or production deployment is claimed.

## SOF-015 — 2026-09-11

- **Tools:** OpenAI Codex, the installed Convex design/expert guidance, a delegated Convex backend specialist, `convex-test`, TypeScript, Vitest, and local browser interaction.
- **Purpose:** Implement the second reviewed priority: server-authoritative quest and community-fire truth with an honest client boundary.
- **Changes assisted:** Fixed booth data/realtime query, hashed guest sessions, server-recorded quest hits and completion, session-derived World proof signals, action-scoped World binding, atomic/idempotent daily fuel limits, focused concurrency tests, persisted browser session adapter, protected minigame states, realtime fire rendering, validation, and documentation.
- **Human decision:** Continue the reviewed priorities in order at a high quality bar. No commit or deployment permission was granted.
- **Important external-state disclosure:** A Convex code-generation command unexpectedly reported uploading functions to the configured development deployment. No later Convex CLI or deployment command was run. The final SOF-015 public actions were not present during browser validation, so final deployment and server-success browser evidence remain pending.
- **Limitations disclosed:** Correctly spaced quest-hit requests can still be automated by a modified client; World is the intended public-fuel human-eligibility boundary. No real Selfie Check, public fuel, multi-client browser run, ENS runtime identity, physical-device pass, or public deployment is claimed.

## SOF-014 — 2026-09-11

- **Tools:** OpenAI Codex, local browser interaction, Phaser, TypeScript, and Vitest.
- **Purpose:** Implement the highest-priority complete first-player loop at production-minded quality.
- **Changes assisted:** Ember onboarding, objective guidance, unique founder copy, typed quest progression, the Bug Squash scene, pointer/keyboard/DOM controls, success/failure/retry states, Practice Spark feedback, responsive/focus/reduced-motion polish, tests, and documentation.
- **Human decision:** Build the previously reviewed priorities in order and favor high quality.
- **Limitations disclosed:** The Practice Spark is local-only and is not verified fuel. World, server-authoritative fuel limits/realtime score, ENS runtime identity, physical-device testing, and public deployment remain pending.

## SOF-013 — 2026-09-11

- **Tools:** OpenAI Codex, built-in OpenAI image generation, exact local export tooling, and live browser inspection.
- **Purpose:** Create the complete original runtime asset inventory without Kenney Tiny Farm or another third-party game pack.
- **Image work:** 21 distinct generation calls covered terrain, three booths, Scout walking, four NPCs, six environmental props, Cold/Hot/Blazing fires, a shared pit, and two Bug Squash sheets. One terrain correction was retained but rejected because it baked a checkerboard and lost alpha.
- **Code/documentation:** Codex created the reproducible exact-size exporter, manifest integration, Phaser terrain/character/fire/prop integration, updated tests, provenance, validation evidence, prompt archive, and change tracking.
- **Human decision:** The builder explicitly requested image generation for all assets and prohibited Kenney Tiny Farm.
- **Limitations:** Raw model outputs required mechanical cropping, nearest-neighbour downscaling, padding, and sheet assembly. The final exact PNGs passed structural and live-scene validation, but physical-device testing and frame-by-frame continuity capture remain pending.

## SOF-012 — 2026-09-11

- **Tools:** OpenAI Codex and local browser inspection.
- **Purpose:** Remove the temporarily integrated Kenney Tiny Farm pack and restore the builder's original runtime artwork.
- **Changes assisted:** Removal of source/runtime Kenney files, manifest and Phaser cleanup, regenerated runtime inventory, validation, and documentation.
- **Human decision:** Use only the original supplied terrain, Scout, booths, founders, and fountain assets.

## SOF-010 — 2026-09-11

- **Tools:** OpenAI Codex and local browser inspection.
- **Purpose:** Integrate the builder-supplied Kenney Tiny Farm asset pack as playable plaza artwork.
- **Changes assisted:** Phaser spritesheet-spacing support, deterministic runtime copying, indexed-PNG/transparency validation, map composition, provenance, license attribution, and visual validation.
- **Limitation:** Codex did not generate the Kenney asset pack; the existing game keeps its distinct booth and character assets until a later cohesive art pass.

## SOF-009 — 2026-09-11

- **Tools:** OpenAI Codex and local browser inspection.
- **Purpose:** Diagnose and repair a plaza-ground composition regression after the supplied terrain integration.
- **Changes assisted:** Kept the builder-supplied terrain active, added its missing typed path composition and a small landscape decoration pass, and made the page background blend with the 16:9 game canvas.
- **Limitation:** Codex did not generate or alter any source/runtime art file in this task; the result remains an in-engine composition pass pending a later final art pass.

## SOF-008 — 2026-09-10

- **Tools:** OpenAI Codex and local browser inspection.
- **Purpose:** Validate, preserve, and integrate builder-provided terrain tiles and eight-direction Scout idle poses; launch the local development server.
- **Changes assisted:** Runtime copies/trimmed derivatives, manifest registration and hashes, Phaser ground composition/directional sprite selection, expanded world placement, validation, documentation, and local server verification.
- **Limitation:** Codex did not generate the supplied art. It removed only supplied white export borders in derived runtime tiles and documented the remaining subtle source-tile tone join.

## SOF-007 — 2026-09-05

- **Tools:** OpenAI Codex and built-in OpenAI image generation.
- **Purpose:** Convert the builder-supplied composite into separately addressable transparent game textures and integrate them without discarding the validated v001 fallback pack.
- **Image work:** Eight background-extraction edit calls for three booths, fountain, Scout, and three founders. The full prompts are archived in `docs/prompts/SOF-007-integrate-supplied-assets.md`.
- **Code/documentation:** Manifest registration, Phaser texture/display updates, HUD portrait, tests, provenance, validation, and change tracking.
- **Limitations:** AI-extracted images remain large and are not represented as exact 16×16/16×32 production exports.

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
