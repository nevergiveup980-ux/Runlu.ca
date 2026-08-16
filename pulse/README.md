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

Create a dedicated token for RUNLU Pulse with the minimum analytics read permission needed for Cloudflare GraphQL Analytics. Do **not** reuse a full-access token.

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

After deployment, protect `pulse.runlu.ca` with Cloudflare Access and allow only the owner's email/account. Keep the dashboard out of the public RUNLU navigation and sitemap.

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
- The browser calls only the Worker itself; it never receives the Cloudflare token.
- "Possible external" is deliberately labeled as a heuristic and must not be treated as a count of identified people.
