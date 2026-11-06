# Xcode setup (starter, not yet compiled)

1. On a Mac with Xcode, create an iOS App named `RunluMusic` with SwiftUI and Swift, minimum iOS 16.
2. Add the four files in `Sources/` to the app target. Remove Xcode's generated duplicate `@main` App file.
3. Under Signing & Capabilities, enable Background Modes > Audio, AirPlay, and Picture in Picture. Confirm generated Info.plist contains `UIBackgroundModes` with `audio`.
4. Sign with your Apple developer team; run on a real iPhone.
5. Import a non-DRM MP3 from Files. Verify playback, force-quit/relaunch, and attempt playback again.
6. Test iCloud Drive files, moved/deleted files, interrupted playback, and permission failures.

Important: this is a first implementation scaffold, not a tested production app. File-provider bookmark behavior must be verified on device. Do not assume bookmarks survive all provider moves or revocations. The app currently has single-track play/pause/stop, not full queue, folder import, or Living Visuals.
