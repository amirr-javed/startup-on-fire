# Startup on Fire — Product Quality Review

- Review date: September 12, 2026
- Stage: hackathon vertical-slice MVP
- Primary user: an ETHOnline visitor exploring without an account or wallet
- Core journey: enter Fire City, meet a founder, complete Bug Squash, verify humanness, and add earned public fire

## Executive summary

Startup on Fire has a memorable product premise, a coherent playable identity, and unusually disciplined trust boundaries for a hackathon game. The guest discovery experience is strong locally, but the submission is not launch-ready until the deployed backend, real World flow, ENSv2 records/permissions, public URL, cross-client evidence, and demo video are complete.

SOF-019 repaired the most damaging local failure found during the walkthrough: a healthy booth subscription could coexist with unavailable protected quest actions, causing the required quest to dead-end. The client now checks a literal game API version before calling protected actions and offers an honest local Practice round while keeping public fuel unavailable unless the run was saved by the server.

SOF-020 deployed the matching actions to the configured personal Convex development deployment and proved a complete server-saved Kindred quest in a clean Chromium browser. This closes the first roadmap item for that development target, not the remaining provider, public-hosting, or submission gates. The scorecard below is the September 12 snapshot and has not been rescored.

## Scorecard

| Dimension                |      Score | Evidence                                                                                                                                                                                                                                              |
| ------------------------ | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding flow          |       8/10 | The launch screen explains the product, guest access, and earned-fire rule before entry; Ember gives a two-step first trail. Reaching the west booth still requires a meaningful traversal before the first action.                                   |
| Core experience          |       6/10 | Plaza movement, three founder encounters, Bug Squash, Practice Spark, and fire feedback work locally. The configured development backend does not yet expose the final protected quest actions, and real public fuel remains unproven.                |
| Error handling           |       8/10 | Loading, ENS, World, fuel, and quest failures have compact recovery states. SOF-019 adds a playable local quest fallback without weakening public-score rules. Account-backed provider errors still need real-world validation.                       |
| Information architecture |       8/10 | The world itself is the navigation; the compact HUD supplies one objective and contextual actions without a large permanent directory. Wayfinding relies mostly on text and one world marker.                                                         |
| Visual design and polish |       7/10 | The original pixel pack, warm palette, clear bonfire hierarchy, and restrained DOM cards feel cohesive. The plaza remains sparse in places and lacks the planned sound/crowd/fountain polish.                                                         |
| Performance              |       6/10 | First paint has independent fallback markup/CSS and truthful asset progress; optional World code loads on demand. The initial Phaser-containing script is still about 353 kB gzip and produces Vite's large-chunk warning.                            |
| Accessibility            |       7/10 | Keyboard play, visible focus, semantic DOM overlays, live/progress states, reduced-motion handling, and 44 px landscape controls are present. Canvas world semantics, physical-device touch, and broader assistive-technology testing remain limited. |
| Feature completeness     |       5/10 | The scoped local vertical slice exists, but several required submission gates are external and incomplete: deployed matching Convex actions, World acceptance, actual ENS records and founder permissions, public hosting, and the final video.       |
| **Overall**              | **6.9/10** | **Strong concept and local slice; not yet submission-ready.**                                                                                                                                                                                         |

## Top strengths

1. **The product idea is immediately legible.** “Fire is earned, never bought” connects discovery, play, fairness, and the shared bonfire in one sentence.
2. **Web3 is deferred until it creates value.** Anyone can enter and play without signup or a wallet; World appears only when a player chooses to affect public fire, and ENS enriches booths without blocking them.
3. **The public-score boundary is credible.** Convex derives quest completion, UTC limits, idempotency, score, and tiers; the browser cannot mint public fire, and only minimal pseudonymous World data is retained.

## Top weaknesses

1. **The production proof path is incomplete.** No current browser evidence proves server-saved quest completion → real World Selfie Check → accepted fuel → realtime fire in a second client.
2. **ENSv2 is visible in architecture but not yet demonstrated with owned records.** Placeholder names, missing runtime resolution evidence, and absent authorized/unauthorized write proof weaken the sponsor story.
3. **Release evidence trails implementation quality.** There is no public deployment, automated browser smoke suite, physical mobile pass, or final two-to-four-minute demo yet; the initial game bundle also remains comparatively heavy.

## Prioritized roadmap

### P0 — submission blockers

1. Deploy the exact current Convex functions to the intended development/preview deployment, then prove the protected quest succeeds in a clean browser.
2. Configure the World Sandbox application and server-only signing key; record success, cancel/rejection, replay, daily-limit, and same-booth rejection evidence without storing raw proofs.
3. Register/configure at least one ENSv2 Sepolia booth identity, prove the runtime reads its records, and capture founder-authorized plus outsider-rejected record updates.
4. Deploy the web build publicly, run a clean-browser desktop/mobile-landscape and two-client realtime smoke pass, and verify the repository/URL are publicly accessible.
5. Record the final two-to-four-minute demo showing the complete journey and both sponsor integrations. Do not record around a mocked or local-only success.

### P1 — high-value resilience and polish

1. Add Playwright smoke coverage for launch, guest entry, onboarding, local practice recovery, and responsive DOM states.
2. Measure and reduce the initial Phaser-containing bundle or document the accepted loading budget with real throttled timings.
3. Run a physical landscape touch pass and screen-reader/zoom audit; correct any input capture, focus, or clipping issues.
4. Add the restrained sound, fountain, and crowd/fire reaction polish only after every P0 proof is green.

### P2 — after submission safety

1. Add deeper share/deep-link behavior only if it supports booth discovery without becoming a directory.
2. Add quests for the remaining booths using the existing engine only after the single P0 loop remains stable.

## First-time walkthrough evidence

- The local Vite route showed a clear ready state and focused **Enter Fire City** action.
- Entry moved focus to Ember's first action; both onboarding steps explained the city and first objective.
- Keyboard movement reached Kindred Labs, discovery advanced to 1/3, and Maya's quest copy was understandable without external documentation.
- The configured backend's health/booth subscription succeeded while the protected quest action failed, reproducing the misleading dead-end.
- After SOF-019, that failure offered a local Practice round. Completing it produced explicit offline reward copy, threw the visual spark, and did not expose the public-fuel panel.
- Final checks passed for 21 runtime assets, lint, strict TypeScript, 74 tests, and the production build. A fresh production preview entered cleanly with zero browser warnings/errors.

## Review boundaries

This score reflects repository evidence and local browser behavior, not a public production deployment. No World credential, ENS ownership key, chain write, Convex deployment, Vercel action, physical-device test, or video recording was performed as part of this review.
