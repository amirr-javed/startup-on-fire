# Startup on Fire — Change Log

This records planning revisions. It is not evidence that the game, Git repository, sponsor integrations, or runtime assets are implemented. Repository task IDs start at SOF-001 during Git initialization; planning changes use DOC identifiers.

## SOF-017 — September 12, 2026 — Runtime ENSv2 booth identity

Added a read-only Sepolia ENSv2 identity adapter and realtime booth directory. Founder dialogue now displays validated ENS names, startup/founder text records, descriptions, and HTTPS links when present while preserving immediate static fallbacks during missing, invalid, or unavailable provider states. Automated resolver, cache, lifecycle, content, and DOM tests pass; the placeholder booth names still need registration/records and account-backed validation.

## SOF-016 — September 12, 2026 — Earned public-fuel interface

Mounted the optional World Selfie Check flow after the Kindred Labs Practice Spark, behind a typed provider adapter. The compact panel preserves guest play, keeps one idempotency key across safe retries, supports cancellation and keyboard dismissal, lazy-loads World/QR code, and converts a spark into public fuel only after server verification. Five DOM interaction tests and desktop/mobile visual checks pass; real World completion and final Convex deployment remain pending.

## SOF-015 — September 11, 2026 — Authoritative quest and fire backend

Added fixed realtime booth state, hashed guest sessions, server-recorded Bug Squash hits, server-derived quest completion, action-scoped World binding, and atomic/idempotent public-fuel limits. The client now persists its opaque guest session, uses the protected quest contract, renders realtime fire tiers, and exposes recoverable synchronization states. Provider-backed World completion, final backend deployment, and public fuel UI remain pending.

## SOF-014 — September 11, 2026 — Guided first quest and Bug Squash

Added Ember’s two-step first-run introduction, a clear first objective, distinct founder stories, and a complete Kindred Labs discovery quest. The new Bug Squash scene supports pointer, touch-sized DOM controls, and keyboard play; success earns an explicitly local Practice Spark that visibly grows Kindred’s fire without claiming public verified fuel.

## SOF-013 — September 11, 2026 — Complete original runtime asset pack

Generated, exported, registered, and visually integrated 21 original RGBA runtime PNGs: terrain, three booths, Scout walk sheet, four NPCs, six props, three fire tiers with shared pit, and Bug Squash sprites. The live plaza now uses this pack exclusively; no Kenney asset is present or loaded.

## SOF-012 — September 11, 2026 — Original assets restored

Removed the Kenney Tiny Farm source and runtime pack at the builder's request. The live plaza again uses only the builder-supplied grass terrain and Scout plus the existing booth, founder, and fountain artwork.

## SOF-009 — September 11, 2026 — Tile plaza background restored

Retained the builder-supplied 4×4 terrain field as the active ground and overlaid its intended crisp 16×16 paths. Expanded garden decoration and made letterboxed space blend with the landscape. No source or runtime art file was removed or replaced.

## SOF-008 — September 10, 2026 — Supplied terrain and Scout integrated

Registered the supplied 4×4 terrain field and eight-direction Scout idle set as runtime assets. The field now drives the larger plaza ground and the Scout changes pose by movement direction. Source images are retained, and runtime derivatives remove the supplied white export margins.

## SOF-007 — September 5, 2026 — Supplied artwork integrated

Extracted the three booths, fountain, Scout portrait, and three founders from the builder-supplied reference into separate transparent v002 assets. Registered the outputs alongside the deterministic fallback pack and switched the live plaza to the richer textures.

## SOF-006 — September 5, 2026 — GitHub checkpoints published

Split the accumulated work into focused sponsor-feasibility, core-first, runtime-asset, playable-plaza, and documentation commits, then published `main` to the builder-supplied GitHub repository. Vercel and sponsor activation remain deferred.

## SOF-005 — September 5, 2026 — Playable greybox plaza and assets

Added a 36×22-tile plaza with keyboard/touch movement, camera follow, collision, three booths/founders, a fountain, and contextual interactions. Added 14 original exact-size runtime PNGs, a hashed manifest, deterministic generation/validation scripts, provenance, and validation records. Sponsor, deployment, fuel, quest, fire, and minigame behavior remains deferred.

