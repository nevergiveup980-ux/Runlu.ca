# RK-0007 — Preview technical checkpoint

Date: 2026-11-19
Branch: `editorial/rk-0007-cash-flow-brief-20261118`
Preview: `knowledge/editorial/RK-0007-PREVIEW.html`
Status: **technical checks passed; device review and publication approval pending**.

## GitHub Actions results
For commit `f097140cff544d376e41d9168bbaca3f72e39485`:
- RUNLU Knowledge validation — completed / success
- RUNLU Knowledge Publication Gate — completed / success
- Site integrity — completed / success

## Source inspection
- Four language objects (EN/ZH/FR/ES) are embedded.
- Viewport meta supports mobile width.
- Wide financial tables are in horizontally scrollable containers.
- `noindex,nofollow` and internal editorial / not published labels are present.
- Site language synchronization script is included.
- No third-party CDN dependencies detected.
- The file is on an editorial branch; it has not been merged into `main`, linked from the public index, or published as a public article.

## Remaining risks
- Static source inspection does **not** prove Safari layout, readability, or touch interaction on an actual iPhone.
- A GitHub file/blob URL displays source, not a rendered HTML preview. A safe rendered test URL is not yet provisioned. Do not tell the publisher that a working preview URL exists.
- The HTML contains source drafts but not editorial source notes as public citations. Source verification, translation review and rights/title checks remain open.
- GitHub workflow success does not constitute content approval or legal clearance.

## Acceptance sequence
1. Arrange a safe rendered preview without touching the production site or incurring costs.
2. On iPhone, check all four languages, table scrolling, navigation, and search query language overrides.
3. Resolve factual/source/translation issues.
4. Request explicit publisher approval before merging or linking the article.

Do not merge PR #498 merely because automated checks passed.
