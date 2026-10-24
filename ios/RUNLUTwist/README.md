# RUNLU TWIST iOS

Standalone SwiftUI + WKWebView iPhone application, iOS 17+. Source baseline: Runlu.ca PR #339, commit c83ddabb024f629321df80f43ead17253c48bc2d.

Open `RUNLUTwist.xcodeproj`, select an iPhone simulator, and Run. No package dependencies or server required. All 20 bilingual puzzles, styles, support and privacy pages ship in `RUNLUTwist/Web`.

- Bundle ID: `ca.runlu.twist` (registration/availability must be confirmed in the developer account).
- Version: 1.0.0 (1).
- Team: F2J2Z8H2L4, inferred from the available Apple Development certificate; distribution authorization still needs validation.
- Local WKWebsiteDataStore plus an allowlisted native UserDefaults backup; no sync, analytics, ads, or tracking.
- UIActivityViewController shares result text only. Reset uses native confirmation.
- Native safe-area constraints, responsive web layout, reduced motion, contrast and dark appearance.

`project.yml` is the XcodeGen source; the generated Xcode project is included, so XcodeGen is not required to open/build it. To regenerate: `xcodegen generate`.

## Validation and release

See `Reports/TEST-REPORT.md` and `Release/RELEASE-STATUS.md` for actual results and remaining gates. An unsigned archive is a compilation artifact, not a TestFlight-ready distribution. Do not submit for review without the owner's explicit confirmation.

The web source is a packaged adaptation; the root website `twist.html` and all unrelated website files remain unchanged. Native snapshots are independent of the development web prototype's browser storage.
