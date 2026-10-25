# RUNLU TWIST build 2 — 2026-10-25

## Diagnosis and evidence

The uploaded build 1 IPA contains `Web/twist.html` (21,354 bytes); resource packaging is not missing. The existing Debug and Release app both render in the simulator. No JavaScript startup failure was observed there.

A concrete defect was found in `decidePolicyFor`: the file URL is compared against the uncanonicalized Bundle path with a string prefix. iPhone paths can use `/var` and `/private/var` for the same location. If WebKit and Bundle choose different aliases, the app cancels its own initial navigation, leaving an empty WKWebView. No failure UI or navigation diagnostics existed for that path. A Foundation symlink fixture reproduces rejection by the old predicate and acceptance by the fixed predicate; sibling paths, HTTPS URLs and escaping symlinks remain blocked.

**Evidence limit:** no console from the affected physical iPhone/build 1 session was available. The path-policy defect is confirmed, but its triggering in that specific failed session is not yet confirmed. A fresh physical-iPhone installation of build 2 is still required to close that acceptance item.

## Changes

Canonicalize both file and bundle paths using `resolvingSymlinksInPath().standardizedFileURL`; load the canonical HTML URL with access scoped to Web. Apply the same boundary to native bridge messages. Add OSLog startup/navigation records, JS error and unhandled-rejection reporting, native navigation failure messages, and a post-load question-render check. Preserve diagnostics after updating the saved-progress bootstrap. Set version 1.0.0 build 2 in both project and XcodeGen source.

## Validation

- Release simulator build: succeeded; actual iPhone 18 Pro / iOS 27.0 simulator displays game; Xcode log reports `Game ready: question rendered`.
- Xcode UI tests: 4 passed, 0 failed, 0 skipped (09:02–09:05 America/Edmonton); language, reset, hints, answers, assessment, relaunch persistence, native share, privacy round trip, dark appearance and landscape covered. Summary saved as `test-summary.json`.
- Game logic checks: 7 passed.
- Foundation path regression: passed; old policy rejects canonical-vs-alias bundle, fixed policy accepts both and rejects escape cases.
- Signed arm64 archive: succeeded; identifier `ca.runlu.twist`, version `1.0.0`, build `2`, device family `[1]`.
- Bundled HTML SHA256: `7187db8ae4a977cd4068fd0532d13b9416a3e8269afdf9d44bb40d75612bece5`.

## Distribution

CLI export could not read the Xcode account credentials. Xcode Organizer completed upload and displayed “RUNLUTwist 1.0.0 (2) uploaded”. Apple TestFlight lists build 2, uploaded Oct 25 at 9:09 AM, with status Ready to Submit. Build processing has completed. Build 2 details confirm Group (1): RUNLU TWIST Internal QA, Internal, 1 tester. Bilingual What to Test instructions were saved. Physical-device installation and gameplay acceptance remain pending.

PR #339 contains fix commit `8c28602206acc0325dc58c871a66c14789971262` and remains a draft. No App Store review submission was made.
