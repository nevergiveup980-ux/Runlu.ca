# Build 5 — physical iPhone content check

Date: 2026-11-01 (America/Edmonton). Device: JohnZ's iPhone, iPhone 16 Pro Max / iOS 27.2 as identified by Device Hub.
Candidate: existing RUNLU TWIST 1.1 (5), implementation `cacfb81`; no rebuild or code modification in this check.

The owner reported Developer Mode enabled. Device Hub exposed app management, initially with a screen-connection timeout. Dismissed the timeout, selected the exact existing `outputs/Build5Content-2026-11-01/DevelopmentExport/RUNLUTwist.ipa`, installed using Add, and launched RUNLU TWIST. No uninstall, container replacement, reset, DEBUG fixture or upload was used. The live new question/answer/standalone explanation verified that the installed app contains the replacement rather than the old Build4 content. Device Hub displays version1.1; Build5 identity comes from the selected previously validated IPA, not a build number displayed on the game screen.

| Check | Result | Actual observation / limit |
|---|---|---|
| Development IPA install / launch | PASS | Selected Build5 IPA; new content rendered; no white screen |
| Retention across in-place install | PASS (scoped) | Chinese language, classic revealed1/20, points10, self-report0/1, Reflection1/20, and Studio challenge2 with score1/2 remained visible; not exhaustive migration testing |
| Chinese first question | PASS | Key/lock/sharing metaphor question shown at first puzzle |
| Chinese answer and standalone explanation | PASS | Answer begins 一段对话; explanation describes starting/ending/sharing communication, not room numbers |
| English switch / first question | PASS | Native menu selected English; same replacement question rendered |
| English answer / standalone explanation | PASS | A conversation; opening/closing means starting/ending; sharing means participating rather than dividing an object |
| Old riddle in displayed first question/explanation | PASS (scoped) | Neither inspected language showed1975/room-number content; package-wide static scan remains separate evidence |
| First-question hint on physical device | NOT TESTED | Existing save already marks first question revealed, so hint is disabled; did not reset data. VM/WK simulator hint checks passed in previous report |
| Fresh reveal-button interaction on physical device | NOT TESTED | First question inherited completed state; checked displayed answer rather than claiming a fresh reveal tap |
| Full20/10, flight mode, landscape, full VoiceOver/max type, forced termination | NOT TESTED | This was a scoped content/install check, not full physical acceptance |

Existing18/18 VM and9/9 simulator results are unchanged, not rerun or counted as new phone tests. No new defect confirmed. All19 remaining classic rights remain UNKNOWN, as do unresolved provenance/account/product-differentiation items in the evidence audit. Installation success does not clear Apple4.3/4.2.6 or establish independent Beta feedback.

IPA SHA256: `dbd605a04aa3edf2355de506383e762b9b7706b1ae66d1e9f8652c31b6eee443`.
HTML SHA256 previously validated in that package: `4aff2be687bfd13d7c8daab592bc34501142f3bf60eabfa0c73e559e7761cadf`.

Current Developer Mode gate resolved for this installation. Earlier blocked observations remain historically correct. No App Store Connect upload, Apple reply, review submission or public release occurred.
