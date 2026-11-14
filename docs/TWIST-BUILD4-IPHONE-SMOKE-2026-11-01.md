# Build 4 physical iPhone installation and smoke test

Date: 2026-11-01 (America/Edmonton).
Candidate: RUNLU TWIST 1.1 (4), source `107ec9dd29b48a261b66e95988d27eedb7182f79`.
Device: JohnZ's iPhone, iPhone 16 Pro Max, iOS 27.2 (Device Hub identification).

The developer enabled Developer Mode. Device Hub no longer showed the gate. Installed the existing `DevelopmentExport/RUNLUTwist.ipa` with Add App, without uninstalling the application, replacing its container, resetting progress, or running DEBUG QA fixtures. Device Hub listed RUNLU TWIST 1.1 / ca.runlu.twist and Launch displayed the live game.

| Check | Result | Evidence / scope |
|---|---|---|
| Developer Mode gate | PASS | Gate removed; live device screen and installation available |
| Signed Build 4 IPA installation | PASS | Installation completed and application listed |
| Launch / white-screen regression | PASS | English game, Puzzle 01/20 and Reasoning Lab rendered |
| English to Simplified Chinese | PASS | Language menu selected Chinese; introduction, puzzle and controls changed correctly |
| Reasoning Lab | PASS | Hidden-assumption option selected; Chinese feedback shown |
| Reveal / Reflection | PASS | Puzzle 01 revealed; Reflection appeared; first choice selected; saved record 1/20 displayed |
| Classic answer / next puzzle | PASS | Room-number explanation rendered; self-report 'not yet' selected; Next opened puzzle 02/20 (towel question) |
| Studio wrong-answer branch | PASS | Challenge 1 green choice produced incorrect feedback and explanation identifying blue; choices locked |
| Studio next / correct branch | PASS | Challenge 2 Tuesday selected; correct feedback, Tuesday explanation and 1/2 score shown |
| Background and reopen | PASS (limited) | Home followed by Launch returned to Chinese puzzle 02/20; not a force-termination/cold-relaunch test |
| Full physical 20-classic / 10-Studio completion | NOT TESTED | Existing simulator coverage remains separate; do not transfer full coverage to this device |
| Physical cold restart / memory termination / upgrade migration | NOT TESTED | No uninstall or destructive fixture used |
| Physical flight mode / landscape / full VoiceOver / largest type | NOT TESTED | Developer hands-on acceptance pending |
| App Store distribution validation / upload | NOT TESTED | Local development installation only |

No new product defect confirmed. No source changes or new build needed. Existing simulator evidence and historical failures remain unchanged. This is successful installation and scoped smoke testing, not full developer/user acceptance.

Remaining work: developer hands-on flight-mode, landscape, VoiceOver, Dynamic Type, cold restart and full content walkthrough. Apple 4.3 / 4.2.6 differentiation, provenance/rights and account-app comparison evidence remains unresolved as documented in TWIST-BUILD4-FINAL-ACCEPTANCE.md. No App Store Connect upload, review submission or public release occurred.
