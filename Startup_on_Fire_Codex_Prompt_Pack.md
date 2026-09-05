# Startup on Fire — OpenAI Codex Prompt Pack

Use these prompts in order. Do not give Codex the entire project as one implementation request. Attach or reference `AGENTS.md`, the development plan, and only the files relevant to the current task.

Updated September 5, 2026: start with Prompt 0A, then 0B. “Generate assets” means separate runtime files and validated animation sheets under `Game_Asset_Specification.md`, never only a concept image. All prompts inherit the Git/change-tracking rules in AGENTS.md. Do not treat dates in the plan as completed milestones.

## Codex Task Template

```text
Goal:
[One concrete outcome.]

Context:
- Read AGENTS.md.
- Read [specific relevant files].
- Current behavior: [what works now].

Constraints:
- [Architecture and scope limits.]
- Do not modify unrelated files.
- Do not add a production dependency without explaining why.

Done when:
- [Observable behavior.]
- [Tests/checks that must pass.]

Before editing:
1. Inspect the relevant repository state.
2. State a short implementation plan.
3. Identify assumptions or blockers.

Then implement, run the required checks, review the diff, and summarize:
- files changed,
- behavior implemented,
- tests run and results,
- remaining risks.
- task ID and change-log entry,
- commit hash if approved and committed, otherwise explicit uncommitted status.
```

## Prompt 0A — Initialize Git and record the baseline FIRST

```text
Goal:
Establish an honest, recoverable Git baseline before application scaffolding or asset generation.

Context:
- Read AGENTS.md, the development plan, prompt pack, Game_Asset_Specification.md, and CHANGELOG.md.
- Inspect the intended project directory, existing files, repository ancestry, and git status/history if present.
- Do not assume an empty directory or that no work has been done.

Constraints:
- If the target directory is unclear, ask for the exact project location.
- Never initialize a broad workspace root or nest a repo unintentionally.
- If no repository exists, run git init -b main in the confirmed project directory.
- Preserve an existing repo, branch, user changes, and commit history.
- Before staging create .gitignore covering node_modules, dist, caches, .env variants except .env.example, keys, and local sensitive data. Keep pnpm-lock.yaml tracked once created.
- Copy the approved planning documents into the project; do not scaffold or generate art yet.
- Create docs/change-log.md, docs/decisions.md, and docs/ai-usage.md, recording this task and the provenance of planning/reference/pre-existing files.
- Never alter dates or history to conceal pre-event work. Use actual current timestamps.
- Check Git author configuration; ask if missing, do not invent it or change global settings.
- Review and stage explicit safe paths only; ask before the first commit.
- No remote creation, push, deployment, dependency installation, or gameplay.

Done when:
- Repository location and branch are verified.
- Baseline documents and ignore rules are reviewed.
- Task SOF-001 is logged (or the next available ID if a history exists).
- With approval, create chore(SOF-001): initialize git and record planning baseline.
- Report commit hash and git status; if awaiting approval, report that the baseline is not committed and stop before Prompt 0B.
- Do not claim application checks passed: there is no app yet.
```

## Prompt 0B — Application scaffold after Git baseline

```text
We are starting a new ETHOnline 2026 project called Startup on Fire.

Goal:
Create the initial repository foundation for a browser-based Phaser game with a Convex backend.

Context:
- Read AGENTS.md and Startup_on_Fire_Development_Plan.md completely.
- Verify Prompt 0A is complete and the baseline commit exists before scaffolding.
- Inspect the actual implementation state; preserve any pre-existing work.
- It is a solo-builder hackathon project.

Constraints:
- Use TypeScript, Vite, Phaser 3, pnpm, Convex, Vitest, ESLint, and a formatter.
- Keep the repository simple; do not introduce a monorepo framework.
- Do not add World, ENS, Foundry, The Graph, art assets, authentication, or gameplay yet.
- Add `.env.example` but no secrets.
- Required commands: pnpm dev, build, lint, typecheck, and test.
- Add a basic CI workflow that runs install, lint, typecheck, test, and build.
- Maintain a clear boundary between Phaser game code, DOM UI, external services, and backend functions.

Done when:
- Dependencies install successfully.
- A minimal Phaser canvas renders a solid-color scene.
- Convex project structure exists and the client integration has a documented placeholder configuration.
- One trivial unit test passes.
- lint, typecheck, test, and build all pass.
- README contains exact local setup commands.

First inspect the environment and provide a short plan. Then implement, validate, and review the diff.
```

