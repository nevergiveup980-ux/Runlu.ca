# RUNLU Books distribution page — release verification

Scope: PR #410, `book/index.html` and `book/where-to-read.html`.

## Verified from repository source
- The new distribution page is linked from the existing books index.
- It uses the same `runlu_site_language` preference as `runlu-language.js`.
- The Glass Throne page already contains the Canadian Apple Books URL `https://books.apple.com/ca/book/the-glass-throne/id6821470921`.
- Readmoo review-pending is not presented as an active purchase listing.
- The page distinguishes storefront count from book sales.

## Must check before merging
- [ ] Open a branch preview of `/book/` on iPhone and desktop.
- [ ] Switch EN → 中文 → Français → Español on the bookshelf, open the new page, and confirm the language persists.
- [ ] Confirm all four book cards fit narrow screens without horizontal overflow.
- [ ] Open The Glass Throne internal detail page and return to the bookshelf.
- [ ] Open the Canadian Apple Books link and confirm title, author, language, region and purchase availability.
- [ ] Confirm the current Readmoo public title URL and review status, then replace text-only status with a verified direct link.
- [ ] Confirm Google Play Books public URLs per title and edition before adding purchase CTAs.
- [ ] Check that the new page is indexed only when public availability and metadata are ready.
- [ ] Verify existing home navigation, book links, and language switcher remain intact.

## Release decision
Keep PR #410 as draft until the browser checks and retailer verification are complete. A GitHub commit alone does not mean the site has been deployed or tested. Do not use an unverified retailer URL or invent a book listing.
