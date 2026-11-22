# RUNLU STORIES — Philosophy Essay 02 · Acceptance Record

**Title:** True Wealth Is the Freedom to Choose / 人生真正的富有，是拥有选择的自由

**Branch:** `editorial/philosophy-wealth-freedom-20261121`

**PR:** #506 (draft; do not merge until final approval)

## Verified

- All four complete manuscripts exist (English, Chinese, French, Spanish).
- Each manuscript has 8 sections and 58 body paragraphs.
- Compared all 232 HTML paragraphs with their respective manuscript text: no mismatches.
- All 32 section headings match.
- The draft article has one language-specific section and H1 per language.
- The RUNLU Stories category card and sitemap URL are present in the draft branch.
- Dedicated GitHub Action `RUNLU Stories Philosophy Article Checks` passed for commit `82b85635b2a15b99cdb1172f0cec6e68c223fca6` (run 44984034705).

## Unrelated repository-wide failures (investigated, not fixed in this PR)

- `RUNLU Publication QA` run 44984034691 fails because the VIEW 048 evidence/limits block is missing required evidence.
- `Site integrity` run 44984034696 reports 12 issues: missing language selectors/shared script in Frontiers preview/candidate drafts and missing standard language selectors in VIEW 048 and VIEW 049.
- These are separate site-content issues. Do not weaken or bypass the checks. Resolve separately or explicitly decide the publication policy.

## Outstanding before release

- Human editorial review for naturalness, argument balance, and cultural appropriateness of all four languages.
- Browser and iPhone Safari testing: switching languages, wrapping long headings, navigation, and article index filter.
- Confirm whether site-wide failing checks block merge by branch protection; if so, fix them in a separate scoped PR.
- Final user approval; then mark PR ready and merge. Do not claim public deployment until verified.

**Status:** Content parity and dedicated source-level checks passed. Human and device acceptance outstanding. Not published.

## 2026-11-21 — Latest automated acceptance

- Commit `f1e9521c9562a739e585a7da1faf71c7e23a4074`: `RUNLU Stories Philosophy Article Checks` **success**, run `44985049200`.
- This run includes both essay regression scripts plus source-level mobile viewport, language selector, return-navigation, and article-card assertions.
- `Site integrity` and `RUNLU Publication QA` remain failing in the same commit; their earlier diagnosed issues concern Frontiers drafts and VIEW 048/049, not the philosophy article.
- **No public browser preview is established for this unmerged branch.** Do not instruct the reviewer to test the production URL as though essay 02 were published.

### iPhone Safari final acceptance (after a safe preview URL is available)

1. Open the **preview URL**, not the production article URL. Check portrait and landscape: no sideways page overflow, headings wrap, body remains readable.
2. Change English → 中文 → Français → Español → English; verify title, all eight section headings, and body text switch consistently.
3. Use the article's back-to-category link and confirm both philosophy cards appear in the filtered Stories list.
4. Return to essay 01 and verify its language selector still works.
5. Confirm no accidental external navigation, broken links, or empty language blocks.

**Release gate:** require safe preview URL, reviewer sign-off, and explicit merge approval. Do not bypass the two unrelated site-wide failing checks without an approved remediation.
