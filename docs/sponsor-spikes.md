# Phase 1 Sponsor Feasibility Evidence

Status: World gameplay UI is integrated through SOF-016 and read-only ENSv2 booth enrichment through SOF-017. Provider activation, actual placeholder ENS records, and account-backed acceptance/write evidence remain pending. No real provider success is represented as complete.

## World Selfie Check

- **Dependency:** `@worldcoin/idkit-core` 4.2.4, using `IDKit.requestWithInviteCode` and `selfieCheckLegacy` with `allow_legacy_proofs: true`.
- **Isolation:** the provider adapter and earned-fuel DOM panel are on the default route but remain outside Phaser. The panel appears only after an earned Practice Spark and booth proximity; IDKit/WASM load only after explicit verification intent. The older development screen remains retained but unmounted.
- **Server boundary:** Convex generates RP context signatures and forwards the unchanged IDKit payload to `POST https://developer.world.org/api/v4/verify/{rp_id}`. The RP signing key is never returned to the browser.
- **Stable scope:** configured action plus a namespace-separated signal derived server-side from the hashed guest-session token.
- **Persistence:** only the action, canonical decimal nullifier, and guest-session binding are stored. Proofs, selfies, integrity bundles, signing keys, and verifier bodies are not logged or persisted.
- **Assurance statement:** Selfie Check is medium-assurance liveness/abuse resistance. It is not strict proof that one person controls only one account. A stable per-action nullifier limits replay for the same World credential, while residual multi-account risk remains.
- **Automated evidence:** World configuration parsing, missing configuration, verifier-response reduction, 256-bit nullifier canonicalization, session binding, backend fuel rules, and five public-panel interaction/recovery paths are covered by unit tests.
- **Convex evidence:** functions deployed successfully to `amir-javed:startup-on-fire` development deployment `acoustic-sockeye-371` in Europe (Ireland) on 2026-09-05. The health query returned `ok`. Calling `worldActions:createRequestContext` without provider variables returned the compact `not_configured` result rather than throwing or exposing values.
- **Browser evidence:** the earned-fuel panel rendered readable idle and missing-configuration states at 1280 px desktop, 768×432 landscape, and 375×667 portrait through a temporary local harness that was removed after inspection. The real game route reached its safe quest-sync error because the final SOF-015 actions are not deployed; no provider-success claim is made.
- **Sandbox success attempt:** pending World Developer Portal identifiers, an RP signing key installed directly in Convex, and human completion in World.
- **Duplicate/rejection attempt:** pending the same prerequisites. The atomic storage path is implemented but has not been represented as provider-tested.

### Sandbox limitations and feedback

Official IDKit guidance distinguishes the `staging` simulator from real Sandbox/World App traffic, which uses the `production` environment. Selfie Check is a legacy v3 Face proof exposed through the 4.x SDK and may require enablement for the selected app. The provider flow requires a person to use World App; automated tests cannot substitute for the liveness step. Integration feedback will be appended after the first actual success and rejection/replay attempts.

## ENSv2

- **Dependency:** viem 2.56.3, above the documented ENSv2-ready minimum of 2.35.0.
- **Runtime read path:** the normal game now resolves normalized booth names on Sepolia through a typed adapter and viem-selected ENS infrastructure. Static founder stories render immediately and remain available through loading, missing, invalid, or unavailable states.
- **Runtime record policy:** optional `com.startuponfire.name`, `com.startuponfire.founder`, `description`, `url`, and ETH address records are read. Text is bounded, URLs must be HTTPS without credentials, and malformed optional records are discarded before display.
- **Automated evidence:** resolver normalization, record validation, missing/provider states, concurrent deduplication/cache, late-result cleanup, directory merge behavior, dynamic dialogue, and safe DOM link behavior are covered. The `*.firecity.eth` booth names remain unregistered/unverified placeholders and are not claimed resolved.
- **Universal Resolver readiness:** passed on Ethereum mainnet on 2026-09-05 through viem’s library-selected resolver. `ur.integration-tests.eth` resolved to `0x2222222222222222222222222222222222222222`.
- **CCIP-Read readiness:** passed on Ethereum mainnet on 2026-09-05. `test.offchaindemo.eth` resolved to `0x779981590E7Ccc0CFAe8040Ce7151324747cDb97`.
- **Important failed attempt:** viem’s first default public RPC returned HTTP 503 during the CCIP-Read call. Re-running with `https://ethereum-rpc.publicnode.com` passed both checks. The script now falls back to that endpoint when no explicit `MAINNET_RPC_URL` is configured.
- **Sepolia authorized update:** pending `ENS_TEST_NAME`, a disposable owner key in ignored `.env.local`, and Sepolia funds/name access.
- **Sepolia unauthorized update:** pending the authorized experiment. The script creates an ephemeral outsider locally and requires its `simulateContract` call to revert.
- **Address policy:** neither script hardcodes a Universal Resolver address or an implementation resolver. The write script calls `getEnsResolver` immediately before each permission test.
- **Missing-config evidence:** the write script exits before importing viem and reports only the missing variable names when local test credentials are absent.

## Remaining Phase 1 sponsor gates

1. Install World identifiers and the RP signing key directly in Convex; complete one real Sandbox Selfie Check.
2. Retry the same stable action/proof path or reject/cancel a second attempt and record the sanitized result.
3. Configure a disposable ENSv2 Sepolia name/key locally; record the authorized transaction hash, runtime-resolved value, and unauthorized revert.

No private key, signing key, raw proof, selfie, or persistent biometric payload belongs in this document.
