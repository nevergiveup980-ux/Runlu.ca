# RUNLU MUSIC STUDIO — API scaffold

This is **not deployed** and **does not generate audio**.

The Worker validates creation requests but always returns HTTP 503 `GENERATION_NOT_CONFIGURED`, avoiding fake job IDs or misleading successful responses.

## Local development
- From this directory, install Wrangler in a separate development environment (e.g. `npx wrangler dev`).
- GET `/api/music/health` returns `generation_available:false`.
- POST `/api/music/jobs` validates `prompt`, `language`, `duration_seconds`, `instrumental`, and `idempotency_key`; a valid request returns 503.
- No secrets, payments, provider credentials or user audio should be committed.

## Release blockers
1. Select licensed provider and verify API response format, prices, commercial rights, and real music quality.
2. Add authentication, authorization, rate limits and quotas.
3. Add durable job storage and idempotency, provider polling/webhooks and error handling.
4. Add private object storage, signed playback/download URLs and verified MP3 output.
5. Add upload authorization, size and content verification, retention and deletion.
6. Add integration tests with real audio on iOS and desktop.
7. Set environment secrets only in deployment platform; never in repository.
