# RUNLU TWIST iOS 1.1 candidate

Existing SwiftUI + local WKWebView iPhone app, iOS 17+. Bundle ID `ca.runlu.twist`, team `F2J2Z8H2L4`, icons and canonical local-file loading retained. The Xcode project currently declares **1.1 (5)**. No signed Build 5 export, device installation, App Store Connect upload or review submission is confirmed.

Open `RUNLUTwist.xcodeproj` and choose an iPhone simulator. No server or package dependencies are required. The bundle includes 20 bilingual classic riddles, Reasoning Lab, Reflection, ten Logic Studio challenges, privacy and support pages.

The authoritative gameplay source is repository-root `twist.html`. After editing it, run from repository root:

```sh
python3 ios/RUNLUTwist/Scripts/sync-game.py
node ios/RUNLUTwist/Scripts/test-game-logic.cjs
python3 ios/RUNLUTwist/Scripts/verify-package.py
```

`sync-game.py` applies the native styling, offline policy, local privacy/support links, allowlisted native storage and text-only sharing. Do not hand-edit the bundled gameplay copy. Native backup covers the legacy key plus v6 gameplay, language, reasoning, reflections, Studio, verified answers, ordering, route ordering and the classic-content migration marker. Both the JavaScript allowlist and Swift bridge must remain aligned. Build 2's canonical bundle-path fix remains.

Run Xcode's Product > Test for actual WKWebView and touch regressions. `-twist-qa-suite` and `-twist-qa-corrupt` are DEBUG-only test launch arguments; they alter simulator test data. The full suite executes real game JavaScript inside WKWebView, then UI tests verify relaunch, navigation and native controls. Node tests use a DOM stub and do not prove browser layout or VoiceOver. `Scripts/test-remediation.cjs` is an optional Playwright browser suite requiring separately installed Playwright and browser runtimes.

See `../../docs/TWIST-11-IOS-ACCEPTANCE.md` for current evidence and unresolved acceptance gates. Existing Build 1–3 files under `Release/` and older `Reports/` are historical; their metadata, screenshots, upload status and iPhone acceptance do not certify version 1.1. Refresh release metadata only in a separately authorized release-preparation step. No upload, App Review submission or public release is authorized in this remediation task.

## Build 4 final engineering acceptance

See `../../docs/TWIST-BUILD4-FINAL-ACCEPTANCE.md`. Code commit `107ec9d` passed the final nine-test iOS 26.5 run, including accessibility and largest Dynamic Type. A locally signed Release archive and development IPA were exported on 2026-10-29; no upload or review submission occurred. Build 4 was subsequently installed on a physical iPhone 16 Pro Max on 2026-11-01 after Developer Mode was enabled; limited smoke tests passed. See `../../docs/TWIST-BUILD4-IPHONE-SMOKE-2026-11-01.md`. Full physical-device acceptance remains pending, and Build 4 results cannot certify Build 5.

## Source integrity automation

The `.github/workflows/twist-ios-source-integrity.yml` workflow checks on relevant PRs and branch pushes that `sync-game.py` regenerates **exactly** the committed iOS gameplay bundle, then runs Node logic regressions and `verify-package.py`. A red workflow means the bundle or logic must be corrected before review. A green **source-integrity** workflow proves source/package consistency only. The separate **iOS package** workflow has also passed an unsigned Xcode generic-device build and offline Chromium/WebKit tests. Neither workflow installs a signed Build 5 IPA on a physical iPhone, runs physical-device VoiceOver, or authorizes App Store resubmission. See `../../TWIST_IOS_QA_GATE.md` for the real-device release gate.

## Build 5 handoff — signed device candidate (NOT YET VERIFIED)

1. On a Mac with Xcode and the authorized Apple Developer signing account, check out the reviewed branch commit. Record the full commit SHA and ensure the worktree is clean.
2. Run the three source commands above and confirm the generated bundle is unchanged (`git diff --exit-code -- ios/RUNLUTwist/RUNLUTwist/Web/`). Confirm all relevant GitHub Actions checks are green **for the exact commit**.
3. Open `ios/RUNLUTwist/RUNLUTwist.xcodeproj`. Verify target bundle ID `ca.runlu.twist`, version **1.1**, build **5**, and signing team. Do not silently increment a version or replace provisioning profiles.
4. Select the physical iPhone, configure authorized development signing, build and run. If an archive/IPA is required, export using the appropriate authorized development or TestFlight distribution method. Never commit certificates, provisioning secrets or signing passwords.
5. Record build identifier, commit SHA, device model/iOS version, signed artifact location and install result in `../../TWIST_IOS_QA_GATE.md`. Check the installed bundle actually includes the latest puzzle #4 and #8 interactions.
6. Complete the real-device checklist including VoiceOver, offline mode, orientation, large text, persistence and reset. Do not claim acceptance from simulator/CI alone.
7. Only after evidence and owner approval: review App Store metadata, screenshots and `../../docs/TWIST-APPLE-REVIEW-RESPONSE-DRAFT.md`. No automatic upload or resubmission.

**Release gate:** Build 5 remains **UNSIGNED / DEVICE-QA PENDING** in the available evidence. Do not merge PR #375 or claim Apple approval until the separate gates are completed.
