# RUNLU Website Maintenance

## Branch policy

- `main` is the production baseline for runlu.ca.
- Use `release/*` for release preparation and `feature/*` for focused work.
- Avoid direct edits to `main` except emergency recovery.

## Release flow

1. Create a branch from current `main`.
2. Make focused changes.
3. Run the repository site checks.
4. Review the diff for content truthfulness, privacy, links, metadata, and product status.
5. Open a pull request into `main`.
6. Merge only after checks pass.
7. Verify runlu.ca after deployment.

## Site-integrity checks

- Check HTML pages recursively, including nested folders such as `notes/`.
- Confirm sitemap URLs resolve to repository pages.
- Check local scripts, stylesheets, and internal links for missing targets.
- Review canonical and Open Graph metadata when pages or assets move.
- Keep social-preview image URLs aligned with real deployed assets.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, or production secrets.
