# RUNLU Growth OS — iPhone acceptance evidence (2026-11-17)

Scope: isolated GitHub Pages preview at https://nevergiveup980-ux.github.io/runlu-growth-preview/ and RUNLU Website GA4 property. This record summarizes owner-supplied screenshots and screen recordings reviewed in conversation; original evidence is not committed to this repository.

## Observed on iPhone
| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Preview opens over HTTPS | PASS | Screenshot shows the independent preview page on github.io |
| Consent banner initially visible | PASS | Initial screenshot includes Accept / Reject / Privacy |
| Reject closes banner | PASS (UI) | Screenshots show banner absent after rejection |
| Rejected choice persists across refresh | PASS (UI) | Owner provided refreshed page without banner |
| Analytics choices reopens banner | PASS | Screenshot shows reopened consent UI |
| English, Chinese, French, Spanish banner labels | PASS (UI) | Screen recording and separate French screenshot show translations; French Accepter / Refuser / Confidentialité |
| Accept closes banner | PASS (UI) | Owner recording shows the banner dismissed |
| Revoke via Reject closes banner | PASS (UI) | Owner recording shows reopened settings and dismissal |
| GA4 receives preview page views | PASS | GA4 Realtime screenshot identifies title 'RUNLU Growth OS | GA4 Consent Preview' with 3 views; path '/runlu-growth-preview/' also appears |
| No GA4 network requests before consent | NOT VERIFIED | Requires browser network inspection; screenshot cannot prove absence |
| No GA4 network requests after revoke | NOT VERIFIED | Requires browser network inspection; screenshot cannot prove absence |
| One page_view per navigation | NOT VERIFIED | Three aggregate views do not establish exact event counts per navigation |
| Reload immediately after consent and revoke | PARTIAL | Persistence of rejection observed; full grant/revoke reload behavior not independently established |
| iPhone landscape, zoom, keyboard accessibility | NOT VERIFIED | Portrait screenshot only |

## Release gate
- PR #490 must remain Draft until privacy network behavior and any remaining release-critical checks are reviewed and the owner explicitly approves the merge.
- This preview is a public, separate GitHub Pages project. It is not the production RUNLU website.
- Preview consented visits can contaminate production GA4 metrics because the same measurement ID is used. Filter or segment the preview hostname in analysis.
- Do not infer network-level compliance from a UI screenshot or from a passing Node unit test.
- Do not change the production Pages source, CNAME, custom domain, or unrelated RUNLU Pulse.
