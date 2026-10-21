# RUNLU TWIST — Node 001 QA checklist

Status: development only. This checklist does not claim browser testing has passed.

## Manual acceptance on iPhone Safari

- [ ] Open the preview and verify no horizontal overflow at narrow screen width.
- [ ] Select 简体中文; reload; confirm the selected language persists.
- [ ] Reveal hint for puzzle 1; reload; confirm hint stays visible.
- [ ] Reveal answer for puzzle 1; confirm answer and Why the Twist explanation display.
- [ ] After reveal, select I got it or Not yet; confirm exactly one self-assessment is saved and the total updates.
- [ ] Reload and switch language; confirm self-assessment persists without affecting exploration points.
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

## Editorial acceptance

- [ ] Confirm 20 English and 20 Chinese prompts, hints, answers and explanations align.
- [ ] Check every hint for premature answer disclosure.
- [ ] Check localized wordplay for ambiguity (especially puzzles 1, 6, 11 and 18).
- [ ] Mark common classic riddles as curated, not newly invented original riddles.
- [ ] Confirm score wording makes clear that revealing an answer is not proof of a correct guess.

## Release gate

Do not merge this draft PR or publish a site navigation link until the manual acceptance items above have been completed. French and Spanish are not yet implemented.
