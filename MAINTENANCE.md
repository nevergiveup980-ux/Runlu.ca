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


## Integrity-check scope

- The shared four-language check applies to public pages that participate in the RUNLU four-language site contract.
- English-first SEO/editorial landing pages may remain English-first until localized; they must not be represented as four-language pages before translations exist.
- Standalone product, pilot, diagnostic, privacy, support, and protected application pages may own separate localization behavior and should be explicitly excluded from the shared-site language check when appropriate.
- A failing check should be fixed by correcting either the page or the documented checker scope; do not add fake translations merely to make CI green.

## Weekly review checklist

Review open pull requests, recent Site integrity runs, internal links, canonical/OG metadata, product-status wording, Forum claims, Privacy/Support consistency, sitemap.xml, sitemap-ai.xml, robots.txt, 404.html, and this maintenance document. Keep changes on a release/* or feature/* branch and do not merge during automated maintenance.
