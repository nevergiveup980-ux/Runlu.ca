# RUNLU Website Maintenance

## Branch policy

- `main` is the production baseline for runlu.ca.
- Use `release/*` for release preparation and `feature/*` for focused work.
- Avoid direct edits to `main` except emergency recovery.

## Release flow

1. Create a branch from current `main`.
2. Make focused changes.
3. Run the repository site checks.
4. Review the diff for content truthfulness, privacy, links, and product status.
5. Open a pull request into `main`.
6. Merge only after checks pass.
7. Verify runlu.ca after deployment.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, or production secrets.

## Weekly audit notes · 2026-10-26

- Main's latest reviewed Site integrity run (40267811438) failed on ten localization
  checks: eight missing French/Spanish attributes in the Control Center's newly
  added Private Chronicle card and two false shared-switcher requirements for the
  Chinese-only private archive. Pages build succeeded independently.
- The maintenance branch fills the eight translations and scopes the checker to
  the private archive's actual architecture, while retaining a basic noindex and
  authenticated-read wiring check. **Noindex does not secure a document.**
- The private archive's first chronicle draft is embedded in public client-side
  JavaScript. Database records require login, but the bundled draft can be read
  without logging in. The page now states this limitation; do not describe the
  bundled draft as access-controlled. Any move to server-only storage requires a
  separate privacy/data-migration review.
- Repository sitemap inventory at audit time: 218 public sitemap entries and
  65 AI sitemap entries; all targets resolved to tracked repository files, with
  no duplicate or off-site loc entries in either list. This is a **repository
  existence check**, not an HTTP availability guarantee.
- Forum still shows zero verified live members and discussions, no connected live
  analytics, and a demo/beta label. No live activity was inferred.
- Privacy and Support each contain four language sections and working
  repository-relative links for the inspected product policy/support entries.
  Robots still declares both sitemaps and excludes named private routes;
  404 retains noindex,follow.
- 34 open pull requests were present; old maintenance drafts are not assumed
  safe to merge without rebase, diff review, and fresh checks.
- Existing workflow's local-link step checks only root-level HTML, and it only
  parses sitemap.xml. Nested-page links, sitemap-ai.xml, external HTTP responses,
  and rendered client-side interactions need dedicated coverage. Do not report
  them as comprehensively verified until checked.
- Never automatically merge or update production/deployment/security settings
  during routine maintenance.
