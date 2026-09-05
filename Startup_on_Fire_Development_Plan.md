# Startup on Fire — ETHOnline 2026 Development Plan

**Project:** Startup on Fire / Fire City  
**Builder:** Solo builder using OpenAI Codex  
**Build window:** September 4–13, 2026  
**Internal submission cutoff:** September 13, 6:00 PM PKT  
**Official deadline:** September 13, 9:00 PM PKT  
**Primary sponsor target:** World — Selfie Check  
**Secondary sponsor target:** ENS — ENSv2 on Sepolia  
**Stretch sponsor target:** The Graph — AI Tooling or AI Use Case (From Scratch)

## Current sequencing decision — core product first

As of September 5, 2026, implementation prioritizes the playable core product before sponsor and publishing work. Build and stabilize the greybox plaza, movement, interactions, discovery loop, minigame, fire states, and server-authoritative realtime rules first. World, ENSv2 completion, public GitHub publishing, and Vercel deployment are deferred until that core loop works. Existing sponsor feasibility code remains disabled and may be re-enabled deliberately later. The day-by-day sections below remain a dependency reference, not the active execution order.

## 1. Product Mission

Revision: September 5, 2026. This revision adds Git-first setup, task-level change tracking, and a runtime-asset delivery contract. It does not claim implementation progress or re-verify event/sponsor requirements. The dated schedule below remains a target, not a record of completed work; resume at the first unmet exit gate.

Build a cozy, top-down pixel city where players discover real startups by walking through a living world. Each startup owns a booth and a visible bonfire. Verified players fuel startups they genuinely support, causing the fire to grow for everyone in real time.

The hackathon must prove three claims:

1. Discovering a startup can feel like playing a game.
2. Community support can become a memorable shared visual.
3. “Fire is earned, never bought” can be technically protected.

## 2. Locked Design Direction

- Hybrid modern startup campus and cozy market town.
- Bright top-down 16-bit-style pixel art.
- Base tile size: 16×16 pixels; characters approximately 16×32 pixels.
- Integer scaling, nearest-neighbour rendering, and rounded pixel positions.
- Minimal Scout HUD.
- Landscape-first responsive gameplay.
- Three startup booths surrounding a central fountain/plaza.
- Bonfires form the main visual hierarchy.
- No permanent directory, search panel, or in-game submission form.
- Discovery happens through walking, NPCs, signs, fires, and environmental landmarks.
- UI palette: charcoal, cream, wood, ember orange, flame yellow, and limited tech blue; avoid purple.
- Ordinary players do not need a wallet to explore or play.

## 3. Hackathon Vertical Slice

### P0 — Required to submit

- Landing/loading screen.
- One compact Fire City plaza.
- Player movement using keyboard and landscape mobile controls.
- Camera follow and collision boundaries.
- Three visually distinct startup booths.
- Three founder NPCs with short dialogue.
- Contextual interaction prompt.
- One complete Bug Squash minigame.
- Three flame states: Cold, Hot, and Blazing.
- Guest exploration with no signup wall.
- World Selfie Check before fuel affects the public score.
- Maximum three fuels per verified human per UTC day.
- Maximum one fuel per booth per verified human per UTC day.
- Server-authoritative fuel mutation and realtime flame updates.
- ENSv2 identity for at least one booth, preferably all three.
- Dynamic booth metadata resolved from ENSv2 on Sepolia.
- Founder-limited ENS record permissions.
- Deployed public web app.
- Public GitHub repository with meaningful commit history.
- Architecture, sponsor-integration, AI-usage, and World feedback documentation.
- Two-to-four-minute demo video.

### P1 — Add only after P0 is stable

- Lightweight Scout level display.
- Ambient NPC wandering.
- Fountain animation.
- Fire particles and crowd reaction.
- Practice Spark onboarding before verification.
- Simple sound effects with mute control.
- Three booth quests using the same minigame engine with different configuration.

### P2 — Stretch only

- Sepolia FireRegistry contract emitting booth and fuel events.
- Subgraph indexing live Fire City events.
- Ember AI city guide using live Graph data to recommend Rising or Hidden Gem booths.
- The Graph sponsor submission.

### Explicitly excluded

- Founder dashboard and public startup submissions.
- Full admin panel.
- Coins, shop, inventory, cosmetics, and sticker book.
- Multiple districts, housing, pets, parties, or chat.
- Day/night cycle and Great Bonfire.
- More than one minigame engine.
- Complex progression or weekly events.
- NFTs, tradable tokens, investments, swaps, or pay-to-fuel mechanics.
- Any sponsor integration that does not solve a core product problem.

