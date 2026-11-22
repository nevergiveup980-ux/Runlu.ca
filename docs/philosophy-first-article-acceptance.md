# RUNLU STORIES — Philosophy in Everyday Life · First Article Acceptance

PR: #504 (draft)
Article: Life Is a Quiet Struggle Against Disorder / 人生是一场与无序的温柔较量
Target path: notes/life-is-a-quiet-struggle-against-disorder.html

## Verified from repository source (2026-11-21)

- [x] Four complete language drafts saved separately under docs/.
- [x] New detail HTML includes four language sections: en, zh, fr, es.
- [x] Each language has eight section headings (32 total).
- [x] Detail page includes the site's shared language selector and runlu-language.js.
- [x] Article includes a return link to notes.html#philosophy-in-everyday-life.
- [x] notes.html contains a new card linked to the article and marked data-stories-category="philosophy-in-everyday-life".
- [x] Existing story cards remain present; 28 cards including the new one.
- [x] Existing notes-stories.js supports hash-based category filtering.
- [x] No production/main merge performed.

## Editorial checks required before merge

- [ ] Human/editorial review of all four complete versions for fidelity, literary fluency and cultural appropriateness.
- [ ] Check scientific precision: the second law is stated for isolated systems; everyday life comparisons are explicitly metaphorical, not direct physical applications.
- [ ] Verify original prose and no reproduction of source video's protected expression.
- [ ] Approve title, closing lines, author attribution and whether to display a publication date.

## Browser and accessibility checks required

- [ ] On a real iPhone Safari, load notes.html#philosophy-in-everyday-life; verify only the new category card appears, no empty-state message.
- [ ] Open the new card; check all eight sections and readable spacing, including long French and Spanish headings.
- [ ] Switch en → zh → fr → es; verify entire body changes and language selection persists after returning.
- [ ] Test the return link, scroll behavior, mobile nav and keyboard focus.
- [ ] Run site multilingual checker and distinguish pre-existing failures from new changes.
- [ ] Validate canonical URL, metadata, and sitemap entry if required by the site's publishing process.

## Release gate

Keep PR #504 in draft until editorial and real-device checks are approved. Do not merge or publish merely because static source checks pass.

## Additional source verification — 2026-11-21

- [x] Independently evaluated 16 assertions against freshly fetched branch files (all 16 passed): four eight-section manuscripts, four article language blocks, 32 total HTML section headings, shared language script and selector, category return link, filtered index card, filtering code, CSS language rule, sitemap entry.
- [x] Execute the checked-in Node script in GitHub Actions. Latest confirmed success: run 44958249512 (2026-11-21), including four-language paragraph fidelity, language semantics, and scoped mobile stylesheet wiring.
- [ ] Complete actual Safari/WebKit device rendering and accessibility tests.

Release remains blocked on editorial and real-device review.

## Latest release-gate snapshot — 2026-11-21

- [x] Philosophy article's dedicated GitHub Actions workflow passed: https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/44958249512
- [x] Chinese entropy passage now explicitly states the comparison is a metaphor; both manuscript and HTML updated and paragraph parity rechecked.
- [x] Scoped mobile typography CSS committed and checked by dedicated CI.
- [ ] Human editorial review, originality comparison with the source video, and final publication sign-off remain open.
- [ ] Real iPhone Safari rendering and language/return navigation tests remain open. Source checks cannot certify real-device behavior.
- [ ] Repository-wide Site integrity and RUNLU Publication QA remain failing on unrelated Frontiers/VIEW material; resolve or document an approved exception before merging under the repository's release policy.

**Decision: HOLD draft PR #504; no merge or production publication authorized yet.**
