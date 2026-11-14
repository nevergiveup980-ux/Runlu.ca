# RUNLU STAGE supplier-selection checkpoint — 2026-10-14

Official API pricing source: https://docs.dev.runwayml.com/guides/pricing/
Official models: https://docs.dev.runwayml.com/guides/models/

## Shortlist
- Budget image-to-video: Runway Gen-4 Turbo — USD $0.05/sec.
- Higher-end visual candidate: Runway Gen-4.5 — USD $0.12/sec.
- Video with generated audio: Veo 3.1 Fast audio via Runway — USD $0.15/sec.
- High-end audio/video: Veo 3.1 audio via Runway — USD $0.40/sec.

These are API generation rates, **not** finished-film costs. Retry waste, audio/postproduction, storage, payment, FX, tax, refunds and operating costs must be included separately.

## Important limits
- Do not assume model names guarantee better visual quality; benchmark identical briefs.
- Capability flags are conservative preliminary constraints, not complete technical specifications.
- A provider model router may be evaluated later, but opaque routing is unsuitable for guaranteed upfront pricing unless a hard spending ceiling exists.
- No API key is stored in the repo. No real calls or purchases have been made.
- Longform video is assembled from segments; no promise of continuous 60-minute generative video.

## Next execution gate
Run Node tests; confirm GitHub Actions result; validate provider request schemas, commercial license and output verification; then perform a capped small-budget benchmark with explicit budget approval.