## 4. Core User Journey

1. A player opens the link and sees a lightweight loading screen.
2. The player spawns at the central fountain as a guest Scout.
3. Ember introduces Fire City in two short dialogue steps.
4. The strongest nearby bonfire or a shared booth receives a world-space marker.
5. The player walks to the booth and talks to its founder NPC.
6. The founder explains the startup through a short, product-shaped quest.
7. The player starts Bug Squash and completes a 30–60 second round.
8. The player presses **Throw Fuel**.
9. If unverified, the player receives a Practice Spark animation and a **Protect the Flame** explanation.
10. World Selfie Check verifies the player through the supported Sandbox flow.
11. The server validates eligibility and records one fuel.
12. All connected clients receive the updated score.
13. The booth fire grows and nearby NPCs react.
14. A compact booth card offers an optional external startup link.

## 5. Technology Stack

| Layer | Choice | Responsibility |
|---|---|---|
| Game | Phaser 3 + TypeScript | Scenes, movement, collisions, animation, particles, camera |
| Tooling | Vite + pnpm | Local development and optimized web build |
| Map | Tiled JSON or code-generated greybox | Plaza layout and collision layers |
| UI | DOM/CSS above Phaser canvas | HUD, dialogue, verification, booth card, error states |
| Backend | Convex | Sessions, booths cache, quests, fuel rules, realtime state |
| Human proof | World Selfie Check | Fairness and bot-resistant fuel eligibility |
| Onchain identity | ENSv2 on Sepolia | Startup subnames, records, founder permissions |
| EVM client | viem | Typed reads/writes and Sepolia connection |
| Contracts | Foundry | Deployment scripts and contract tests where needed |
| Unit tests | Vitest | Fuel rules, tiers, date boundaries, adapters |
| Browser tests | Playwright | Core player and failure flows |
| Hosting | Vercel | Public frontend deployment |
| Source | GitHub | Public history and submission repository |
| Stretch | The Graph | Live event indexing for AI recommendations |

## 6. Suggested Repository Layout

```text
startup-on-fire/
├── AGENTS.md
├── CHANGELOG.md
├── Game_Asset_Specification.md
├── art/                     # source art, retained revisions, reference images
├── README.md
├── package.json
├── pnpm-lock.yaml
├── public/
│   └── assets/
├── src/
│   ├── game/
│   │   ├── config/
│   │   ├── entities/
│   │   ├── scenes/
│   │   ├── systems/
│   │   └── world/
│   ├── ui/
│   ├── services/
│   │   ├── convex/
│   │   ├── ens/
│   │   └── world/
│   ├── styles/
│   ├── types/
│   └── main.ts
├── convex/
│   ├── schema.ts
│   ├── booths.ts
│   ├── fuels.ts
│   ├── quests.ts
│   └── verification.ts
├── contracts/
│   ├── src/
│   ├── script/
│   └── test/
├── subgraph/                 # stretch only
├── tests/
│   ├── unit/
│   └── e2e/
└── docs/
    ├── architecture.md
    ├── change-log.md        # detailed task-by-task record
    ├── decisions.md         # dated design/engineering decisions
    ├── asset-validation.md
    ├── sponsor-integrations.md
    ├── ai-usage.md
    ├── feedback-world.md
    ├── demo-script.md
    └── prompts/
```

## 7. Game Architecture

### Phaser scenes

- `BootScene`: minimal initialization.
- `PreloadScene`: loads only assets required for the first plaza view.
- `PlazaScene`: world, player, booths, NPCs, fires, interaction zones.
- `BugSquashScene`: isolated minigame with a clean return path.

Do not put business logic directly inside scene classes. Scenes coordinate systems; services own external data; pure modules own score and eligibility calculations.

### DOM overlay

Use DOM/CSS for:

- HUD and fuel counter.
- NPC dialogue.
- Booth card.
- World verification panel.
- Loading, error, and retry states.
- Mobile controls when DOM provides better accessibility.

Keep the world visible during interaction. No overlay should permanently occupy a large portion of the screen.

### Event flow

Use typed application events rather than direct cross-component references:

```text
PLAYER_NEAR_BOOTH
OPEN_DIALOGUE
START_QUEST
QUEST_COMPLETED
REQUEST_FUEL
FUEL_ACCEPTED
FUEL_REJECTED
FIRE_TIER_CHANGED
```

## 8. Backend Model

### Booth

```ts
type Booth = {
  slug: string;
  ensName: string;
  positionX: number;
  positionY: number;
  fireScore: number;
  fireTier: "cold" | "hot" | "blazing";
  active: boolean;
};
```

### Player session