## Prompt 1 — Greybox plaza and player movement

```text
Goal:
Implement a greybox Fire City plaza with reliable player movement and collisions.

Context:
- Read AGENTS.md and the game architecture section of the development plan.
- Inspect all current Phaser scenes and configuration.

Constraints:
- Create BootScene, PreloadScene, and PlazaScene only.
- Use temporary geometric or clearly licensed placeholder assets.
- One central fountain landmark, three booth zones, roads, grass, and map boundaries.
- Support arrow keys and WASD.
- Use Phaser Arcade Physics only where useful.
- Enable pixelArt and roundPixels.
- Player speed must be frame-rate independent and must stop cleanly.
- Camera follows the player without jitter.
- Do not implement NPC dialogue, minigames, fuel, backend state, or sponsor integrations.
- Keep world constants and configuration outside scene classes.

Done when:
- Player can walk to all three booth zones.
- Player cannot cross collision boundaries.
- Camera behavior remains stable at map edges.
- Resizing the browser preserves a playable landscape viewport.
- unit checks, lint, typecheck, and build pass.

Plan first, then implement and verify manually where automation cannot prove game feel.
```

## Prompt 2 — Landscape mobile controls

```text
Goal:
Add accessible landscape mobile controls without breaking keyboard controls.

Context:
- Read AGENTS.md.
- Inspect PlazaScene, player controller, resize configuration, and DOM overlay.

Constraints:
- Use one virtual joystick or directional control and one contextual action button.
- Controls appear only for touch-capable/narrow viewports.
- Do not block important world content.
- Prevent browser scrolling and accidental text selection only inside the game surface.
- Respect pointer cancellation and focus loss so movement never becomes stuck.
- Do not add an external joystick package unless there is a strong, documented reason.

Done when:
- Keyboard movement remains unchanged.
- Touch movement starts, changes direction, and stops reliably.
- Action button emits a typed interaction event.
- Rotation/resizing does not duplicate controls or listeners.
- tests, lint, typecheck, and build pass.
```

## Prompt 3 — Booth proximity and dialogue

```text
Goal:
Build a reusable booth interaction and founder-dialogue system.

Context:
- Read AGENTS.md.
- Inspect PlazaScene, event types, DOM overlay, and booth configuration.

Constraints:
- Define exactly three booth configurations.
- Each booth has an ID, ENS name placeholder, position, founder name, temporary display text, and quest ID.
- Display `[E] Talk` or the touch action only when the player is inside an interaction radius.
- Use compact DOM dialogue at the bottom; keep the world visible.
- Dialogue must be driven by data, not copied scene logic.
- Prevent double-open, stale listeners, and movement during blocking dialogue.
- Do not implement search, a directory list, fuel, World, ENS resolution, or minigames.

Done when:
- Each booth opens the correct founder dialogue.
- Leaving the interaction radius removes the prompt.
- Opening and closing dialogue repeatedly does not leak listeners.
- Keyboard and touch actions both work.
- tests, lint, typecheck, and build pass.
```

## Prompt 4 — Bug Squash vertical slice

```text
Goal:
Implement one polished 30–60 second Bug Squash minigame connected to Booth 1.

Context:
- Read AGENTS.md.
- Inspect the dialogue system, scene transitions, typed events, and current test setup.

Constraints:
- Create BugSquashScene.
- Use a configuration object for duration, target score, spawn rate, and visual theme.
- Player clicks/taps bugs; valid hits add score; misses do not create duplicate state.
- Include timer, score, success, failure, retry, and return-to-plaza states.
- Return the player to the same booth context.
- Persist completion only through a clean quest-service interface; local adapter is acceptable for this task.
- Handle focus loss and scene shutdown cleanly.
- Do not add fuel or sponsor integrations.

Done when:
- Booth 1 can start the minigame.
- Success and failure are both reachable.
- Success marks the quest complete exactly once.
- Returning to the plaza restores control safely.
- tests cover scoring and completion rules.
- lint, typecheck, test, and build pass.
```

## Prompt 5 — Convex schema and realtime fire

