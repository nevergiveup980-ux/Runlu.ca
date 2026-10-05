# RUNLU Garden Pulse Feed v1

Privacy-safe public bridge from the private RUNLU Pulse worker to the LAB Garden Pulse experiment.

## Endpoint
`GET https://pulse.runlu.ca/garden-feed`

## Response
```json
{"schema":"runlu.garden-pulse.v1","activity":1,"recent":true,"bucket":"2026-10-05T20:00Z"}
```

## Rules
- Return aggregate activity only. `activity` is a coarse integer from 0–3, not a visitor count.
- `recent` only indicates whether the current time bucket contains qualifying human activity.
- `bucket` identifies the coarse time bucket and must not identify an individual request.
- Never return IP addresses, country/city, user agents, URLs/page history, identities, cookies, Access tokens, API tokens, account IDs, or raw analytics rows.
- Exclude bots using the same Pulse analytics filter.
- Use a coarse time window (recommended 1 minute or greater).
- Response should be cacheable briefly and expose CORS only to the RUNLU site as needed.
- Existing private Pulse routes and Cloudflare Access protection remain unchanged.

The Garden front end validates `schema`, `activity`, and `recent`. If the endpoint is absent, inaccessible, malformed, or times out, Garden remains explicitly in DEMO mode.
