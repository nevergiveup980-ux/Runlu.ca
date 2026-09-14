# RUNLU Website Maintenance

## Branch policy

- `main` is the production baseline for runlu.ca.
- Use `release/*` for release preparation and `feature/*` for focused work.
- Avoid direct edits to `main` except emergency recovery.
- Routine maintenance must not change deployment, domain, DNS, secrets, authentication/security settings, production data, or paid services without explicit approval.

## Release flow

1. Create a branch from current `main`.
2. Make focused, reversible changes.
3. Run the repository site checks.
4. Review the diff for content truthfulness, privacy, links, metadata, and product status.
5. Open a pull request into `main`.
6. Merge only after checks pass and approval is explicit.
7. Verify runlu.ca after deployment.

## Weekly public-site review

- Review open pull requests and identify stale or infrastructure-sensitive work before changing anything.
- Run both the main `Site integrity` workflow and the focused `Public site integrity` check.
- Validate every `runlu.ca` URL in `sitemap.xml` against a real repository target.
- Check local links, scripts, and styles on sitemap-listed public HTML pages, including nested folders such as `notes/`, `book/`, `after-threshold/`, and other public sections.
- Confirm `robots.txt` points to the intended sitemap files and still excludes private operational areas.
- Confirm `404.html` remains `noindex,follow` and routes visitors back to RUNLU.
- Review canonical URLs, descriptions, Open Graph metadata, and social-preview asset paths on public pages.
- Confirm Privacy and Support wording matches the behavior and release status described on the associated product page.

## Truthfulness rules

- Never fabricate visitor counts, members, testimonials, analytics, product availability, or AI activity.
- Demo content must be labeled as Demo.
- Features that are not connected must say so.
- Product release wording must match the actual shipping state.
- Forum must remain Human Only by default unless a deliberate product change is approved.
- Forum live-member/discussion counts and analytics wording must reflect verified live data only.
- AI seats must not be described as live unless their provider connection is actually configured and verified.

## Metadata and product wording

- Canonical and Open Graph URLs should resolve to public RUNLU resources.
- Do not describe App Store review, release, pricing, subscriptions, or availability more strongly than the verified current state.
- Product Privacy/Support pages should be reviewed whenever the product status wording changes.

## Sensitive data

Never commit passwords, API keys, access tokens, private keys, recovery codes, production secrets, customer data, or private operational records.
