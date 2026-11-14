# RUNLU Forum Gemini integration — review and rollout

Status: draft PR; no production deployment or schema changes. Real Gemini acceptance remains pending secure secret configuration in a non-production Forum environment.

## Existing architecture inspected

- `forum.html` → `forum-live-ai.js` → Supabase `runlu-forum-ai` (project `ekrnknlawekeoszzkamd`, existing version 7, JWT verification enabled).
- Existing OpenAI route: shared Cloudflare gateway. Claude/Gemini were direct calls within the same Supabase function. No backend source was tracked in this repository.
- Existing Postgres `reserve_forum_ai_call` serialized an estimated-cost ledger (`forum_ai_usage`). It was service-role only. It did not constrain in-flight requests or derive a conservative upper bound from token limits.
- Existing Gemini default `gemini-2.5-flash` is now deprecated according to Google's current model catalog. The new default is the stable `gemini-3.5-flash-lite`.
- Production read-only status on 2026-11-09: OpenAI available through the shared gateway; Claude and Gemini not configured. No paid production inference was attempted.

## Changes

Keep the existing static frontend, Supabase function name and public request shape. Add optional `rounds` (default 1, maximum 2). Provider order is sequential. OpenAI + Gemini with 2 rounds produces at most four replies, each seeing the immediately preceding participant. A failed turn stops the discussion. There are no automatic retries, recursive conversations, model fallbacks or synthetic replies.

The Forum-only function uses bounded official calls for all three seats. OpenAI uses `gpt-4.1-mini`, Claude retains `claude-sonnet-4-6`, Gemini uses `gemini-3.5-flash-lite`. The existing shared Cloudflare gateway is not edited. **Compatibility gate:** the new Forum OpenAI route requires server-side `OPENAI_API_KEY`; without it that seat stays unavailable. Reusing the opaque gateway would not establish a verifiable token/price ceiling. Configure this before any later rollout, or separately audit and constrain the gateway first. This draft does not claim that existing gateway credentials are available to Supabase.

## Server spending policy

- Fixed $2.00 USD daily limit, UTC, shared across all clients and three providers.
- At most 2 rounds, 3 providers, 6 calls per request; 700 output tokens per call (including Gemini thinking tokens).
- UTF-8 request size and prompt size bounds; generated prompt at most 12,000 bytes, plus 512 tokens of accounting headroom. No tools, search grounding, multimodal data, prompt caching writes or arbitrary model overrides.
- Reserve **$0.05 per scheduled call** atomically before any provider traffic. Maximum batch reservation $0.30; OpenAI + Gemini at two rounds reserves $0.20.
- Input/output rates per million tokens as checked 2026-11-09: OpenAI $0.40/$1.60; Claude $3/$15; Gemini $0.30/$2.50. Highest calculated call bound: `(12,512 × 3 + 700 × 15) / 1,000,000 = $0.048036`, below the reservation. Recheck pricing and token accounting before deployment and model changes.
- Full reservations are retained on success, partial failure, timeouts and ambiguous network outcomes; displayed reservations are not actual invoice amounts. This deliberately sacrifices utilization to avoid unsafe refunds. No automatic retry.
- Postgres global advisory lock; one active discussion across Edge isolates. Ten-minute crash lease; costs never expire with that lease. Per-minute global limit 6 requests; per-client limit 12 model calls/day. Hashed forwarding IP is an abuse signal, not authentication; rotating/spoofing it cannot bypass global spending/concurrency limits.
- Existing legacy ledger spend is included. A ten-minute UTC rollover overlap conservatively counts near-midnight requests against both days. Old function versions must be drained when rolling out the replacement.
- RPCs are service-role only. Private tables have RLS and no browser access. The browser cannot choose budget constants. Missing database service stops inference.
- Provider timeout 15 seconds including response JSON consumption; RPC timeout 10 seconds; discussion deadline 105 seconds stops starting new turns when insufficient time remains. Browser timeout 130 seconds. An aborted browser request never refunds reserved spend.

