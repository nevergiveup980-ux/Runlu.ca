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