```ts
type PlayerSession = {
  sessionId: string;
  verificationKeyHash?: string;
  verifiedAt?: number;
  fuelDateKey?: string;
  fuelUsedToday: number;
};
```

### Fuel record

```ts
type FuelRecord = {
  boothId: string;
  playerId: string;
  verificationKeyHash: string;
  dateKey: string;
  idempotencyKey: string;
  createdAt: number;
};
```

### Quest progress

```ts
type QuestProgress = {
  playerId: string;
  boothId: string;
  questId: string;
  completed: boolean;
  score?: number;
  completedAt?: number;
};
```

Exact World proof fields must follow the current official SDK and must not be guessed. Persist only the minimum pseudonymous value required to enforce limits; never persist selfie images.

## 9. Server-Authoritative Fuel Rules

For every fuel request, the backend must:

1. Validate the request schema.
2. Verify or reference a valid server-verified World proof.
3. Derive the UTC date key on the server.
4. Reject an inactive or unknown booth.
5. Reject a reused idempotency key.
6. Reject a fourth daily fuel.
7. Reject a second fuel for the same booth on the same day.
8. Optionally require quest completion for the selected booth.
9. Insert the fuel record atomically.
10. Recalculate fire score and tier on the server.
11. Return a typed success or rejection reason.

Never trust client-provided fire score, fuel count, verification state, or timestamps.

## 10. ENSv2 Integration

### Purpose

ENSv2 is Fire City's booth registry and founder-permission layer, not a decorative badge.

### Minimum demo

- Create a parent namespace or registry arrangement supported by ENSv2 on Sepolia.
- Register at least one startup subname.
- Resolve startup name, URL, description, and founder address dynamically.
- Delegate only allowed record-editing permissions to the founder.
- Retain city authority over approval/revocation.
- Demonstrate an authorized record update appearing in the booth.
- Demonstrate an unauthorized update failing.

### Data ownership

| Data | Source of truth |
|---|---|
| Startup name, URL, description, founder | ENSv2 |
| City position and active status | Convex |
| Fire score and fuel history | Convex |
| Quest state | Convex |
| Verification eligibility | Server-side World integration |

## 11. World Integration

### Purpose

World protects the meaning of fire by ensuring one genuine person cannot create unlimited voting identities.

### Required states

- Not verified.
- Verification requested.
- User cancelled.
- Verification rejected.
- Verification accepted.
- Fuel accepted.
- Daily limit reached.
- Booth already fueled today.
- Network/provider unavailable with safe retry.

### Required demonstration

- A valid Sandbox verification leads to accepted fuel.
- A duplicate or ineligible attempt is rejected.
- Public fire changes only after server acceptance.
- `docs/feedback-world.md` records integration experience and edge cases.

## 12. Day-by-Day Execution Plan

### Day 1 — September 4: foundation and sponsor spikes

- First execute Prompt 0A: inspect the chosen project directory, initialize local Git only if needed, add ignore rules and planning files, then review and commit the baseline with approval.
- Preserve and disclose any pre-existing work using truthful dates; do not alter history to imply a different start time.
- Execute Prompt 0B only after the baseline checkpoint. Creating/pushing a public GitHub repository is a separate explicitly approved action.
- Copy the approved `AGENTS.md` into the root.
- Add architecture, scope, and AI-usage documents.
- Scaffold Vite, Phaser, TypeScript, Convex, Vitest, ESLint, and formatting.
- Establish required scripts: `dev`, `build`, `lint`, `typecheck`, `test`.
- Deploy an empty Vercel preview immediately.
- Request World Sandbox access.
- Run the smallest possible World and ENS experiments to validate access and SDK assumptions.

**Exit gate:** local app, test command, production build, Convex connection, and preview deployment all work.

### Day 2 — September 5: greybox plaza

- Create the compact plaza using temporary licensed placeholders.
- Implement player movement, camera follow, collision, and interaction zones.
- Add three booth placeholders, three NPC placeholders, and fountain landmark.
- Add keyboard and landscape touch controls.

**Exit gate:** a player can reach and interact with all three booths on desktop and mobile landscape.

### Day 3 — September 6: discovery and minigame

- Implement reusable dialogue state machine.
- Add contextual interaction prompts.
- Implement Bug Squash as a separate scene.
- Connect Booth 1 dialogue → quest → minigame → completion.
- Add local Cold/Hot/Blazing flame animations.

**Exit gate:** one complete discovery loop works without backend or sponsor integration.

### Day 4 — September 7: realtime backend

- Implement Convex schema and guest sessions.
- Implement booths, quests, and atomic fuel mutations.
- Add server UTC limits and idempotency.
- Subscribe the game to realtime fire state.
- Add unit tests for every rejection condition.

