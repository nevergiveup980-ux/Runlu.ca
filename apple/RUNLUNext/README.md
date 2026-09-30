# RUNLU NEXT for Apple — V0.1

Node 1 keeps the current RUNLU NEXT engine intact and gives it a native SwiftUI shell.

## Current source of truth
- Web engine: /next.html
- Production URL: https://runlu.ca/next.html
- Persistence remains in WKWebView's persistent website data store, so the existing localStorage-based NEXT state can survive app launches.

## Xcode bootstrap
1. Create a new iOS App named RUNLUNext using SwiftUI and Swift.
2. Set deployment target to the oldest iOS version we decide to support.
3. Replace the generated App and ContentView files with the files in this folder.
4. Add NextWebView.swift to the app target.
5. Build on an iPhone simulator, then a signed physical iPhone.

## Node 1 acceptance
- Native app launches.
- NEXT loads inside the app without Safari chrome.
- Text entry and Ask NEXT work.
- Existing local-first planner works unchanged.
- Local state survives closing/reopening the app.
- No change is required to production next.html for V0.1.

## Next node
Move selected shell/state features to native SwiftUI only after parity is verified. Do not fork the planning behavior prematurely.


## Brand asset checkpoint
The official App Icon source is the classic RUNLU blue/white oval-waterdrop logo supplied by the project owner.
Prepared master: `RUNLUNext-1024.png` (1024×1024).
Expected repository destination:
`RUNLUNext/Assets.xcassets/AppIcon.appiconset/RUNLUNext-1024.png`

Do not redraw or substitute the RUNLU mark. The asset catalog already references this exact filename.
Binary PNG upload is intentionally left as the final local-Xcode/Git step because the connected GitHub text-file interface does not upload binary repository files.


## V0.1 physical-device acceptance gate

Run these checks on a signed iPhone build before this PR can leave Draft:

1. Launch from the Home Screen and confirm the native RUNLU NEXT launch view transitions into NEXT.
2. Enter a disposable test task in NEXT and verify DO NOW / Focus controls respond.
3. Close the app completely, reopen it, and confirm the test task remains.
4. Start a Focus session, background the app, return, and confirm NEXT remains usable.
5. Turn off Wi-Fi/cellular, launch or reload, and confirm the native offline state appears.
6. Restore connectivity, tap Try Again, and confirm NEXT reloads without force-quitting.
7. Verify keyboard entry, scrolling, and back-forward gestures.
8. Confirm the classic RUNLU App Icon is installed from the final 1024×1024 PNG.
9. Do not merge until these checks pass.

### Storage boundary
WKWebView uses a persistent website data store inside the app, so data created inside RUNLU NEXT App should persist between app launches. Safari's existing localStorage is a separate browser container and must not be assumed to migrate automatically into the app. V0.1 therefore tests persistence first; any Safari-to-App migration will be designed explicitly rather than guessed.
