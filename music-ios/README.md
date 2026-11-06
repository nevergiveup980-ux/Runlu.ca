# RUNLU MUSIC — Native iOS (iPhone-first)

Status: architecture and implementation starter; not yet built or tested on device.

## Product decisions
- Preserve the existing web player and its tested local playlist.
- Native SwiftUI UI; AVFoundation playback; iPhone first, iPad later.
- User-selected, unprotected audio only. Never scan private app sandboxes or bypass DRM.
- Avoid uploading, copying or storing music bytes by default.
- Store only user-approved file/folder security-scoped bookmarks and lightweight playlist metadata in the app's own storage.
- A bookmark can become stale or unavailable; prompt to reauthorize. iCloud files may require download/network access; access may fail.
- iOS Files picker is not a general-purpose permanent filesystem permission. Validate folder access and individual file URLs on actual devices.
- AVAudioSession playback category + Background Modes audio, Now Playing metadata, remote transport commands; verify interruption, headphone unplug, Bluetooth and lock-screen behavior.
- Reduce motion option and energy-aware native visual effects. Do not run animations when backgrounded.
- No paid AI generation or music publishing in this phase.

## MVP acceptance criteria
1. Select one or more supported local files using the system document picker.
2. Optional folder import, where supported, with explicit user permission.
3. Reopen app and recover authorized file references without re-importing in the normal case.
4. If bookmark stale, file moved, cloud file unavailable, or permission revoked: show clear relink action, do not silently delete playlist.
5. Previous/next, play/pause, repeat, sequential playback.
6. Lock-screen and Control Center controls; background audio; route change and interruption handling.
7. Explicit remove song / clear library; revoke any access held by the app; no audio uploaded.
8. Test with iPhone and multiple file providers (On My iPhone / iCloud Drive), including low-storage and offline scenarios.

## Implementation outline
- `MusicLibraryStore`: metadata and security-scoped bookmark data, versioned schema; local-only persistence.
- `DocumentImportCoordinator`: UIDocumentPickerViewController via SwiftUI representable, files and optional folders; bookmark creation with error reporting.
- `BookmarkResolver`: resolve bookmark, detect stale data, balance startAccessingSecurityScopedResource / stopAccessingSecurityScopedResource, reauthorization UI.
- `PlaybackEngine`: AVPlayer/AVQueuePlayer with a carefully managed access lifetime; background audio and remote commands.
- `NowPlayingCoordinator`: MPNowPlayingInfoCenter and MPRemoteCommandCenter.
- `LivingVisualsView`: SwiftUI/Metal as needed, reduced motion, pause offscreen.

## Implementation order
1. Create an Xcode iOS project in a dedicated `music-ios/` directory, separate from web deployment.
2. Build import/bookmark/relink and playlist persistence; validate on iPhone.
3. Implement background audio, transport controls, and interruptions.
4. Port and refine Living Visuals.
5. TestFlight internal testing, then App Store review preparation.

## Known constraints
- DRM-protected Kugou membership downloads and Apple Music offline files cannot be imported as ordinary local audio.
- Security-scoped bookmarks are not a guarantee that external providers keep files available forever.
- Playlist metadata and bookmarks occupy a small amount of app storage; the audio files themselves remain in their chosen location by default.
