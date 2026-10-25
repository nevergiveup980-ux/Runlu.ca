# RUNLU TWIST 1.0.0 (3) — 2026-10-25

Source: PR #339 commit `70087c0d80ab7e366c58c6c8a12724ed01bd4193`. That commit updated the root website only. This change synchronizes its intro into the existing native app's bundled `RUNLUTwist/Web/twist.html`, including the initial English HTML and both render-time language variants:

- 中文：先想一想，再揭晓答案，看看自己是否答对。
- English: Think first. Reveal the answer. See if you got it right.

The existing 20-puzzle/free/no-account sentence is retained after the new instructions. Gameplay, hints, reveal, self-assessment and scoring are unchanged; no answer input was added. Native `GameWebView.swift` is byte-identical to build 2's fix, preserving canonical Bundle path checks, scoped file loading, error reporting and rendered-question readiness checks.

Both Xcode project and XcodeGen build numbers are 3. Release metadata build number is updated to 3 so archive validation checks the current artifact.

Validation: Release simulator build succeeded. Seven game logic checks passed. Foundation Bundle symlink regression passed. Signed arm64 archive succeeded and package verifier passed with `ca.runlu.twist`, version `1.0.0`, build `3`, iPhone-only device family `[1]`. Archive HTML includes both new instructions and no input/textarea elements. HTML SHA256: `3719ce80d0f07f8389c6091cb66b176e67f3a2b8cf50c09247c90c917af79d7f`.

UI regression: 4 passed, 0 failed, 0 skipped on iPhone 18 Pro / iOS 27.0 Simulator, 2026-10-25 10:42–10:46 America/Edmonton. The language test now asserts both exact localized intro strings after switching, and zero text fields in each language. Existing reset/hints/reveal/assessment, relaunch persistence, sharing, privacy round trip, landscape and dark appearance checks pass. See `build-3-test-summary.json` and exported English/Chinese test screenshots.

Distribution: Build 3 upload was attempted in Xcode Organizer, but stopped at account selection with “Unable to authenticate with App Store Connect”. Reauthentication requires the account owner; Xcode returned “Your Apple Account or password is incorrect”. No Build 3 upload receipt has been received. The ready signed archive is preserved as `RUNLUTwist-1.0.0-3.xcarchive`.

Remaining release items observed in App Store Connect: version 1.0.0 is Prepare for Submission and still selects build 1; review first name, last name, phone and email fields are empty. After account recovery, upload build 3, confirm processing and internal QA availability, complete real-iPhone acceptance, then select the final build and fill review contact information before a separately authorized formal submission. Manual release remains selected. No formal App Store review was submitted.
