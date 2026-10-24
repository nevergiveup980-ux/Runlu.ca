# RUNLU TWIST — Node 001 QA checklist

Status: development only. Chromium Playwright regression suite passed on commit b03e25e4 (GitHub Actions run 39897576369). iPhone Safari manual acceptance remains pending. Site integrity is a separate failing check; do not equate it with TWIST browser tests.

## Automated browser acceptance (Chromium)

- [x] Playwright suite passed in GitHub Actions run 39897576369, including 20-puzzle completion, score, review, reset, language persistence, self-report correction, saved-data filtering, keyboard focus, 320px/375px viewport checks, and hint persistence.
- [ ] Recheck the suite after any subsequent code changes.

## Manual acceptance on iPhone Safari

- [ ] Open the preview and verify no horizontal overflow at narrow screen width.
- [ ] Select 简体中文; reload; confirm the selected language persists.
- [ ] Reveal hint for puzzle 1; reload; confirm hint stays visible.
- [ ] Reveal answer for puzzle 1; confirm answer and Why the Twist explanation display.
- [ ] After reveal, select I got it or Not yet; confirm exactly one self-assessment is saved and the total updates.
- [ ] Reload and switch language; confirm self-assessment persists without affecting exploration points.
- [ ] Change self-assessment from I got it to Not yet and back; confirm totals update without duplicate entries.
- [ ] Load saved data with invalid assessment keys or an assessment for an unrevealed puzzle; confirm they are ignored.
- [ ] Complete all 20, use Review from start, and verify Previous/Next navigation preserves results.
- [ ] Confirm 5 exploration points if hint was used, or 10 if not.
- [ ] Tap Next, then Previous; verify answer state remains consistent.
- [ ] Complete all 20 puzzles; confirm progress 20/20 and final button disabled.
- [ ] Share result through Safari's native share sheet; verify URL points to the page actually opened.
- [ ] Reset progress, cancel confirmation, and verify nothing changes.
- [ ] Reset progress, accept confirmation, and verify score and completion reset.
- [ ] Close Safari, reopen the same page, and verify persistence when browser storage is available.
- [ ] Repeat the above using an iPhone home-screen shortcut; Safari and standalone storage may differ.
- [ ] Check keyboard focus and VoiceOver reading order.

## Editorial review notes (2026-10-24)

- Revised Chinese wording for puzzles 1, 4, 6, 11, 12, 16, 17 and 18 to avoid awkward literal translations and overly revealing hints.
- Curated-classics disclosure is present in the visible score explanation; no originality claim is made.
- Browser regression suite passed after the previous content change (commit ff6bfec, run 40088688945); current copy-edit commit still requires a new run.
- Human bilingual editorial acceptance remains open; this note is not a completed sign-off.

## Editorial acceptance

- [ ] Confirm 20 English and 20 Chinese prompts, hints, answers and explanations align.
- [ ] Check every hint for premature answer disclosure.
- [ ] Check localized wordplay for ambiguity (especially puzzles 1, 6, 11 and 18).
- [ ] Mark common classic riddles as curated, not newly invented original riddles.
- [ ] Confirm score wording makes clear that revealing an answer is not proof of a correct guess.

## Release gate

Do not merge this draft PR or publish a site navigation link until the manual acceptance items above have been completed. French and Spanish are not yet implemented.
