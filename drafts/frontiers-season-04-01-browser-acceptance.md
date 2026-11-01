# RUNLU Frontiers IV / Essay 01 — Browser acceptance checklist
Date prepared: 2026-11-01
Status: READY FOR BROWSER TEST; NOT EXECUTED

Preview pages:
- https://runlu.ca/drafts/frontiers-season-04-index-preview.html
- https://runlu.ca/drafts/frontiers-season-04-01-preview.html

Important: These URLs are proposed paths based on the repository structure. Their live availability has not been verified. Do not treat as published pages.

## Test A — desktop
1. Open the season index preview in a real browser.
2. Check the editorial-preview banner and ten episode entries.
3. Switch to English, Chinese, French, Spanish in turn. Confirm only the selected language edition is visible and the selector label matches.
4. Click episode 01 in each language. Verify the article opens and displays the selected language.
5. Click the back-to-index link and verify the same language remains selected.
6. Refresh, close and reopen the browser tab. Check language preference persistence.
7. Check headings, line wrapping, navigation, keyboard focus and links at desktop width.

## Test B — mobile
1. Repeat the four-language switch and article/index round trip at narrow width.
2. Confirm no horizontal overflow, clipped text, or inaccessible selector.
3. Confirm the article remains readable with enlarged text.
4. Verify focus/selection and back navigation with touch interactions.

## Test C — accessibility and failure handling
1. Run automated accessibility/HTML validation and inspect any errors.
2. Disable JavaScript and verify English fallback appears.
3. Test a browser mode where localStorage is unavailable; the current shared script reads localStorage without a try/catch, so this is a known risk to verify and fix if reproduced.
4. Confirm draft pages are not linked from the public Frontiers catalog.
5. Confirm noindex/nofollow is present; note that this is not an access-control mechanism.

## Release gate
- Four-language copy edit and factual review signed off.
- Browser/mobile tests passed with evidence.
- New public article and index routes use correct relative paths, canonical/social metadata, and live links.
- Public catalog updated only after approval.
- Do not remove noindex from draft preview or claim public release prematurely.

## Latest source inspection
- Four article editions found.
- Each edition has six h2 headings and 25 paragraph elements.
- Browser test has not been run.