## SOF-004 — September 5, 2026 — Core-first sequencing adopted

Prioritized the playable core product ahead of sponsor and publishing work. The existing World browser entry point is removed and its server actions require an explicit disabled-by-default flag; ENS remains offline tooling. The provided GitHub repository is recorded locally without pushing, and Vercel remains deferred.

## SOF-003 — September 5, 2026 — Sponsor feasibility harnesses in progress

Added an isolated IDKit 4.x Selfie Check screen, Convex RP signing/proof forwarding, atomic minimal nullifier storage, ENSv2 readiness and Sepolia permission scripts, and focused tests/documentation. Universal Resolver and CCIP-Read readiness checks pass. World account-backed success/replay and ENS Sepolia write/revert evidence remain pending and are not claimed complete.

## SOF-002 — September 5, 2026 — Application foundation prepared

Added the single-package Vite and strict TypeScript foundation, Phaser 3 pixel-rendering shell, compact DOM status overlay, Convex health subscription, unit tests, linting/formatting configuration, CI, architecture and scope documentation, and exact local setup instructions. A cloud Convex development deployment was provisioned in Europe (Ireland). Local lint, typecheck, 13 tests, production build, responsive browser checks, and realtime connection checks pass. The builder approved the scaffold commit on September 5, 2026.

## SOF-001 — September 5, 2026 — Git baseline prepared

Initialized the local repository on `main`, added secret-safe ignore rules, and created the detailed change, decision, prompt, and AI-usage records. The five planning files already present in the directory are preserved and disclosed as pre-existing inputs. No application, dependency, asset, sponsor integration, remote, or deployment was created. The builder approved the baseline commit on September 5, 2026.

## DOC-002 — September 5, 2026 — Git-first and real asset delivery

Requested: update the files before implementation; initialize Git first when development begins; track every change; asset requests must produce usable game assets, not one image.

| File                                 | Change                                                                                                                                 | Reason                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AGENTS.md                            | Added Git-first setup, truthful baseline, explicit staging/commit approval, task IDs, detailed change records, runtime-asset rules     | Make these mandatory in every Codex task                               |
| Startup_on_Fire_Development_Plan.md  | Added baseline gate, tracking lifecycle, document/art paths, runtime-asset workstream, schedule-status caveat                          | Put Git before scaffolding and distinguish targets from completed work |
| Startup_on_Fire_Codex_Prompt_Pack.md | Split Prompt 0 into Git setup 0A and scaffold 0B; added asset prompts and task completion audit fields                                 | Give executable, bounded instructions for the next session             |
| Game_Asset_Specification.md          | New inventory, target dimensions/grids, transparency, anchors, export metadata, revision/provenance and engine-validation requirements | Define a usable game asset pack and its acceptance criteria            |
| CHANGELOG.md                         | New planning revision record and implementation log template                                                                           | Begin readable change tracking now                                     |

Validation: all three original documents read; revision diff and cross-file requirements reviewed; Markdown structure and required-section checks performed. No runtime tests apply because this task changes documents only. Asset dimensions are proposed targets and have not been validated against a running game.

Not performed: Git initialization, commit, push, scaffolding, dependency installation, asset generation, game changes, sponsor requirement re-verification, or deployment. Previous document baseline exists as earlier saved versions, not as a newly fabricated Git history.

## Detailed implementation record template

Create docs/change-log.md during Prompt 0A. Use one entry per bounded task; update it before committing, and identify the commit through the task ID in its message.

```text
Task ID:
Date/time (actual, timezone included):
Request and acceptance criteria:
Starting repository state / unrelated work preserved:
Changed paths (added/modified/renamed/deleted):
Reason and before/after behavior:
Dependencies/configuration/data/art affected:
Validation commands and actual results:
Manual/visual evidence:
Checks not run and why:
Important failed attempts, reversions, or decisions:
AI assistance / prompt archive paths:
Risks, pending work, and rollback approach:
Commit status: pending approval (commit message must include task ID)
```

After a commit, report its hash to the user. Do not put a commit's own hash inside the files it commits. Git and human-readable logs complement each other; neither captures unsaved keystrokes. Secrets and sensitive personal/proof data must never enter this audit trail.
