# RUNLU FRONTIERS S05E06 — iPhone / Desktop Acceptance Pack
**Date:** 2026-11-20
**Preview under test:** `drafts/frontiers-season-05-06-four-language-editorial-preview-v04.html`
**Scope:** Self-contained editorial preview, not deployed to RUNLU public website.
**Result:** Static source inspection **12/12 passed**. Real browser/device acceptance **NOT RUN**.

## Static checks passed (12/12)
1. HTML doctype present
2. Responsive viewport metadata present
3. noindex,nofollow robots directive present (not an access control)
4. Four language tab controls
5. Four article panels
6. English, Chinese, French and Spanish tab/panel IDs match
7. Click-to-switch event handler present
8. Keyboard left/right arrow handler present
9. Four external scientific source links present
10. Editorial source notes not rendered in article body
11. No stray Markdown horizontal-rule paragraph at article end
12. Preview remains a draft file and has not been inserted into RUNLU navigation

**Interpretation:** These are code-level checks only. They do not demonstrate that iPhone Safari or a desktop browser renders or switches languages correctly. The `noindex` tag does not make a public GitHub repository private.

## iPhone hands-on acceptance (user or connected browser)
- [ ] Obtain the HTML file from GitHub using its file page > Raw > browser Share / Save to Files (wording varies with GitHub and iOS); if the file is displayed as source, download it first
- [ ] Open the saved HTML file in a browser-capable local preview or a controlled test hosting environment; iOS Files preview alone may not execute JavaScript, so failure there is not conclusive
- [ ] English opens by default; the full English essay is visible
- [ ] Tap 中文: Chinese appears and English is hidden
- [ ] Tap Français: French appears and Chinese is hidden
- [ ] Tap Español: Spanish appears and French is hidden
- [ ] Return to English: content and tab selection agree
- [ ] Check narrow portrait layout for horizontal overflow and text clipping
- [ ] Scroll each language to the final section; ensure no internal editorial notes are exposed
- [ ] Tap all four source links; confirm they open the intended external documents
- [ ] Check text legibility, heading spacing and tap target sizes

## Desktop hands-on acceptance
- [ ] Repeat four-language switching and scroll tests
- [ ] Check keyboard focus, ArrowLeft/ArrowRight tab selection and visible focus ring
- [ ] Check 100%, 150%, 200% browser zoom and responsive widths
- [ ] Confirm no console errors and no broken links

## Editorial approval gates
- [x] Four complete revised manuscripts
- [x] Core Québec / Alberta / WHO source verification report
- [x] Standalone V04 preview with four-language content
- [x] Static source checks (12/12)
- [ ] Native-quality language copyedit
- [ ] Actual iPhone browser acceptance
- [ ] Actual desktop browser acceptance
- [ ] User's explicit final editorial approval
- [ ] Public publication (only after approval)

## Operational constraint
Do not alter RUNLU public website navigation, public pages, production workflows or DNS merely to run this acceptance test. If a separately hosted preview is desired, first confirm an existing safe, no-cost test destination; a public GitHub raw URL is not equivalent to an executable hosted preview.
