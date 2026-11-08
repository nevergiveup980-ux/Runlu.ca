# RUNLU Growth Engine → RUNLU Pulse integration proposal

Status: design only; no collector endpoint, credentials, or production integration is assumed.

## Confirmed from repository
- RUNLU home page links to https://pulse.runlu.ca/.
- Lost Meridian landing page emits browser-only `runlu:growth` events in this draft PR.
- No event transport, persistence, or dashboard has been added by this PR.

## Preferred approach
Extend RUNLU Pulse if its existing data model and security design allow it. Do not deploy a second collector by default.

## Proposed minimal event contract
- `event`: `book_page_view`, `book_preview_click`, or `book_external_link_click`
- `book`: `the_lost_meridian`
- `source`: `x`, `tiktok`, `instagram`, `facebook`, `newsletter`, `other`, or `unattributed`
- `campaign`: a validated short campaign slug, or `none`
- `chapter`: integer 1–10 only for preview clicks; otherwise omit

## Required investigation before connecting
1. Identify RUNLU Pulse source repository, deployment configuration, and existing storage.
2. Determine whether Pulse already records page views and UTM source; avoid duplicate page-view ingestion.
3. Check if Pulse supports custom events and the required access controls.
4. Verify Cloudflare Pages/Worker routes and authentication without exposing secrets in client code.
5. Document data retention, bot protection, abuse limits and applicable privacy/consent requirements.
6. Define reporting separately for page views, preview clicks and external clicks; none proves sales.
7. Test on preview deployment before merging this PR.

## Release guardrails
- No raw URLs, full referrers, IPs, emails, names, or device fingerprints in event payload.
- Never place API secrets in public browser JavaScript.
- Do not send events to a guessed endpoint.
- Do not describe browser-only events as stored analytics.


## Investigation update — 2026-11-02

- Public request to `https://pulse.runlu.ca/` redirects to a Cloudflare Access authentication page. Pulse is access-protected; this does not reveal its backend implementation.
- The RUNLU homepage links to Pulse, but the inspected book page has no explicit analytics collector script.
- Accessible GitHub repositories did not show a clearly named Pulse repository. This is **not** evidence that Pulse has no repository or that it is nonfunctional.
- `runlu-command-center` describes an orchestration layer; do not assume it hosts Pulse.
- **Blocked:** identifying Pulse's source, storage and event ingestion mechanism without authorized access or deployment configuration.

## Next authorized checks

1. Inspect the Cloudflare dashboard for the `pulse.runlu.ca` hostname's Worker/Pages route and service name.
2. Trace that service to its source repository or deployment artifact.
3. Read its existing analytics schema and ingestion permissions.
4. Choose between a compatible first-party event adapter and no custom event collection.
5. Keep PR in draft until the end-to-end collector is verified.

No Cloudflare settings, credentials, production routes or analytics storage were modified during this investigation.
