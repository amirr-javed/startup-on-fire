# Startup on Fire — Detailed Change Log

This log records implementation tasks using actual dates and verified results. A task's commit is identified by the task ID in its commit message; a commit cannot contain its own hash.

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
