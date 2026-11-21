# RUNLU GROWTH OS — GA4 Integration V1

Status: planning / NOT DEPLOYED. Measurement ID: G-KVRWEFJMCR. Main website: https://www.runlu.ca/.

## Verified baseline
- The root index.html does not contain a Google tag installation.
- The root privacy.html does not yet explain Google Analytics collection.
- Existing RUNLU Pulse is linked from the homepage and must remain unchanged.
- No dedicated GA4 consent module was identified by filename in the current repository tree.

## Implementation requirements
1. Add a single shared GA4 integration script only to the public website pages that are in scope. Avoid tracking private Control Center, authenticated applications, and sensitive health forms unless separately reviewed.
2. Default analytics storage to denied before loading analytics tags; require explicit opt-in before analytics collection. Provide equally clear Accept and Reject choices, persistent choice and a way to change it. Evaluate Canadian and international privacy requirements before production.
3. Update privacy.html in all four languages with GA4 purpose, data categories, provider, consent choices, retention and contact details. Never send names, email addresses, message content, patient data or other personal identifiers as event parameters.
4. Preserve RUNLU Pulse and avoid double-installing GA4. Confirm that enhanced measurement and any custom events do not double count pageviews or clicks.
5. Track first-party events with a documented event schema: product_open (product_slug), publication_open (publication_slug), outbound_click (destination_domain). Avoid arbitrary URLs/query strings or personal data in event parameters. Start with aggregate website traffic, acquisition and engagement; do not infer 7-day/30-day retention without user identifiers and appropriate consent.
6. Verify with Tag Assistant and GA4 DebugView after consent; verify no analytics requests before consent or after rejection, and no duplicate page_view events. Check mobile Safari, language switching, internal navigation and privacy choice persistence.
7. Ship as a PR with screenshots and a verification checklist. Do not merge without explicit approval.

## Acceptance gates
- [ ] Consent UI and privacy text reviewed
- [ ] GA4 loads only when appropriate consent is given
- [ ] Rejection suppresses analytics collection
- [ ] Correct measurement ID G-KVRWEFJMCR
- [ ] Exactly one page_view per actual page load
- [ ] RUNLU Pulse unchanged
- [ ] Mobile Safari tested
- [ ] GA4 realtime test observed
- [ ] PR reviewed and approved before merge
