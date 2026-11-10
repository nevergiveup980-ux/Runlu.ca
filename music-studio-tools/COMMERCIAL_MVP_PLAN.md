# RUNLU MUSIC — One-click commercial MVP plan (2026-11-08)

Status: design specification only; NOT deployed or connected to live paid generation.

## Product contract
A signed-in customer writes a prompt or lyrics, selects language/voice/style and presses **Generate Song**. They can view queued/running/completed/failed status, listen, and download the result. Customers never visit GitHub, see API keys, or run scripts.

## Existing assets
- `music-studio.html`: local editor, exports project JSON, local audio preview; **no verified live generation**.
- `music-studio-tools/sample-project.json`: full original lyrics for 《风吹过的那些年》.
- `music-studio-tools/generate_full_song.py`: experimental single-request Lyria 3.5 runner.
- `.github/workflows/runlu-music-full-song-manual.yml`: owner-only manual test path, NOT customer path.

## Architecture (minimum secure launch)
1. **Identity:** RUNLU account session required for paid operations. Server verifies user identity on every request.
2. **Create request:** `POST /api/music/jobs` with project fields; validate sizes, lyrics and language. Apply moderation and rights declaration. Enforce per-user concurrency/rate limits.
3. **Cost gate:** server verifies available credits before accepting work. Reserve one credit atomically and create an immutable job + idempotency key. Never charge twice for same accepted request.
4. **Queue/worker:** private worker reads pending jobs and invokes provider with server-held secret. A worker timeout after request submission is **billing-uncertain**; mark `needs_review`, never blindly auto-retry.
5. **Persistence:** store audio in private object storage with scoped, expiring download URLs. Store provider/model, prompt version, duration, format, cost and license metadata. Verify audio bytes before declaring success.
6. **Completion:** mark `completed` only after validated playable file is stored. For clearly pre-provider failures, release reserved credit. For ambiguous provider failures, reconcile usage before refund/retry.
7. **UI:** button -> job status -> playback/download. Handle network disconnect, reload and duplicate taps with one job ID.
8. **Operations:** per-account spend caps, global budget cap, abuse controls, audit logs with secrets and private lyrics redacted, retention/deletion policy, rights and terms review.

## API contract (proposal; not implemented)
- `POST /api/music/jobs` -> `{id,status,credits_reserved}` with `Idempotency-Key`.
- `GET /api/music/jobs/:id` -> `{id,status,progress?,error_code?,audio_available}`; ownership enforced.
- `GET /api/music/jobs/:id/audio` -> short-lived authorized download redirect; only after completion.
- `GET /api/music/credits` -> current account balance, reservation count, pricing.

Job states: `queued -> running -> completed | failed | needs_review`. Cancellation before provider submission is allowed; after submission, cost may already be incurred.

## Staged delivery and acceptance
**Phase 0 — owner-only validation:** verify provider model/API revision, output response schema, actual cost, song duration, rights, and secret configuration; generate one authorized song, no automatic retry. Do not merge/deploy while PR is under review.

**Phase 1 — private end-to-end MVP:** authenticated server route, job DB, one worker, private storage, polling UI, credit reservation and budget cap. Use a mock provider first; real provider behind a feature flag.

**Phase 2 — invited testers:** measure success rate, real cost per completed song, latency, repeat/duplicate requests, mobile playback, refunds, rights and abuse cases.

**Phase 3 — public release:** publish clear credit prices, terms, privacy policy, content policy, support/refund rules and storage retention. Enable limited rollout and monitor spend.

## Non-goals for first release
No direct browser-to-provider calls; no GitHub workflow per customer; no unlimited free generation; no promise of precise melody imitation or exact duration; no unlicensed voice cloning; no public unauthenticated paid endpoint.

## Critical verification
The historical `music/api/lyria-adapter.js` exists in commit `36b2d89`, but is not present on the current feature branch. Its historical API request shape is evidence for investigation, **not** proof that the current provider contract still works. The Python runner also remains unverified against a live response. Do not assert commercial readiness until a real authorized generation and end-to-end tests pass.
