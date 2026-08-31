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
6. Merge only after checks pass and explicit approval when required.
7. Verify runlu.ca after deployment.

## Routine integrity review

- Check JavaScript syntax and the four-language validation before release.
- Check internal links recursively, including nested public folders such as `notes/`, `book/`, and `last-one-to-leave/`.
- Confirm every `runlu.ca` URL in `sitemap.xml` maps to an actual public page in the repository.
- Confirm `robots.txt` points to the canonical sitemap and the 404 page remains `noindex,follow`.
- Review canonical URLs, Open Graph metadata, and social-preview image paths for consistency.
- Keep Privacy and Support wording aligned with the actual behavior and release state of each product.
- Treat private or separately deployed projects such as `pulse/` as outside routine public-site maintenance unless explicitly approved.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.
- Forum remains Human Only by default unless the visitor explicitly invites AI; live counts and AI-seat status must reflect verified reality.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, or production secrets.
