# RUNLU STAGE 2.0 — isolated prototype

**Status:** engineering prototype, not deployed, not customer-ready. No third-party paid calls.

## Design
- Public Studio: collects creative brief, duration, format, quality. No model rates or secrets.
- Private API: authenticates, rate-limits, validates request, checks entitlements, quotes and approves.
- Internal pricing engine: cost + retries + margin floor + competitor comparison.
- Queue/worker: later selects provider, tracks attempts, enforces spending limits, validates deliverable.
- Storage: private assets, signed access URLs, deletion policy and moderation.

## Prototype constraints
- Rates are illustrative fixtures only, not live prices or a competitive market audit.
- Currency conversion is supplied explicitly by trusted backend configuration.
- The longform motion fractions are assumptions, not promised production ratios.
- QuoteInternal produces INTERNAL_REVIEW, never an automatically saleable quote.
- Before any payments: actual provider tests, quality acceptance, refund policy, tax handling, privacy/security review, and final pricing approval.

## Run
With Node.js 20+: `node --test stage-2/engine.test.mjs`

## Next milestones
1. Provider adapter interface and fake provider for zero-cost end-to-end tests.
2. Authenticated internal-only pricing service, server-side secrets.
3. Model benchmark dataset with multiple runs per provider, quality scores, costs, retries.
4. Approved catalog with transparent video types and price guarantees.
