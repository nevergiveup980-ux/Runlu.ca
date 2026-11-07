# RUNLU TWIST — Content provenance disclosure (2026-11-01)

Update: the first puzzle and its previously stale standalone explanations are now synchronized into local **1.1 (5)** in `cacfb81`. See [Build5 acceptance](TWIST-BUILD5-CONTENT-ACCEPTANCE.md) and [the remaining nineteen-item risk register](TWIST-CLASSIC-CONTENT-RISK-REGISTER.md). Build4 remains a historical candidate with the old first puzzle; no new upload occurred. The historical inspiration disclosure below remains unchanged.

## User-provided origin evidence
The product owner supplied a screenshot of a Facebook post by “Relatable Funny Memes” / Timilehin Oladejo showing a handwritten English riddle: a woman born in 1975 and died in 1975 at age 22, asking how this is possible. The owner explained that this Facebook image was the initial inspiration for asking ChatGPT to develop RUNLU TWIST. The first classic puzzle in the game's source uses this premise and a room-number solution.

This evidence shows the immediate inspiration and similarity, **not** that the Facebook poster originated the riddle, owns exclusive rights, or licensed the specific text to RUNLU. The image itself is not known to be bundled in the iOS app. Do not use the screenshot in the app or marketing without rights clearance.

## Required audit
- Log the first puzzle as externally inspired, source screenshot provided by owner; permission for verbatim text UNKNOWN.
- Audit the remaining 19 classic puzzles individually for wording, translations, explanations and third-party sources.
- Do not label the 20 curated classics as original RUNLU inventions.
- Prefer newly authored alternative wording and original explanation, or independently created puzzles, after checking rights and avoiding misleading claims.
- Verify the ten Logic Studio cases and UI artwork provenance separately.
- For Apple Q8/Q9, disclose that the idea originated with an online riddle shared by the owner and that ChatGPT/Codex assisted software development; do not conflate this with a commercial template service or claim that all game content was authored from scratch.
- The brand/content ownership, any external commissions, and app-submitter relationship require owner confirmation.

## Release gate
Do not claim copyright clearance, exclusive originality or a complete provenance audit until evidence is documented.

## 2026-11-01 — First puzzle replacement
- Commit `536199c3cc9c53d86477eca4502f11e90ec50322` replaced the Facebook-inspired first puzzle in both English and Simplified Chinese in `twist.html`.
- New question: “What can be opened without a key, closed without a lock, and shared without being split in two?” Answer: a conversation. Chinese wording and hints/explanations updated together.
- This was newly authored for this revision, but generic metaphorical riddle conventions are not exclusive; do not claim a legal originality determination or absence of similar riddles elsewhere.
- This is a source-branch change, NOT evidence that the installed iPhone Build 4 or the App Store-reviewed Build 3 contains the new puzzle.
- Before a new iOS build: sync the exact revised `twist.html` into the WKWebView bundle, assert that puzzle 1 matches in EN and ZH, run all ten Logic Studio cases, confirm old first question is absent from shipped assets, and record binary/build identifiers.
- For Apple Q1–Q9, keep historical inspiration separate from current shipped content and do not claim Build 4 was reviewed or uploaded.
