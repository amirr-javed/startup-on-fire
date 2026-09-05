# Startup on Fire — Decisions

Important product and engineering decisions are appended here with truthful dates. Planned behavior is distinguished from implemented behavior.

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