```text
Goal:
Implement the server-authoritative realtime fire system in Convex.

Context:
- Read AGENTS.md and the backend/security sections of the development plan.
- Inspect current service adapters and Convex files.

Constraints:
- Create tables for booths, player sessions, fuels, and quest progress.
- The server derives UTC date keys and timestamps.
- Maximum three accepted fuels per verified identity per UTC day.
- Maximum one accepted fuel per booth per verified identity per UTC day.
- Require an idempotency key and enforce replay safety.
- Update score and tier atomically.
- Never accept client-provided fire score, tier, daily count, verification status, or timestamp.
- For now, use a clearly labelled development verification adapter; do not pretend it is World verification.
- Add typed success and rejection results.
- Connect PlazaScene to realtime booth/fire subscriptions.

Done when:
- Two browser sessions see a fire update without reloading.
- First valid development fuel succeeds.
- Same request replay does not increment twice.
- Second same-booth daily fuel fails.
- Fourth daily fuel fails.
- Concurrent tests cannot exceed limits.
- tests, lint, typecheck, and build pass.
```

## Prompt 6 — Fire visuals and Practice Spark

```text
Goal:
Connect authoritative fire state to polished Cold, Hot, and Blazing visuals.

Context:
- Read AGENTS.md and the approved design direction.
- Inspect current fire subscription, booth rendering, dialogue, and UI layers.

Constraints:
- Fire score comes only from the backend subscription.
- Cold, Hot, and Blazing thresholds live in one tested pure module.
- Animate transitions once when crossing a tier, not on every render.
- Add warm glow, pixel particles, and a modest NPC reaction for higher tiers.
- Add a local-only Practice Spark for an unverified player; clearly label it as not counted publicly.
- Respect reduced motion where possible.
- Do not introduce smooth/vector-looking effects inconsistent with pixel art.

Done when:
- Each tier is visually distinct at a glance.
- Realtime score updates trigger exactly one transition.
- Reconnecting does not replay old celebrations indefinitely.
- Practice Spark cannot mutate public score.
- performance, tests, lint, typecheck, and build pass.
```

## Prompt 7 — World Selfie Check integration

```text
Goal:
Replace the development verification adapter with a real World Selfie Check Sandbox integration for public fuel eligibility.

Context:
- Read AGENTS.md, World’s current official documentation, and docs/feedback-world.md.
- Inspect the current verification adapter, fuel mutation, environment handling, and UI.

Constraints:
- Do not guess SDK methods, proof fields, or verification endpoints; confirm them in current official World documentation before coding.
- Verification must be validated server-side.
- Persist only the minimum pseudonymous identifier required for abuse prevention.
- Never store selfie images.
- Never expose secrets or raw sensitive proof payloads in client logs.
- Preserve guest exploration and minigame access.
- World verification is required only before public fuel counts.
- Implement success, cancellation, rejection, expiry, duplicate, and provider-unavailable states.
- Keep all provider-specific code behind a typed adapter.
- Update docs/feedback-world.md with concrete observations, errors, and edge cases encountered.

Done when:
- Supported Sandbox verification results in one accepted fuel.
- Invalid or expired verification cannot mutate fire.
- Replayed proof/request cannot increment twice.
- UI explains Protect the Flame clearly.
- No selfie or secret is stored or logged.
- tests, lint, typecheck, and build pass.

Before editing, report the official integration approach and any access blocker. Stop and ask if required Sandbox access is unavailable; do not fake success.
```

## Prompt 8 — ENSv2 booth registry

```text
Goal:
Make ENSv2 on Sepolia the central source of startup booth identity and founder-editing permissions.

Context:
- Read AGENTS.md, the ENS section of the development plan, and current official ENSv2 documentation.
- Inspect booth configuration, environment variables, service adapters, and contract tooling.

Constraints:
- Do not use legacy ENS assumptions when ENSv2 differs; verify current Sepolia addresses and APIs from official docs.
- Resolve startup name, URL, description, and founder address dynamically.
- City/admin retains approval and revocation authority.
- Founder receives only the permissions necessary to edit approved records.
- Fire score, position, verification, and quest state remain outside ENS.
- Add explicit loading, missing-record, wrong-chain, timeout, and stale-cache behavior.
- Do not hard-code resolved metadata as a silent fallback in production.
- Never expose private keys in the browser or repository.

Done when:
- At least one booth is registered through ENSv2 on Sepolia.
- Application displays dynamically resolved records.
- Authorized founder update appears after refresh/cache invalidation.
- Unauthorized update fails.
- Contract or integration tests cover permission behavior.
- sponsor documentation points to relevant code.
- tests, lint, typecheck, and build pass.

Plan first and identify any testnet/faucet/access blocker before implementation.
```

