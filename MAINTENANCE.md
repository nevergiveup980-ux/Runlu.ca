# RUNLU Website Maintenance

## Branch policy

- `main` is the production baseline for runlu.ca.
- Use `release/*` for release preparation and `feature/*` for focused work.
- Avoid direct edits to `main` except emergency recovery.
- Routine maintenance must stay on a maintenance branch until review and checks are complete.

## Release flow

1. Create a branch from current `main`.
2. Make focused changes.
3. Run the repository site checks.
4. Review the diff for content truthfulness, privacy, links, metadata, and product status.
5. Open a pull request into `main`.
6. Merge only after checks pass and explicit approval is given.
7. Verify runlu.ca after deployment.

## Routine public-site review

Check these areas on each maintenance pass:

- sitemap XML parses and every `runlu.ca` sitemap URL maps to a real repository page;
- internal links, scripts, and stylesheet references on sitemap-listed public HTML pages resolve correctly, including nested folders;
- `robots.txt` points to the canonical sitemap and `404.html` remains `noindex,follow`;
- canonical, description, Open Graph title/description/image, and structured metadata use real public URLs and existing assets;
- product-status wording matches the actual shipping state and does not overstate availability;
- Forum remains Human Only by default unless deliberately changed, with demo/live activity and AI connectivity stated truthfully;
- RUNLU Privacy/Support and product-specific Privacy/Support stay consistent with current behavior;
- maintenance documentation and CI checks remain aligned with the current public site structure.

Private or deployment-specific projects, including Cloudflare Workers, secrets, access controls, custom domains, analytics credentials, or other infrastructure, are outside routine website maintenance unless explicitly approved.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.
- Do not describe a release candidate as publicly released, and do not describe a released product as merely planned once its public status has been verified.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, or production secrets.
Never alter domain, deployment, security, access, billing, or paid-service configuration as part of routine maintenance without explicit approval.
