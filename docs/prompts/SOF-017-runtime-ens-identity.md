# SOF-017 — Runtime ENSv2 booth identity

## Builder request

Continue the reviewed priorities with high quality, complete each task, and track every small change with focused commits.

## Implemented interpretation

Add the next P0 integration as read-only runtime ENSv2 identity for the three existing booths. Preserve guest play and static founder stories; do not perform a blockchain write, deploy backend/app state, or claim the placeholder names are registered.

## Constraints

- Use ENSv2 Sepolia and current official ENS/viem guidance.
- Normalize names and rely on viem's chain-aware resolution; never hardcode resolver addresses.
- Keep provider code behind typed adapters and out of Phaser scene/database logic.
- Treat every external record as untrusted: bound text length, require safe HTTPS URLs, and validate addresses.
- Handle loading, missing, invalid, and unavailable states without blocking exploration.
- Cache/deduplicate reads and clean up late subscription work.
- Update tests, configuration examples, architecture/status/evidence records, changelogs, decisions, and AI disclosure.
- Commit locally under SOF-017 after full validation. Do not push, deploy, or write to chain.

## Done when

- Realtime booth data is enriched when valid ENS records exist and remains usable when they do not.
- Founder dialogue exposes the ENS state and safe startup link without obscuring the game world.
- Resolver, directory, lifecycle, dynamic content, configuration, and DOM behavior have focused tests.
- Asset validation, lint, strict typecheck, full tests, and production build pass.
