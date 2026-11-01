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

## Weekly read-only audit checklist

- Record the exact main SHA and latest Site integrity / Pages Build conclusions; a green CI result does not prove every live interaction or external URL works.
- Review open PRs for stale branches and overlapping changes; do not close, merge, or rebase without separate approval.
- Check internal and external links, canonical/description metadata, both sitemaps, robots.txt, and 404 noindex behavior. Note whether checks are static or live.
- Compare product-status wording with verified release evidence; distinguish development, pilot, submitted for review, and released.
- Confirm Forum does not imply unverified live members, discussions, or analytics.
- Compare Privacy and Support pages for contradictions; do not expose private operational content.
- Keep findings and unresolved items in the maintenance report, and propose only low-risk changes on feature/* or release/*.
- Never modify deployment, domain, security configuration, private records, or paid-service settings as part of routine maintenance.
