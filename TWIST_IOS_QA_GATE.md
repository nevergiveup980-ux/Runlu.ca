# RUNLU TWIST — iPhone QA & Apple resubmission gate

Status: **NOT DEVICE-VERIFIED / NOT APPROVED FOR RESUBMISSION**
Branch: `feature/twist-apple-review-remediation` · PR #375
Scope: `twist.html` and the **separately packaged iOS app**. Web source updates do **not** automatically update the installed WKWebView app.

## Test record (complete on a real iPhone)
- Tester / date / iPhone model / iOS version:
- App version and build number:
- Build source commit SHA:
- Distribution method (TestFlight / local):
- Portrait screenshot(s):
- Landscape screenshot(s):
- VoiceOver recording or observation:
- Defects and issue links:
- Final outcome: PASS / FAIL / BLOCKED

## Required device checks
- [ ] Install a new iOS build containing the target commit; verify its version/build and embedded HTML match.
- [ ] Cold-launch and resume from background without blank screen or crash.
- [ ] Navigate all 20 original puzzles; inspect language switch EN ↔ 中文 and persistence after app restart.
- [ ] Puzzle #4: move four artwork tiles, undo, check clue indicators, submit correct `A–C–D–B`, and submit an incorrect sequence in a fresh reset.
- [ ] Puzzle #8: move three route stops, undo, submit valid `A–C–B` and `C–A–B` (separate resets), and submit an invalid route.
- [ ] Confirm both puzzle submissions remain disabled until their corresponding verified-answer attempt is recorded.
- [ ] Confirm submitted sequences lock, and reset clears ordering, route, verified answers, reasoning and reflections while preserving Logic Studio progress.
- [ ] Force-close/reopen mid-puzzle: sequence and submitted state restore; one-step undo history does **not** restore.
- [ ] Inspect small-width layout (320–350 CSS px where testable), standard iPhone portrait, landscape, and larger accessibility text: no clipping, overlap, horizontal scrolling or unreachable buttons.
- [ ] Verify arrow buttons and action buttons have usable touch targets (at least 44 CSS px high); test with touch, not only desktop simulation.
- [ ] With iOS VoiceOver enabled: read puzzle instructions, tile/position labels, movement buttons, move feedback, undo feedback and submission result. Verify no missing or repeated result announcement; verify focus remains meaningful after tile rerender.
- [ ] Check screen reader and visual focus behavior after switching languages and after reset.
- [ ] Check offline launch and any network-dependent features explicitly; record expected vs actual behavior.
- [ ] Capture reproducible evidence for every failure; do not mark a test passed based solely on JavaScript simulations.

## Apple review readiness — separate from functional QA
- [ ] Confirm the app offers distinctive, substantive functionality beyond a generic website wrapper or puzzle template; assess Apple guideline 4.3 (Spam) and 4.2.6 (App Generation Services) concerns against the rejection details.
- [ ] Verify all App Store screenshots and metadata match the actual packaged build and clearly demonstrate original interactive gameplay.
- [ ] Prepare concise review notes describing original puzzle mechanics, Logic Studio, bilingual gameplay and what changed since rejection.
- [ ] Verify privacy disclosures, links, app navigation and support information against the packaged app.
- [ ] Decide whether PR #375 is ready to merge **only after** device QA and remediation evidence are reviewed.
- [ ] Archive tested build number, commit SHA, screenshots and tester sign-off before resubmission.

**Release gate:** No merge, build-complete claim, device-pass claim, or Apple resubmission claim without recorded evidence. Apple acceptance remains Apple's decision.

## Automated/simulated regression evidence (2026-11-10)

The JavaScript DOM simulation passed **14/14 checks** across puzzle #4 and #8: EN/中文 switching before submission, persisted submission, Chinese correct-result rendering after submission, live-region disabled after submission, locked controls after reopening, and preserved sequence on reopening. This is **not** an iPhone, WKWebView, VoiceOver, or TestFlight result. The actual device checkboxes above remain unchecked.

When executing the real-device test, record the exact commit and app build; do not infer packaged app behavior from the website's current GitHub branch.
