# RUNLU TWIST iOS 1.1 candidate

Existing SwiftUI + local WKWebView iPhone app, iOS 17+. Bundle ID `ca.runlu.twist`, team `F2J2Z8H2L4`, icons and canonical local-file loading retained. Local candidate configuration is **1.1 (4)**; it has not been uploaded or submitted.

Open `RUNLUTwist.xcodeproj` and choose an iPhone simulator. No server or package dependencies are required. The bundle includes 20 bilingual classic riddles, Reasoning Lab, Reflection, ten Logic Studio challenges, privacy and support pages.

The authoritative gameplay source is repository-root `twist.html`. After editing it, run from repository root:

```sh
python3 ios/RUNLUTwist/Scripts/sync-game.py
node ios/RUNLUTwist/Scripts/test-game-logic.cjs
python3 ios/RUNLUTwist/Scripts/verify-package.py
```

`sync-game.py` applies the native styling, offline policy, local privacy/support links, allowlisted native storage and text-only sharing. Do not hand-edit the bundled gameplay copy. Native backup covers all five gameplay/language keys. Build 2's canonical bundle-path fix remains.

Run Xcode's Product > Test for actual WKWebView and touch regressions. `-twist-qa-suite` and `-twist-qa-corrupt` are DEBUG-only test launch arguments; they alter simulator test data. The full suite executes real game JavaScript inside WKWebView, then UI tests verify relaunch, navigation and native controls. Node tests use a DOM stub and do not prove browser layout or VoiceOver. `Scripts/test-remediation.cjs` is an optional Playwright browser suite requiring separately installed Playwright and browser runtimes.

See `../../docs/TWIST-11-IOS-ACCEPTANCE.md` for current evidence and unresolved acceptance gates. Existing Build 1–3 files under `Release/` and older `Reports/` are historical; their metadata, screenshots, upload status and iPhone acceptance do not certify version 1.1. Refresh release metadata only in a separately authorized release-preparation step. No upload, App Review submission or public release is authorized in this remediation task.