## Prompt 9 — Approved visual polish

```text
Goal:
Apply the approved Fire City visual direction without expanding feature scope.

Context:
- Read AGENTS.md and the locked design section of the development plan.
- Inspect current plaza, asset manifest, UI, and performance budget.
- Read Game_Asset_Specification.md; use Asset Prompts A/B for missing runtime assets.

Constraints:
- Hybrid modern startup campus + cozy market town.
- Bright top-down pixel art, 16×16 tile basis, characters around 16×32.
- Nearest-neighbour rendering and integer scaling.
- Palette uses grass, cream, wood, charcoal, ember orange, flame yellow, and limited tech blue; no purple.
- Three booths must be visually distinct and startup-specific.
- Bonfires are the strongest visual hierarchy.
- Minimal Scout HUD; no permanent directory/search panel.
- Use only original or correctly licensed assets and update the asset-license record.
- Prioritize flame, player walk, founder idle, fountain, fuel burst, and crowd reaction in that order.
- Keep initial load small and avoid unnecessary high-resolution assets.
- Do not substitute a full-scene illustration for separated tiles, sprites, animation sheets, and metadata. Update asset manifests and validation evidence.

Done when:
- Screenshot clearly reads as Fire City rather than a generic directory.
- Strongest fire is identifiable without opening UI.
- HUD does not obscure gameplay.
- desktop and mobile-landscape layouts remain usable.
- asset licenses are documented.
- performance, lint, typecheck, test, and build pass.
```

## Asset Production Prompts — after greybox, before final visual polish
 
Before final review, use the following asset prompts as needed after the greybox is stable.

### Asset Prompt A — Plan the runtime asset batch

```text
Goal:
Define the next usable game-asset batch; do not generate images yet.
Context:
Read AGENTS.md, Game_Asset_Specification.md, the approved visual reference,
actual greybox dimensions, current loader, and existing asset manifest.
Constraints:
Preserve approved style and scope. A full-scene image is not an asset pack.
Confirm Git baseline. Allocate a task ID. Inventory reusable existing assets.
Done when:
List every requested filename, dimensions, grid/frames, alpha, anchor,
collision footprint, animation timing, output path, and validation plan.
Mark proposed dimensions needing adjustment. Update docs/change-log.md.
Report the diff and commit status. No asset generation in this planning task.
```

### Asset Prompt B — Generate and validate a real asset batch

```text
Goal:
Produce the next planned batch of actual game assets, not a single concept image.
Context:
Read AGENTS.md, Game_Asset_Specification.md, the batch manifest, approved
reference, current game loader, and docs/asset-validation.md if present.
Constraints:
Confirm Git baseline; allocate a task ID and inspect status before generation.
Use available image-generation capability for each asset/coherent sheet.
If unavailable, report the capability blocker instead of pretending to generate.
Deliver separate runtime PNGs and animation metadata in the specified folders.
Keep buildings, ground, characters, fire, props, and runtime text separate.
Preserve source revisions and provenance. Do not silently overwrite approved art.
Validate exact dimensions, alpha, grids, anchors, seams, and frame continuity.
Load the batch in Phaser and inspect animation/depth/collisions at integer scales.
If no runnable game exists, mark engine checks pending; do not claim engine-ready.
Do not add unrelated gameplay or new product scope.
Done when:
Every planned asset is delivered or explicitly listed as missing/unvalidated.
Manifest, provenance, previews/check evidence, change log, and AI-use log updated.
Report files, frame counts, validation results, gaps, and commit status.
Review changes and ask for commit approval unless standing permission exists.
```

## Prompt 10 — Full security and reliability review