This is a Forum API usage ceiling under the pinned models and documented token prices. It does not cap taxes, exchange rates, unrelated provider-account usage, Music Studio usage, or provider price changes.

## Connection status, errors and data

A configured secret is not a connection check. A seat becomes verified only after a non-empty successful model response with valid usage accounting; verified status lasts 15 minutes and is bound to a server-only SHA-256 credential fingerprint. A provider failure invalidates verification. Status polling itself does not call models. Configured but unverified seats can be invited, so the first real reply verifies the route.

Return bounded error codes for timeout, quota/rate limit, provider payment required, invalid secret, blocked/empty output and budget rejection. Google 429 may represent quota, rate or billing conditions; do not mislabel it as confirmed insufficient balance. Upstream error bodies and stack traces are never returned or logged.

Database records contain only hashed client identity, reservation metadata, provider, recent usage counts, estimated cost and credential fingerprint. No API keys, prompts or generated content are written to server logs or database by this function. Existing user-created forum posts and responses remain in the user's browser storage. Provider processing/retention follows the provider account settings.

## Configuration and rollout gates

No secret values belong in chat, Git, HTML, or frontend configuration.

| Environment variable | Deployment location | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | **Non-production Forum Supabase project → Edge Functions → Secrets**, consumed by `runlu-forum-ai` | Gemini API secret |
| `OPENAI_API_KEY` | Same non-production Forum Edge Functions Secrets | Bounded Forum OpenAI route |
| `ANTHROPIC_API_KEY` | Same non-production Forum Edge Functions Secrets | Existing Claude seat, optional |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase-managed server environment | Budget RPC access; never frontend |

Only production/main currently exists in the connected Supabase project. Do not use it as an unapproved test environment. An existing authorized non-production project can be used, or a separately approved development branch can be provisioned. This PR does not create a billable branch or change production.

For a later non-production test:

1. Copy the existing legacy budget table schema into the test database (without user data); apply `supabase/schema/forum-ai-budget-v2.sql` there. This is a reviewed transactional bootstrap script, not a production migration already applied.
2. Configure the secrets above through Supabase Secrets. Deploy the reviewed function source to **that non-production project only** with JWT verification enabled.
3. Point a local/test copy of `forum-ai-config.js` to the test function and its publishable/anon key. Do not commit a production endpoint switch. Allowed browser origins must be explicitly scoped for the chosen test preview.
4. Invoke `{action:"verify",providers:["Gemini"]}` with a test project's public JWT. It reserves $0.05 and must return real text and usage; then `status` must report Gemini verified.
5. Post a harmless topic and invite Gemini. Then run OpenAI + Gemini, `rounds:2`; verify the four-reply order, predecessor context, usage and retained $0.20 reservation. Do not log prompts or keys in test reports.
6. Confirm provider error, budget exhaustion and concurrent rejection behavior in that isolated environment, then run Supabase advisors.
7. Keep this PR draft until those real integration checks are recorded. Production merge/deploy needs a later user instruction.

## Verification

```sh
npm ci --prefix tests/forum --ignore-scripts
npm test --prefix tests/forum
npm run test:db --prefix tests/forum
npx --yes deno@2.9.6 check supabase/functions/runlu-forum-ai/index.ts
node scripts/check-multilingual.mjs
```

Without `TEST_DATABASE_URL`, SQL tests use PGlite (PostgreSQL WASM) and explicitly skip the independent-connection race. PR CI supplies a clean PostgreSQL 17 database via `TEST_DATABASE_URL`; it runs the same schema plus 20 separate concurrent connections. CI never uses production credentials or deploys code. See the test report for observed results.

## Official references checked

- [Google model catalog](https://ai.google.dev/gemini-api/docs/models) and [stable Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).
- [Google Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.5-flash-lite).
- [Official OpenAI documentation: GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini) and [Chat Completions parameters](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).
- [Claude Sonnet 4.6](https://platform.claude.com/docs/en/models/sonnet-4-6/overview).
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets) and [changelog](https://supabase.com/changelog).
