# Startup on Fire — Detailed Change Log

This log records implementation tasks using actual dates and verified results. A task's commit is identified by the task ID in its commit message; a commit cannot contain its own hash.

## SOF-002 — Create the application foundation

- **Date/time:** 2026-09-05 11:07 PKT (UTC+05:00)
- **Request and acceptance criteria:** Build a single-package vanilla TypeScript, Vite, Phaser 3, and Convex foundation with strict checks, CI, a minimal responsive canvas, compact DOM status, safe missing-backend behavior, and a verified cloud Convex health connection.
- **Starting repository state:** Clean `main` at the approved SOF-001 baseline commit. No application files or dependencies existed and no unrelated user changes were present.
- **Changed paths:** Added `package.json`, `pnpm-lock.yaml`, application/config/test files under `src/` and `tests/`, Convex source/generated files, Vite/TypeScript/ESLint/Prettier configuration, `.env.example`, `.github/workflows/ci.yml`, `README.md`, `docs/architecture.md`, `docs/scope.md`, and `docs/prompts/SOF-002-application-foundation.md`; updated the two changelogs, decisions, and AI-use record.
- **Reason and before/after behavior:** Before this task there was no runnable application. Afterward, the browser renders a 480×270 Phaser foundation scene, scales responsively, shows a portrait orientation hint, and reports either a safe missing-configuration state or a validated realtime Convex health connection.
- **Dependencies/configuration/data/art affected:** Added Phaser 3.90.0 and Convex 1.45.0 at runtime plus Vite 8.2.2, TypeScript 6.0.3, Vitest 4.1.11, ESLint 10.10.0, Prettier 3.9.6, and supporting development types/configuration. Provisioned cloud Convex project `startup-on-fire-00865` with the development deployment in Europe (Ireland). The deployment identifiers live only in ignored `.env.local`. No gameplay data or art was added.
- **Validation:** `pnpm lint` passed; `pnpm typecheck` passed; `pnpm test` passed with 3 files and 13 tests; `pnpm build` passed with 77 modules transformed. Browser checks passed at the default viewport, 667×375 landscape, and 375×667 portrait. The UI reached `Realtime backend connected`, the orientation hint appeared only in portrait, and browser warning/error logs were empty.
- **Manual/visual evidence:** Visually inspected the solid green pixel-rendered canvas, centered title, compact Scout panel, landscape scaling, and portrait letterboxing/hint in the in-app browser.
- **Checks not run:** GitHub Actions cannot execute until the repository is pushed. No production or Vercel deployment was attempted. Sponsor checks belong to SOF-003.
- **Important failed attempts and corrections:** The first typecheck/build correctly failed because Convex generated files did not exist, Vitest config used Vite's narrower config type, and the temporary dynamic API reference was insufficiently typed. Convex code generation was then completed, Vitest's config helper was used, and the health function reference received explicit query types. The initial README copy order was corrected so Convex creates `.env.local` without a placeholder overwriting it.
- **AI assistance:** Codex selected compatible dependency versions, implemented the scaffold, configured Convex interactively, ran automated/browser validation, and reviewed the result. Prompt archived at `docs/prompts/SOF-002-application-foundation.md`.
- **Risks and pending work:** Phaser currently ships in one approximately 1.27 MB minified / 338 kB gzip JavaScript chunk, producing Vite's 500 kB warning. Code splitting or warning tuning is deferred until it is measured against the actual game. CI, public remote, preview deployment, and sponsor spikes remain pending.
- **Commit status:** Approved by the builder on 2026-09-05 at 11:12 PKT. Message: `chore(SOF-002): scaffold phaser convex application`.

## SOF-001 — Initialize Git and record planning baseline

- **Date/time:** 2026-09-05 10:45 PKT (UTC+05:00)
- **Request and acceptance criteria:** Establish an honest Git baseline in `C:\Users\Amir\Desktop\SOF` before scaffolding, add secret-safe ignore rules and project audit documents, inspect explicitly staged paths, and request approval before the first commit.
- **Starting repository state:** The directory was not a Git repository and was not inside an ancestor repository. It contained five untracked planning files and no application source, dependencies, tests, assets, `docs/` directory, or environment files.
- **Pre-existing files preserved:** `AGENTS.md`, `CHANGELOG.md`, `Game_Asset_Specification.md`, `Startup_on_Fire_Codex_Prompt_Pack.md`, and `Startup_on_Fire_Development_Plan.md`. Their saved modification times were between 2026-09-05 10:25:39 and 10:26:29 PKT. These files predate repository initialization and are inputs to the build, not evidence of implemented runtime functionality.
- **Changed paths:** Added `.gitignore`, `docs/change-log.md`, `docs/decisions.md`, `docs/ai-usage.md`, and `docs/prompts/SOF-001-baseline.md`; modified `CHANGELOG.md` to register the baseline task.
- **Reason and before/after behavior:** Before this task there was no version-control checkpoint or implementation audit structure. Afterward, the directory has a local `main` repository, secret-safe ignore rules, truthful provenance, and task-level audit records. There is still no runnable application.
- **Dependencies/configuration/data/art affected:** No dependencies installed, no application configuration created, and no data or art generated. Git author was already configured as `Amir <amirdev811@gmail.com>` and was not changed.
- **Validation:** Confirmed the exact working directory and lack of repository ancestry; initialized `main`; inspected Git status and author configuration; reviewed staged content and performed filename/content secret checks before commit approval.
- **Manual/visual evidence:** Not applicable; this is a documentation and repository-baseline task.
- **Checks not run:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` do not exist until SOF-002 and cannot truthfully pass in this task.
- **Important decisions:** Scaffolding, dependency installation, sponsor experiments, remote creation, push, and deployment remain blocked behind the approved baseline checkpoint.
- **AI assistance:** Codex inspected the directory, initialized Git, created the baseline governance files, and reviewed staging. The task prompt is archived at `docs/prompts/SOF-001-baseline.md`.
- **Risks and pending work:** Git is only a local checkpoint and is not a remote backup. SOF-002 must not begin until this baseline commit is approved and created.
- **Commit status:** Approved by the builder on 2026-09-05 at 10:48 PKT. Message: `chore(SOF-001): initialize git and record planning baseline`.