```text
Goal:
Perform a read-only engineering review of the complete Startup on Fire repository before submission.

Context:
- Read AGENTS.md, development plan, sponsor requirements, architecture, and AI-use documentation.
- Inspect the entire current repository and Git diff/history relevant to the event.

Review for:
- World proof validation and replay resistance.
- Fuel-limit race conditions and idempotency.
- Sensitive data or secrets in code, logs, history, and build output.
- ENS permissions, wrong-chain behavior, and hard-coded fallbacks.
- Phaser lifecycle/listener leaks.
- Mobile controls and responsive overlays.
- Runtime crashes and unhandled provider errors.
- Sponsor qualification gaps.
- Missing tests, documentation, and environment instructions.
- Scope violations or unfinished visible features.

Output:
- Findings ordered Critical, High, Medium, Low.
- Exact file references and reproduction steps.
- Recommended minimal fixes.
- A sponsor-qualification checklist with pass/fail/unknown.

Do not modify files during this task.
```

## Prompt 11 — Fix only critical review findings

```text
Goal:
Fix the approved Critical and High findings from the pre-submission review.

Context:
- Read AGENTS.md and the saved review report.
- The user will list exactly which findings are approved for repair.

Constraints:
- Do not fix Medium or Low findings unless required by a selected fix.
- Do not add features or redesign architecture.
- Preserve working sponsor integrations.
- Add regression tests for every repaired behavior.

Done when:
- Approved findings no longer reproduce.
- Relevant regression tests pass.
- full lint, typecheck, test, and build pass.
- production smoke test passes.
- diff contains no unrelated changes.
```

## Prompt 12 — Submission documentation

```text
Goal:
Prepare the repository documentation and demo plan for ETHOnline submission without exaggerating any implementation.

Context:
- Read AGENTS.md, development plan, actual source, tests, deployments, sponsor docs, feedback-world.md, and ai-usage.md.

Constraints:
- Describe only behavior verified in the repository or production deployment.
- Clearly explain the problem, solution, architecture, and why each sponsor is load-bearing.
- Include exact setup, environment, test, and deployment instructions.
- Identify the code paths implementing World and ENS.
- Preserve complete AI-use disclosure.
- Produce a 3:15–3:40 demo script with real narration; no AI voice.
- Do not claim The Graph unless its complete live integration exists and passes its requirements.

Done when:
- README enables a judge to understand and run the project.
- sponsor-integrations.md maps every requirement to evidence.
- demo-script.md fits the time limit and shows the working product early.
- all links and commands are verified.
```

## Optional Prompt — The Graph stretch integration

Use this only after World, ENS, realtime fire, mobile controls, production deployment, and core tests are stable.

```text
Goal:
Add Ember, an AI city guide that recommends startups using live Fire City data indexed by The Graph.

Context:
- Read AGENTS.md, development plan, and current official The Graph bounty requirements.
- Inspect the stable production application and current contract setup.

Constraints:
- First provide a feasibility plan and estimate which existing code must change. Do not implement until approved.
- The Graph must be load-bearing and use live provider data; mocked/static data does not qualify.
- AI must reason over the indexed data or provide a natural-language discovery interface, not merely display query output.
- Implement the smallest FireRegistry event schema needed for booth and fuel activity.
- Do not expose World identifiers or linkable player verification data onchain.
- Preserve the no-directory design: Ember is an in-world NPC guide.
- Do not destabilize World, ENS, fuel security, or the demo path.

Done when:
- Live onchain Fire City events are indexed.
- Ember answers at least three discovery requests using current Graph data.
- Recommendations include understandable reasons.
- Removing The Graph would break the recommendation feature.
- public documentation and 2–4 minute demo evidence satisfy the sponsor requirements.
- full tests and production smoke test pass.
```

## Debugging Prompt

```text
Diagnose this problem before editing:

Observed behavior:
[Paste exact behavior.]

Expected behavior:
[Describe expected result.]

Reproduction:
[Exact steps.]

Evidence:
[Error, log, screenshot, failing test, network response.]

Read AGENTS.md and the relevant files. Form 2–4 plausible hypotheses, gather evidence to eliminate them, and identify the root cause. Do not implement a fix until the cause is supported. Then propose the smallest safe fix and the regression test that should accompany it.
```

## Post-task Review Prompt

```text
Review the uncommitted diff for the task just completed.

Check:
- Does it satisfy the stated Done When conditions?
- Did it change unrelated behavior?
- Are client inputs trusted incorrectly?
- Are errors and lifecycle cleanup handled?
- Are tests meaningful rather than implementation-only?
- Did dependencies or environment requirements change?
- Does documentation need updating?
- Did any change violate AGENTS.md or hackathon scope?

Run the relevant checks. Fix only clear defects introduced by this task, then summarize the final diff and remaining risks.
```
