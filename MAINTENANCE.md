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

## Routine public-site review

For recurring maintenance, review the current production baseline before changing files:

- open pull requests and any stale/superseded maintenance branches;
- the latest Site integrity result on `main` and the same checks on the maintenance branch;
- sitemap-listed public pages, nested public pages, local links, scripts, and styles;
- canonical URLs, descriptions, Open Graph metadata, and referenced social-preview assets;
- product availability/version/status wording against the current public release state;
- Forum defaults, Demo/live labels, verified activity claims, analytics state, and AI-provider requirements;
- Privacy and Support wording for consistency with the corresponding product page and actual behavior;
- `sitemap.xml`, any declared auxiliary sitemap, `robots.txt`, and the public 404 page;
- maintenance documentation whenever the repository's public-site structure or integrity gates change.

Prefer a small focused maintenance diff. Record a discovered issue without rewriting large unrelated pages when the fix is better isolated in its own follow-up.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.

## Infrastructure boundary

Routine website maintenance must not change deployment configuration, domains/DNS, access/security policy, secrets, production data, or paid-service configuration without explicit approval. Infrastructure-sensitive projects should remain isolated from public-site maintenance changes.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, or production secrets.
