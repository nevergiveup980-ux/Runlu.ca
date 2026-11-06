import Combine
import Foundation
import UniformTypeIdentifiers

struct LocalTrack: Identifiable, Codable, Equatable {
    var id: UUID
    var title: String
    var bookmark: Data
}

@MainActor
final class MusicLibraryStore: ObservableObject {
    @Published private(set) var tracks: [LocalTrack] = []
    @Published var message: String?
    private let key = "runlu.music.localTracks.v1"

    init() { restore() }

    func importFiles(_ urls: [URL]) {
        var added = 0
        for url in urls {
            let accessed = url.startAccessingSecurityScopedResource()
            defer { if accessed { url.stopAccessingSecurityScopedResource() } }
            do {
                let bookmark = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
                tracks.append(LocalTrack(id: UUID(), title: url.deletingPathExtension().lastPathComponent, bookmark: bookmark))
                added += 1
            } catch {
                message = "无法保存 \(url.lastPathComponent) 的访问权限，请重新选择文件。"
            }
        }
        persist()
        if added > 0 { message = "已导入 \(added) 首歌曲" }
    }

    func resolve(_ track: LocalTrack) throws -> URL {
        var stale = false
        let url = try URL(resolvingBookmarkData: track.bookmark, options: [], relativeTo: nil, bookmarkDataIsStale: &stale)
        if stale { throw LibraryError.staleBookmark }
        return url
    }

    func remove(_ track: LocalTrack) {
        tracks.removeAll { $0.id == track.id }
        persist()
    }

    func clear() { tracks.removeAll(); persist() }

    private func persist() {
        do { UserDefaults.standard.set(try JSONEncoder().encode(tracks), forKey: key) }
        catch { message = "音乐列表保存失败：\(error.localizedDescription)" }
    }

    private func restore() {
        guard let data = UserDefaults.standard.data(forKey: key) else { return }
        do { tracks = try JSONDecoder().decode([LocalTrack].self, from: data) }
        catch { message = "无法恢复音乐列表，请重新导入。"; tracks = [] }
    }
}

enum LibraryError: LocalizedError {
    case staleBookmark
    var errorDescription: String? { "文件授权已过期，请重新选择这首歌曲。" }
}
