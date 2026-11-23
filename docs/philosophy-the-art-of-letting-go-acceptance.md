# RUNLU STORIES — Philosophy Essay 03 Acceptance Record

**Work:** 《人生最难的，不是得到，而是懂得放下》 / *The Art of Letting Go*  
**Branch:** `editorial/philosophy-letting-go-20261122`  
**Pull request:** #507 (draft; do not merge without explicit approval)  
**Review date:** 2026-11-22  
**Review scope:** repository source and GitHub Actions; **not** a physical iPhone or production browser test.

## Verified

- Four full editorial manuscripts are committed in Chinese, English, French and Spanish; each has eight sections.
- The article page `notes/the-art-of-letting-go.html` has four language-specific sections and matching language-specific H1 titles.
- The article has a single shared language selector and a mobile viewport declaration.
- `notes.html` has exactly one new category card linking to the third essay.
- The sitemap includes the new article URL.
- The article canonical URL is `https://runlu.ca/notes/the-art-of-letting-go.html`.
- The page no longer contains the second essay's English H1 title.
- The independent essay-03 script runs 30 assertion calls in source and static layout checks.
- GitHub Actions `RUNLU Stories Philosophy Article Checks` succeeded for commit `f33f547c772865d4654fdacd5f542571b0809af3`; this workflow also runs essay-01 and essay-02 regression scripts.

## Other workflows — not passing

- `RUNLU Publication QA`: VIEW 048 lacks required evidence/limits content.
- `Site integrity`: missing standard language selectors on several Frontiers preview/candidate pages and VIEW 048/049.
- These failures were reported in the previous workflow logs and do not name the new essay-03 article. They remain unresolved; do not suppress or bypass checks.

## Outstanding before release

1. Independent editorial proofread in each language: grammar, idiom, philosophical precision and natural reading rhythm.
2. Actual iPhone Safari testing: default English, all four language choices, readable layout, back-navigation, category filter, and refresh behavior.
3. Accessibility and desktop-browser verification beyond static source assertions.
4. Reviewer approval and decision whether the unrelated site-wide failures must be resolved before merge.
5. Merge only after explicit user instruction, then verify the live URL and cache propagation.

## Release rule

**Status: prepared for human acceptance; not published.** A successful source-level CI run is not a substitute for browser or editorial acceptance. No changes to the production branch are authorized by this record.

## Post-edit verification — 2026-11-22

- Chinese wording refined: “自我解释” → “对自己的理解”.
- Spanish wording refined: “a la vida sobre la que todavía podemos actuar” → “a aquello que todavía está en nuestras manos”.
- Both changes were applied to their manuscript and corresponding HTML paragraph.
- GitHub Actions `RUNLU Stories Philosophy Article Checks` passed again on commit `a09664c4f5d95aa97cd8a6c5edf123309dc7160f` (after both editorial corrections).
- Site-wide `RUNLU Publication QA` and `Site integrity` remain failed. No new claim of whole-site acceptance is made.
- Actual iPhone Safari, desktop-browser, accessibility and final literary human review remain pending.

## User iPhone preview acceptance — 2026-11-22

- The owner explicitly reported **“验收过关”** after opening the isolated four-language iPhone preview.
- Preview path: `https://nevergiveup980-ux.github.io/runlu-growth-preview/editorial/the-art-of-letting-go/`.
- This approval covers the isolated preview reading experience, not a verified live production deployment.
- Production merge and publication are still pending an explicit release decision; unrelated site-wide CI failures remain visible.
