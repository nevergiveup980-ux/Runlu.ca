# RUNLU Pulse V0.1

Private, read-only traffic dashboard for `runlu.ca` using Cloudflare Web Analytics / RUM.

## What it shows

- Page views and Cloudflare visits
- 1 / 7 / 30 day ranges
- Daily traffic rhythm
- Top pages, with `/` and `/index.html` combined as **Homepage**
- Countries
- Browsers
- Devices
- Referrers
- A cautious **Possible external** signal based on traffic outside the configured home country

The dashboard does not request visitor identity or IP addresses and excludes traffic marked as bots by Cloudflare Web Analytics.

## Architecture

`pulse.runlu.ca` → Cloudflare Worker → Cloudflare GraphQL Analytics API

The Worker serves both the private dashboard and its same-origin `/api/analytics` endpoint. The Cloudflare API token never appears in browser JavaScript.

## Required Cloudflare token

Create a dedicated token named `RUNLU Pulse Analytics Read` with only:

- Permission: **Account** → **Account Analytics** → **Read**
- Account resources: include only the RUNLU Cloudflare account
- No zone edit, DNS, Workers, Access, billing, or other permissions

Do **not** reuse the Full Access OAuth connection or another broad token.

Store it only as the Worker secret `CF_ANALYTICS_TOKEN`.

The Cloudflare account ID is stored as a second Worker secret, `CF_ACCOUNT_ID`, so it is not baked into the public repository.

## Deploy from the `pulse` folder

```bash
npm install
npx wrangler login
npx wrangler secret put CF_ANALYTICS_TOKEN
npx wrangler secret put CF_ACCOUNT_ID
npx wrangler deploy
```

The Wrangler configuration attaches the Worker to the custom domain `pulse.runlu.ca`.

## Protect the dashboard

After deployment, enable Cloudflare Access for the account and create a self-hosted application for exactly `pulse.runlu.ca`. Add one **Allow** policy whose include rule is the owner's exact email address. Do not use an email-domain rule. Keep the dashboard out of the public RUNLU navigation and sitemap.

The Worker also sends `X-Robots-Tag: noindex, nofollow, noarchive` and includes a matching HTML robots directive.

## Local test

Copy `.dev.vars.example` to `.dev.vars`, fill the two local values, then run:

```bash
npm install
npm run dev
```

Never commit `.dev.vars` or a real API token.

## Safety model

- Analytics query only; no DNS, Worker, Pages, WAF, billing, or zone settings are changed by the dashboard.
- Token is stored as an encrypted Worker secret.
- Account ID is stored as the encrypted Worker secret `CF_ACCOUNT_ID`.
- `RUNLU_HOME_COUNTRY` uses Cloudflare's ISO country code (`CA`) so Canadian traffic is not mislabeled as possible external activity.
- The browser calls only the Worker itself; it never receives the Cloudflare token.
- "Possible external" is deliberately labeled as a heuristic and must not be treated as a count of identified people.

## Analytics range repair (2026-11-10)

The active entrypoint is `src/index-canonical.js` → `index-lifetime.js` →
`index-clean.js` → `index.js` (HTML). Fixes must follow this chain; changing the
unused base API alone does not change production analytics.

- Today, 7 days and 30 days use `/api/analytics?days=1|7|30`, with calendar-day
  boundaries in `RUNLU_TIME_ZONE` (default `America/Edmonton`, including DST).
- All Time uses `/api/lifetime`. It means **available retained history since
  RUNLU_HISTORY_EPOCH**, not an archive of expired records. Responses and the UI
  show actual coverage and explicitly indicate retention clipping. Empty results
  are HTTP 200 with `meta.empty: true`, zeros and an explicit UI message.
- The previous lifetime query requested the entire epoch-to-now interval in one
  call. This can exceed the dataset's duration or lookback limits. Its generic
  error concealed the distinction. A live root-cause confirmation still requires
  an authorized Cloudflare API response.
- Both APIs now read account `settings.rumPageloadEventsAdaptiveGroups`:
  `enabled`, `maxDuration`, `notOlderThan` and `maxPageSize`. Values depend on
  dataset/account plan; do not hardcode an assumed 30-day or six-month retention.
- Queries use `rumPageloadEventsAdaptiveGroups` under `viewer.accounts`, with
  account ID, host and bot filters. They use non-overlapping half-open intervals
  (`datetime_geq`, `datetime_lt`), at most one day and at most `maxDuration`.
  Adaptive RUM counts retain Cloudflare's sampling/visit semantics; visits are
  not unique people. No identity fields, cookies or new tracking are requested.
- Group limits are not cursor pagination. At the row cap, recursively split the
  time interval and merge groups; discard the saturated parent result. Never
  treat truncated top-N page rows as complete internal/public totals. Unresolvable
  saturation returns `RESULT_LIMIT`. A 160-query budget returns `QUERY_LIMIT`
  instead of partial success; unusually large retained histories may need a
  narrower epoch or a larger architectural change. No historical storage added.
- Runtime secrets are **CF_ANALYTICS_TOKEN** and **CF_ACCOUNT_ID**.
  `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions authenticate
  deployment only; they do not configure the Worker's analytics secrets. Public
  vars: `RUNLU_HOST`, `RUNLU_HOME_COUNTRY`, `RUNLU_TIME_ZONE`, `RUNLU_HISTORY_EPOCH`.
- Structured errors distinguish configuration (503), permission/account access
  (403), network/timeout, API/schema, time range, quota and result/budget limits.
  Safe diagnostics include stage, HTTP status and, when supplied, CF-Ray. Raw
  upstream messages, exception objects and credentials are neither logged nor
  returned. Check errors in the browser Network response, then verify the named
  configuration/permission in Cloudflare. No extra permissions should be needed
  beyond Account Analytics Read scoped to the correct account.

Official references:
[GraphQL limits](https://developers.cloudflare.com/analytics/graphql-api/limits/),
[dataset settings](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/).

Validation:

```sh
npm test
npm run check # Wrangler dry run only
# Optional UI check with Playwright installed and a system Chromium:
PULSE_CHROMIUM_PATH=/usr/bin/chromium node test/browser.mjs
```

Tests use synthetic responses, never production credentials. The browser test
checks all four buttons, data/empty/error states and recovery. Real production
query verification requires an authorized Access session and runtime credentials;
local mocks cannot establish that deployed secrets, permissions or schema work.

The Pulse deployment workflow runs on pushes to `feature/runlu-pulse-v0.1`.
Keep this repair on its separate branch pending approval: merging the PR into
that branch would trigger deployment. Do not merge or run the deployment workflow
without explicit production approval. RUNLU main-site files are unchanged.
