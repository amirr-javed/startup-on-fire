# SOF-004 Prompt Archive — Core-first sequencing

## Builder direction

Build the core product before adding World, Vercel, and other external technologies. If feasibility work already exists, disable it rather than letting it enter the current runtime. Record `https://github.com/amirr-javed/startup-on-fire.git` as the project repository, but add publishing integrations later.

## Applied interpretation

- Remove the World development screen from application composition.
- Require an explicit disabled-by-default Convex feature flag before World actions can execute.
- Leave ENS feasibility scripts as offline, manually invoked code with no runtime integration.
- Update the active roadmap to prioritize greybox gameplay through server-authoritative core rules.
- Configure the Git remote only. Do not push or configure Vercel without later explicit authorization.