**Exit gate:** two browser windows share one authoritative fire state; duplicates and fourth fuel fail.

### Day 5 — September 8: World Selfie Check

- Implement **Protect the Flame** panel.
- Integrate the current supported World Sandbox flow.
- Verify proof server-side.
- Bind the verified pseudonymous identity to fuel limits.
- Implement cancel, rejection, expiry, duplicate, and provider-error states.
- Start World feedback document.

**Exit gate:** valid verification produces exactly one accepted public fuel, while invalid and duplicate attempts fail safely.

### Day 6 — September 9: ENSv2

- Configure Sepolia and environment variables.
- Implement ENSv2 parent/subname flow.
- Add founder-limited record permissions.
- Resolve booth metadata in the application.
- Implement cache, loading, and provider-failure behavior.
- Add contract/integration tests.

**Exit gate:** changing an authorized ENS record changes the booth; unauthorized modification fails.

### Day 7 — September 10: integration checkpoint

- Test the entire journey in production.
- Repair the weakest part before adding anything.
- Replace the first placeholders with a coherent asset set.
- Decide on The Graph using this rule:
  - If P0 is stable by the end of the day, The Graph may start.
  - If any core flow is unreliable, The Graph is rejected.

### Day 8 — September 11: visual polish and resilience

- Complete the approved hybrid cozy/modern art pass.
- Polish flame growth, fuel throw, founder idle, fountain, and crowd reaction.
- Improve mobile controls and responsive overlays.
- Add sound effects and mute.
- Optimize preload size and cache behavior.
- Test slow network, refresh, incognito, and provider failures.

**Exit gate:** a new tester can complete the core loop without explanation.

### Day 9 — September 12: submission package

- Freeze features.
- Complete README and architecture diagram.
- Complete sponsor requirements and World feedback.
- Complete AI-use disclosure and prompt archive.
- Record a practice video and time it.
- Ask Codex for a full repository review.
- Fix only critical and high-priority findings.

### Submission day — September 13

- Run build, lint, typecheck, unit tests, and browser smoke tests.
- Test production from a clean browser.
- Record final 2–4 minute demo using a desktop and real narration.
- Verify repository visibility and deployment URLs.
- Submit by the internal 6:00 PM PKT cutoff.
- Keep the final three hours for upload or platform failures.

## 13. Quality Gates

No phase is complete until:

