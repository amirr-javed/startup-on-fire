# Startup on Fire — Change Log

This records planning revisions. It is not evidence that the game, Git repository, sponsor integrations, or runtime assets are implemented. Repository task IDs start at SOF-001 during Git initialization; planning changes use DOC identifiers.

## SOF-001 — September 5, 2026 — Git baseline prepared

Initialized the local repository on `main`, added secret-safe ignore rules, and created the detailed change, decision, prompt, and AI-usage records. The five planning files already present in the directory are preserved and disclosed as pre-existing inputs. No application, dependency, asset, sponsor integration, remote, or deployment was created. The builder approved the baseline commit on September 5, 2026.

## DOC-002 — September 5, 2026 — Git-first and real asset delivery

Requested: update the files before implementation; initialize Git first when development begins; track every change; asset requests must produce usable game assets, not one image.

| File | Change | Reason |
|---|---|---|
| AGENTS.md | Added Git-first setup, truthful baseline, explicit staging/commit approval, task IDs, detailed change records, runtime-asset rules | Make these mandatory in every Codex task |
| Startup_on_Fire_Development_Plan.md | Added baseline gate, tracking lifecycle, document/art paths, runtime-asset workstream, schedule-status caveat | Put Git before scaffolding and distinguish targets from completed work |
| Startup_on_Fire_Codex_Prompt_Pack.md | Split Prompt 0 into Git setup 0A and scaffold 0B; added asset prompts and task completion audit fields | Give executable, bounded instructions for the next session |
| Game_Asset_Specification.md | New inventory, target dimensions/grids, transparency, anchors, export metadata, revision/provenance and engine-validation requirements | Define a usable game asset pack and its acceptance criteria |
| CHANGELOG.md | New planning revision record and implementation log template | Begin readable change tracking now |

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
