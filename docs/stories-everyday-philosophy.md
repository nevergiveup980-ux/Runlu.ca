# Philosophy in Everyday Life — editorial handoff

- Chinese category: 生活中的哲学
- English category: Philosophy in Everyday Life
- Slug and filter URL: `notes.html#philosophy-in-everyday-life`
- Existing articles, category labels, URLs and SEO metadata remain unchanged.
- Article data currently lives in static HTML cards and separate `notes/*.html` pages, not a database.
- New cards in this category should carry `data-stories-category="philosophy-in-everyday-life"` in `#notes-index`.
- The category UI includes English, Chinese, French and Spanish using the existing language core and preference key.

## First article: awaiting confirmed manuscripts

- Chinese title: 人生是一场与无序的温柔较量
- English title: Life Is a Quiet Struggle Against Disorder
- Author: RUNLU
- Category: 生活中的哲学 / Philosophy in Everyday Life
- Status: blocked on author-confirmed complete Chinese original and corresponding complete English literary adaptation. Neither was found in the repository during this change.

No article page, article card, publication date, article URL or sitemap entry has been created. The empty category message is a category state, not substitute article content. Do not publish an outline, invented prose or placeholder as this article.

When manuscripts arrive, preserve them in full and review the distinction between thermodynamic entropy and literary metaphor. Entropy is a physical quantity; an isolated system's entropy does not decrease. People and households are open systems. Everyday untidiness, emotional difficulty and moral worth are not thermodynamic measurements, and physics does not establish a philosophy of life. If the confirmed manuscript blurs these boundaries, return the wording to the author for review rather than silently rewriting the approved text.

Follow the existing detail-page layout, language preference, return navigation and SEO conventions when adding the approved article. Complete French and Spanish editorial review under `MULTILINGUAL.md` before public release. Keep all prior article navigation intact.

## Verification — 20 November 2026

- JavaScript syntax and `git diff --check`: passed.
- Preservation checks: all 27 existing story/recommendation cards remain byte-for-byte identical; every previous link, SEO tag and local link target is preserved.
- Homepage quick-path and commerce guards: passed; no dependencies or services added.
- Desktop Safari: category filtering, Chinese language selection, existing Story 01 detail, inherited language preference and return to all stories checked.
- Safari with a 390 × 844 CSS-pixel iframe viewport: Chinese/English category state, all-stories restoration and long English navigation label checked visually. Navigation remains within its horizontal scroll container; the active control is scrolled into view after filtering or language changes. This is desktop WebKit viewport testing, not an iOS-device test. Native gesture automation was unavailable; real iPhone swipe/safe-area/landscape verification remains an acceptance check.
- Full-site `node scripts/check-multilingual.mjs`: fails on 9 pre-existing issues in unchanged files: both missing selector and missing language script in `drafts/frontiers-season-05-06-four-language-editorial-preview-v01.html` through `v04.html`, plus a missing standard selector in `view-048-when-ai-fails-can-humans-catch-it.html`. None is introduced by the four changed files.
- First-article detail/translation checks remain blocked on confirmed manuscripts.
- Local preview: `http://localhost:8765/notes.html#philosophy-in-everyday-life` while the preview server runs. No production deployment or merge is part of this change.
