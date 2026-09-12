# SOF-019 — Product review and resilient guest quest

## Goal

Review the full game as a first-time player, report balanced strengths and weaknesses, prioritize launch work, and repair only critical/high local findings at a high quality bar.

## Context and files

- Product requirements and exit gates: `Startup_on_Fire_Development_Plan.md`
- Current runtime: `src/game/`, `src/ui/`, and `src/services/`
- Automated evidence: `tests/`, asset validator, lint, typecheck, and production build
- Submission evidence: `README.md` and `docs/`

## Constraints

- Preserve guest exploration and the rule that public fire is server-authoritative and World-protected.
- A local fallback may award only a Practice Spark; it must never expose or imply public-fuel eligibility.
- Do not deploy Convex/Vercel, configure credentials, write to ENS, or claim account-backed evidence.
- Keep unrelated local assistant/configuration paths outside the change.
- Record the review, validation, AI use, decisions, and every changed path under SOF-019.

## Done when

- A real first-time local walkthrough and all eight product-quality dimensions are documented with evidence.
- The protected-quest outage no longer dead-ends guest play.
- Local and server-saved quest completions are distinguished, and only the latter can reveal public fuel.
- CI validates runtime asset integrity.
- Focused tests, full quality gates, browser recovery checks, diff/secret review, and a focused commit pass.
