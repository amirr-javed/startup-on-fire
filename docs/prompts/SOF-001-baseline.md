# SOF-001 Prompt Archive — Git Baseline

## Goal

Implement the first checkpoint of the approved Phase 1 plan: establish an honest, recoverable Git baseline before application scaffolding or asset generation.

## Context

- Project directory: `C:\Users\Amir\Desktop\SOF`.
- Existing inputs: the project instructions, development plan, prompt pack, asset specification, and planning changelog.
- The wider approved Phase 1 plan includes a vanilla TypeScript Phaser 3 scaffold, Convex, CI, isolated World and ENS feasibility spikes, and gated public deployment, but those steps follow the baseline commit.

## Constraints

- Preserve and disclose all pre-existing files and timestamps truthfully.
- Add secret-safe ignore rules and required audit documents.
- Do not scaffold, install dependencies, generate assets, create a remote, push, or deploy during SOF-001.
- Review and stage explicit safe paths only.
- Request human approval before committing.

## Done When

- The local repository exists on `main` with the configured author verified.
- SOF-001 and planning-file provenance are recorded.
- The intended baseline paths pass ignore and secret checks and are staged for review.
- The repository remains uncommitted until explicit approval is received.
