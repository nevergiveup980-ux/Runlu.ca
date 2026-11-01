# RUNLU TWIST Build 4 — Review Evidence and Go/No-Go

Status: working evidence register; NOT a claim of Apple compliance or approval.

Update 2026-11-01: see [the completed Q1–Q9 evidence audit](TWIST-APPLE-REVIEW-EVIDENCE-AUDIT.md). Q1/Q2 are now transcribed in TWIST-APPLE-NINE-QUESTIONS.md. The actual physical-smoke report commit is `62f103e` (the screenshot-based `62f1103e` below was a transcription error). Full physical acceptance and ownership/provenance confirmation remain incomplete. The audit also records the live developer-account app inventory, Shift metadata conflict, and updated agreement gate. Historical screenshot observations below remain as originally recorded.

## Confirmed from developer-provided Codex screenshot (2026-11-01)
- Codex reports Build 4 installed and opened on iPhone 16 Pro Max (iOS 27.2) without blank screen.
- Core manual checks reported PASS: EN/ZH switch, Reasoning Lab choice and feedback, Reflection after reveal, classic next puzzle, Logic Studio correct-answer explanation and next step, resume after background.
- Codex reported commit 62f1103e on PR #375. Independently verify git commit and iOS bundle before citing in review.
- Full 20/20 classic and 10/10 studio walkthrough, airplane mode, landscape, full VoiceOver and largest Dynamic Type were not yet verified in screenshot.
- Build 4 was not uploaded or submitted according to screenshot.

## Blocking evidence
- [x] Obtain full original Apple reviewer questions Q1 and Q2 (screenshot transcription recorded in `cd9380e`; live AX question body remains truncated).
- [ ] Obtain accurate response to all Q1–Q9, supported by project and developer-account evidence.
- [ ] Verify iOS binary provenance and app content ownership, including whether any commercial app generator/template was used.
- [ ] Compare TWIST with other apps under same developer account, especially SHIFT and WORDSHIFT, with actual feature inventories.
- [ ] Document test evidence: build number, device, OS, dates, named tests and failures, not invented external beta feedback.
- [ ] Review all classic riddles for reuse permissions, and any other third-party assets.
- [ ] Demonstrate concrete differentiating gameplay with screenshots/video, rather than asserting uniqueness.
- [ ] Finish offline, accessibility, all-content walkthrough and regression checks.

## Apple response guidance
- If current binary is compliant, follow review team's direction to respond to the existing rejection with all nine answers.
- If relying on substantial new features, verify Build 4 contents, prepare a new submission only when ready, and explain the changes transparently.
- Distinguish original logic challenges from curated classic riddles. Do not claim exclusive rights to generic puzzle mechanics.
- Never imply AI-assisted coding is itself prohibited by guideline 4.2.6; identify the actual content provider, submitter and tooling.

## Release gate
GO only after: zero critical functional failures, full content pass, offline/VoiceOver/large-text checks documented, reviewer questions complete, rights/code provenance reviewed, and owner approves upload.
