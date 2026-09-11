# Startup on Fire — Decisions

Important product and engineering decisions are appended here with truthful dates. Planned behavior is distinguished from implemented behavior.

## 2026-09-11 — SOF-015 — Separate protected gameplay from human eligibility

Convex issues opaque guest credentials whose hashes are stored server-side. Bug Squash records rate-bounded, idempotent hit events and derives completion from those records plus server time; the client never submits a final score, tier, date key, or completion timestamp. Public fuel additionally requires a World proof whose signal is derived from the guest token hash, with its nullifier bound atomically to the same action-scoped session, one completed quest, one fuel per booth per UTC day, and at most three fuels per identity per UTC day. World remains the human-eligibility boundary because server-recorded browser events alone cannot prove a human performed them.

## 2026-09-11 — SOF-014 — Keep pre-verification reward feedback honest

The first quest awards a Practice Spark stored only in the in-memory quest session. It can preview a Cold-to-Hot fire transition but is explicitly described as local and cannot affect a public score. Public fuel remains reserved for a later server-authoritative Convex mutation gated by World verification. The minigame remains a separate Phaser scene, while accessible controls, progress, dialogue, and recovery states remain in the DOM layer.

## 2026-09-11 — SOF-013 — Separate generated source art from validated runtime exports

OpenAI outputs are retained as immutable high-resolution revisions. A reproducible local export step creates exact RGBA dimensions, frame grids, nearest-neighbour pixels, transparent padding, and stable bottom anchors before an asset enters the manifest. The live manifest now contains only the coherent SOF-013 pack; older original art is retained outside the load path for rollback.

## 2026-09-05 — SOF-006 — Publish incremental source checkpoints

The builder authorized small focused commits and a push to the supplied public GitHub repository. Publish `main` while keeping Vercel, sponsor activation, and production deployment deferred. Local assistant skill/configuration files remain outside repository scope.

## 2026-09-05 — SOF-005 — Generated references do not bypass runtime asset requirements

The image-generation output is retained only as style provenance because it has a background and incorrect scale. Runtime art is produced as deterministic exact-size RGBA PNGs with a manifest and hashes. This keeps the current batch original, reproducible, separately addressable, and honest about its greybox quality.

## 2026-09-05 — SOF-005 — Use a typed DOM-to-Phaser input boundary

Landscape touch buttons update a small `DigitalInput` service; Phaser remains responsible for movement and collision. Phaser publishes proximity and discovery state through `GameUiBridge`, while DOM/CSS owns prompts and dialogue. This preserves the architecture boundary and makes future input/UI behavior independently testable.

## 2026-09-05 — SOF-004 — Prioritize the playable core

- Build and stabilize the core game loop before completing sponsor integrations or public deployment.
- Remove the World spike entry point from browser composition and require an explicit unset server flag before World actions can run. Retain its implementation for later reuse instead of deleting tested feasibility work.
- Keep ENSv2 scripts offline and unused by runtime code until the core loop is stable.
- Record the supplied GitHub repository as the local `origin`, but do not push, publish, or configure Vercel until separately authorized later.
- Treat the earlier calendar as a dependency reference; this core-first decision controls the active implementation order.

## 2026-09-05 — SOF-003 — Isolated sponsor feasibility boundaries

- Load the World UI only behind `?spike=world` and a dynamic import. Use IDKit 4.2.4 invite-code mode with `selfieCheckLegacy`; keep Phaser and the default route provider-free.
- Treat a Sandbox application as `production` IDKit traffic and reserve `staging` for the simulator, following current provider guidance.
- Bind the proof to one configured action and a stable server-checked signal. Store only the action and canonical decimal nullifier in an atomically checked Convex table.
- Reduce provider failures to small public error codes. Do not return, log, or persist raw World request, proof, verifier, or biometric payloads.
- Use viem 2.56.3 for ENSv2. Run official Universal Resolver and CCIP-Read readiness names on mainnet, and run the ownership/permission experiment on the ENSv2 Sepolia deployment.
- Resolve a name’s configured resolver immediately before every write attempt. A discovered resolver may be reported as evidence but must never become configuration or a hardcoded dependency.
- Declare World variables in `convex/convex.config.ts` and access them through Convex's generated typed `env`; keep every value optional so an unconfigured deployment can render the intended setup state.

## 2026-09-05 — SOF-002 — Minimal typed application shell

- Use a single-package vanilla TypeScript application. Phaser owns the canvas; small DOM modules own overlays; `ConvexClient` owns realtime browser transport. React is intentionally not introduced.
- Retain Phaser major version 3 to match the approved development plan even though Phaser 4 exists.
- Use TypeScript 6.0 because the selected `typescript-eslint` release supports TypeScript below 6.1. Use Vitest 4 because Vitest 5 does not support the installed Node 25 runtime; CI remains pinned to Node 22.20.
- Keep missing `VITE_CONVEX_URL` non-fatal during the foundation phase so static builds and first-time setup render a clear status instead of crashing.
- Commit Convex-generated API types alongside their matching functions, but ignore local deployment selection and URLs in `.env.local`.
- Use the Europe (Ireland) Convex development region as the lower-latency available option for the builder in Pakistan.

## 2026-09-05 — SOF-001 — Repository root and baseline provenance

- `C:\Users\Amir\Desktop\SOF` is the project repository root; no ancestor Git repository was present when it was initialized.
- The initial branch is `main`.
- The five planning documents present before initialization are retained as pre-existing project inputs with their original saved timestamps.
- The first commit is a documentation and governance baseline only. It must not be described as application implementation, sponsor integration, asset production, deployment, or proof that runtime checks pass.
- Every later bounded task receives a sequential SOF identifier and an approval-gated focused commit.