- Acceptance behavior works locally.
- Relevant automated tests pass.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm build` passes.
- Production preview is checked when the change affects integration or deployment.
- Codex reviews the diff for regressions.
- AI assistance is recorded in `docs/ai-usage.md`.
- A focused Git commit is created.

## 14. Testing Matrix

### Game

- Movement cannot leave map boundaries.
- Interact prompt appears only in range.
- Dialogue cannot open twice.
- Minigame exits cleanly to the same booth.
- Focus loss and refresh do not corrupt state.
- Fire state updates without reloading.

### Fuel security

- Unverified public fuel is rejected.
- First valid fuel is accepted.
- Same request replay is idempotent.
- Same booth twice in one day is rejected.
- Fourth daily fuel is rejected.
- Client timestamp manipulation has no effect.
- Concurrent requests cannot exceed limits.

### World

- Success, cancel, failure, expiry, duplicate, and network error.
- No sensitive proof data appears in client logs.
- No selfie image reaches application storage.

### ENS

- Valid resolution.
- Missing record.
- Provider timeout.
- Wrong chain.
- Authorized update.
- Unauthorized update.
- Cached content refresh.

### UX/performance

- Desktop Chrome.
- Mobile landscape viewport.
- Keyboard-only interaction.
- Touch controls.
- Slow network simulation.
- Muted/autoplay-restricted audio.
- At least 720p demo capture.

## 15. Environment and Secret Handling

- Commit `.env.example`; never commit `.env` or keys.
- Validate required environment variables at application startup.
- Separate public RPC/config values from backend secrets.
- Verify World proofs on the server.
- Keep privileged contract operations and deployment keys outside the browser.
- Use testnet-only accounts with limited value.
- Redact secrets, wallet keys, personal identifiers, and raw proof payloads from logs and demo footage.

## 16. Git and Codex Working Method

### Mandatory first checkpoint

Git setup precedes scaffolding and asset production. Prompt 0A in the prompt pack is the entry point; Prompt 0B creates the application afterward. These document updates do not themselves initialize the user's game repository.

For an empty, confirmed project directory: inspect repository ancestry, run `git init -b main`, create `.gitignore`, copy approved documents, record baseline provenance, inspect staged content, and create the initial commit after approval. If a repository exists, preserve it and inspect its status/history rather than resetting it. If author identity is absent, ask for it. Never fabricate commit dates, identities, or progress.

### Every-change audit trail

1. Begin with repository status and relevant diff; identify unrelated work.
2. Allocate a task ID such as SOF-001 and record the request and scope.
3. Implement one bounded task; preserve intentional source/art revisions.
4. Update `docs/change-log.md` with all changed paths, change type, reason, previous/new behavior, tests and exact results, skipped checks, and known risks. Record failed attempts/reverts that affect decisions without saving sensitive logs.
5. Update `CHANGELOG.md`, relevant specifications, AI-use/prompt records, asset manifests, and `docs/decisions.md` as applicable.
6. Review unstaged and staged diffs, including binary asset previews; stage explicit paths only.
7. After approval create a focused commit containing the task ID, then report its hash, validation, and remaining status. If not approved, report the task as uncommitted.

Git is checkpoint history, not a keystroke recorder or remote backup. Remote creation/push requires authorization. Do not commit secrets, raw proof payloads, local caches, build output, or dependencies. Use corrective commits; do not rewrite history to conceal mistakes or pre-event work.

### Runtime asset workstream

`Game_Asset_Specification.md` is the asset contract. When the user says “generate assets,” deliver separate game-loadable files and animation metadata in batches, not a single screenshot. Concept images guide style only. Keep map ground, collidable props, characters, fire, and DOM UI separate. Do not generate assets during a planning-only request.

After the greybox dimensions are stable, execute Asset Prompt A for the manifest, then Asset Prompt B one approved batch at a time: terrain; booths/props; player/founders; three fire tiers; minigame sprites; optional polish. Integrate and inspect a small batch in Phaser before expanding it. The art pass is complete only after alpha/frame/seam checks and in-engine previews, not after image generation succeeds.

- Use one Codex conversation per coherent feature outcome.
- Give every prompt Goal, Context, Constraints, and Done When sections.
- Ask Codex to inspect before editing and to plan before complex changes.
- Never prompt “build the whole game.”
- Review the diff after every task.
- Commit after each verified vertical slice.
- Do not run two Codex tasks that edit the same files simultaneously.
- When Codex repeats a mistake, update `AGENTS.md` with the concrete rule.

Suggested commits:

```text
chore(SOF-001): initialize git and record planning baseline
chore: scaffold phaser convex application
feat: add player movement and plaza collisions
feat: add booth dialogue and interaction system
feat: implement bug squash quest
feat: add server-authoritative realtime fire
feat: integrate world selfie verification
feat: resolve booth records through ensv2
test: cover fuel abuse and provider failures
fix: improve mobile input and initial loading
docs: complete sponsor and ai usage documentation
```

## 17. Sponsor Submission Checklist

### World — Selfie Check

- Meaningful fairness/abuse-prevention use.
- Working application.
- World ID Sandbox App demonstration.
- Complete feedback document.
- Success and abuse-rejection shown in video.

### ENS — ENSv2

- ENSv2 on Sepolia.
- Central, non-cosmetic use.
- Functional dynamic records, not hard-coded booth data.
- Founder permissions demonstrated.
- Open-source repository.
- Live demo and video.

### The Graph — only if implemented

- Live Graph provider data.
- Graph is load-bearing.
- AI reasoning or natural-language recommendations over the data.
- Public repository and clear README/SKILL.md.
- Two-to-four-minute demo.

## 18. Demo Storyboard

1. **0:00–0:15:** Problem — startup directories feel like lists and popularity can be manipulated.
2. **0:15–0:30:** Solution — Fire City and “fire is earned, never bought.”
3. **0:30–1:05:** Walk through the plaza and discover a startup through its booth.
4. **1:05–1:35:** Complete Bug Squash.
5. **1:35–2:10:** Protect the Flame with World verification and submit fuel.
6. **2:10–2:30:** Show the fire growing live in a second browser.
7. **2:30–3:05:** Show ENSv2 booth identity and founder-permitted update.
8. **3:05–3:30:** Architecture, sponsor value, and close.

If The Graph is implemented, replace part of the architecture segment with a 20–30 second Ember recommendation demonstration.

## 19. Final Definition of Done

The hackathon project is done when a new user can open the production URL, enter Fire City without signup, walk to a booth, understand the startup, complete Bug Squash, verify through the World Sandbox flow, add exactly one valid fuel, see the fire change in real time, and inspect dynamically resolved ENSv2 booth information—with all required tests, documentation, source code, deployment, and demo video complete.
