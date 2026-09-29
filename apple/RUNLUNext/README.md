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
