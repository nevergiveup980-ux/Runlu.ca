import AVFoundation
import Foundation
import MediaPlayer

@MainActor
final class MusicPlaybackEngine: ObservableObject {
    @Published private(set) var playingID: UUID?
    @Published var errorMessage: String?
    private var player: AVPlayer?
    private var scopedURL: URL?

    init() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        } catch {
            errorMessage = "无法配置音频会话：\(error.localizedDescription)"
        }
        MPRemoteCommandCenter.shared().playCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.player?.play() }
            return .success
        }
        MPRemoteCommandCenter.shared().pauseCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.player?.pause() }
            return .success
        }
    }

    func play(_ track: LocalTrack, from library: MusicLibraryStore) {
        stop()
        do {
            let url = try library.resolve(track)
            guard url.startAccessingSecurityScopedResource() else {
                throw PlaybackError.permissionDenied
            }
            scopedURL = url
            player = AVPlayer(url: url)
            playingID = track.id
            MPNowPlayingInfoCenter.default().nowPlayingInfo = [
                MPMediaItemPropertyTitle: track.title
            ]
            player?.play()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func pause() { player?.pause() }
    func resume() { player?.play() }

    func stop() {
        player?.pause()
        player?.replaceCurrentItem(with: nil)
        player = nil
        if let url = scopedURL { url.stopAccessingSecurityScopedResource() }
        scopedURL = nil
        playingID = nil
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }
}

enum PlaybackError: LocalizedError {
    case permissionDenied
    var errorDescription: String? { "无法访问该文件，请从“文件”App 重新授权。" }
}
