import AVFoundation
import Combine
import Foundation
import MediaPlayer

@MainActor
final class MusicPlaybackEngine: ObservableObject {
    @Published private(set) var playingID: UUID?
    @Published private(set) var isPlaying = false
    @Published var repeatAll = false
    @Published var errorMessage: String?
    @Published var needsRelink = false

    private var player: AVPlayer?
    private var scopedURL: URL?
    private var queue: [LocalTrack] = []
    private var position = -1
    private weak var library: MusicLibraryStore?
    private var endObserver: NSObjectProtocol?
    private var interruptionObserver: NSObjectProtocol?
    private var routeObserver: NSObjectProtocol?
    private var remoteTargets: [(MPRemoteCommand, Any)] = []

    init() {
        do { try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default) }
        catch { errorMessage = "音频会话配置失败：\(error.localizedDescription)" }

        let remote = MPRemoteCommandCenter.shared()
        for command in [remote.playCommand, remote.pauseCommand, remote.nextTrackCommand, remote.previousTrackCommand] {
            let target = command.addTarget { [weak self] event in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    if event.command === remote.playCommand { self.resume() }
                    else if event.command === remote.pauseCommand { self.pause() }
                    else if event.command === remote.nextTrackCommand { self.next() }
                    else if event.command === remote.previousTrackCommand { self.previous() }
                }
                return .success
            }
            remoteTargets.append((command, target))
        }
        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] notification in
            Task { @MainActor [weak self] in
                guard let self, let raw = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                      let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
                if type == .began { self.isPlaying = false }
                // Never auto-resume without checking system policy and user intent.
            }
        }
        routeObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main
        ) { [weak self] notification in
            Task { @MainActor [weak self] in
                guard let self, let raw = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
                      let reason = AVAudioSession.RouteChangeReason(rawValue: raw) else { return }
                if reason == .oldDeviceUnavailable { self.pause() }
            }
        }
    }

    func play(_ track: LocalTrack, from library: MusicLibraryStore) {
        self.library = library
        queue = library.tracks
        guard let index = queue.firstIndex(where: { $0.id == track.id }) else { return }
        open(index)
    }

    private func open(_ index: Int) {
        guard queue.indices.contains(index), let library else { return }
        stopPlayer()
        position = index
        let track = queue[index]
        do {
            let url = try library.resolve(track)
            guard url.startAccessingSecurityScopedResource() else { throw PlaybackError.permissionDenied }
            scopedURL = url
            let item = AVPlayerItem(url: url)
            player = AVPlayer(playerItem: item)
            endObserver = NotificationCenter.default.addObserver(
                forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main
            ) { [weak self] _ in
                Task { @MainActor [weak self] in self?.advanceAtEnd() }
            }
            try AVAudioSession.sharedInstance().setActive(true)
            playingID = track.id
            needsRelink = false
            player?.play()
            isPlaying = true
            updateNowPlaying(title: track.title)
        } catch {
            errorMessage = error.localizedDescription
            needsRelink = true
            stopPlayer()
        }
    }

    private func advanceAtEnd() {
        if position + 1 < queue.count { open(position + 1) }
        else if repeatAll && !queue.isEmpty { open(0) }
        else { isPlaying = false; player?.seek(to: .zero); updatePlaybackState() }
    }

    func next() {
        guard !queue.isEmpty else { return }
        if position + 1 < queue.count { open(position + 1) }
        else if repeatAll { open(0) }
    }

    func previous() {
        guard !queue.isEmpty else { return }
        if position > 0 { open(position - 1) }
        else if repeatAll { open(queue.count - 1) }
        else { player?.seek(to: .zero) }
    }

    func pause() { player?.pause(); isPlaying = false; updatePlaybackState() }
    func resume() {
        guard player != nil else { return }
        do { try AVAudioSession.sharedInstance().setActive(true); player?.play(); isPlaying = true; updatePlaybackState() }
        catch { errorMessage = error.localizedDescription }
    }
    func stop() { stopPlayer(); queue = []; position = -1; library = nil }

    private func stopPlayer() {
        if let endObserver { NotificationCenter.default.removeObserver(endObserver); self.endObserver = nil }
        player?.pause()
        player?.replaceCurrentItem(with: nil)
        player = nil
        if let scopedURL { scopedURL.stopAccessingSecurityScopedResource(); self.scopedURL = nil }
        playingID = nil
        isPlaying = false
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    private func updateNowPlaying(title: String) {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: title,
            MPNowPlayingInfoPropertyPlaybackRate: 1.0
        ]
    }
    private func updatePlaybackState() {
        var info = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        info[MPNowPlayingInfoPropertyPlaybackRate] = isPlaying ? 1.0 : 0.0
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
}

enum PlaybackError: LocalizedError {
    case permissionDenied
    var errorDescription: String? { "无法访问文件，请从“文件”App 重新授权。" }
}
