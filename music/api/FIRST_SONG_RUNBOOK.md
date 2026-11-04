# RUNLU MUSIC STUDIO — first real song acceptance runbook

**Status:** opt-in local smoke test only. This does not deploy a public generation endpoint.

## Preconditions (human approval required)

1. Confirm Gemini account has access to the Lyria preview model and that commercial-use terms permit the intended RUNLU use. Check the current official documentation and pricing before spending money.
2. Confirm the provider request/response schema and output audio MIME against the current official documentation; this adapter has not yet been validated with a live response.
3. Agree to the cost of **one** 30-second request; establish a provider-side budget/alert if available. The code cannot enforce a monetary limit at the provider.
4. Use a private development machine with Node 20+ and an environment variable `GEMINI_API_KEY` set securely. Do not paste the key into chat, GitHub, screenshots, or frontend JavaScript.
5. Review the song prompt and rights permissions. Only generate original material.

## Run locally from music/api

```sh
node first-song-smoke.js
```

This is dry-run mode. No network request and no charge.

After explicit approval and configuring the key privately, run **once**:

```sh
MUSIC_GENERATION_ENABLED=true MUSIC_TEST_APPROVED=true node first-song-smoke.js --live
```

The key must already exist in the environment. Do not append the key to the command line. Do not repeat the command after a timeout without checking billing.

## Pass/fail acceptance

- Exactly one provider generation attempt, no automatic retries.
- Response contains a real playable MP3 (not just a base64 string or local uploaded reference).
- The file is saved as `music/api/runlu-first-preview.local.mp3` with restricted permissions and excluded from Git.
- Play the file on iPhone and desktop; listen for clear Chinese vocals, originality, no unwanted voice imitation, and no clipping.
- Record actual playback duration with a proper decoder/player; the current duration helper handles only some constant-bitrate MP3 files.
- Verify provider billing and record the cost privately. If audio is rejected or missing, keep generation disabled and diagnose before any repeat call.

## Important limits

The provider call is not yet connected to the website UI or private song library. The one-shot script does not implement user authentication, rate limiting, account-level budget enforcement, audio malware scanning, or production retention policy. A timeout can still incur a charge.

## Stop conditions

If model access, licensing, pricing, API schema, output format, or spending authorization is unclear, do not run `--live`. Never commit credentials or generated personal material.
