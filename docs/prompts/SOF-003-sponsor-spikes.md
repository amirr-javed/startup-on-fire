# SOF-003 Prompt Archive — Sponsor Feasibility Spikes

## Requested outcome

Implement isolated, runnable World Selfie Check and ENSv2 experiments without adding gameplay or permanent provider UI. World must sign and verify through Convex, store only an action-scoped nullifier, and fail safely. ENS must use an ENSv2-ready viem release, library-selected Universal Resolver reads, fresh resolver lookup for Sepolia writes, one authorized record update, and one unauthorized revert.

## Constraints carried into implementation

- IDKit 4.x with `selfieCheckLegacy`, one stable action and signal, server-only signing key, unchanged server-side verifier forwarding, and no proof/selfie logging or persistence.
- Honest medium-assurance language and documented residual multi-account risk.
- Disposable low-value Sepolia account in ignored local configuration; no private key in prompts, Git, output, or documentation.
- No hardcoded Universal Resolver or implementation-resolver address.
- Automated checks plus truthful provider evidence; external tests stay pending until actually performed.

## Human gates

The builder must enter service secrets outside chat, complete the World App liveness interaction, provide a disposable ENSv2 Sepolia test name/account, approve the focused commit, and separately authorize any later GitHub push or public deployment.
