import SwiftUI

@main
struct RunluMusicApp: App {
    @StateObject private var library = MusicLibraryStore()
    @StateObject private var playback = MusicPlaybackEngine()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                MusicLibraryView()
                    .environmentObject(library)
                    .environmentObject(playback)
            }
        }
    }
}

struct MusicLibraryView: View {
    @EnvironmentObject private var library: MusicLibraryStore
    @EnvironmentObject private var playback: MusicPlaybackEngine
    @State private var showingPicker = false

    var body: some View {
        List {
            Section {
                Button("导入本地歌曲") { showingPicker = true }
                Text("音频文件仍保存在原位置；只保存文件访问凭证和歌曲名称。")
                    .font(.footnote).foregroundStyle(.secondary)
            }
            Section("我的音乐") {
                ForEach(library.tracks) { track in
                    HStack {
                        Button {
                            playback.play(track, from: library)
                        } label: {
                            Label(track.title, systemImage: playback.playingID == track.id ? "speaker.wave.2" : "music.note")
                        }
                        Spacer()
                        Button(role: .destructive) {
                            if playback.playingID == track.id { playback.stop() }
                            library.remove(track)
                        } label: { Image(systemName: "trash") }
                    }
                }
            }
            if playback.playingID != nil {
                Section("播放控制") {
                    HStack {
                        Button("暂停") { playback.pause() }
                        Spacer()
                        Button("继续") { playback.resume() }
                        Spacer()
                        Button("停止") { playback.stop() }
                    }
                }
            }
        }
        .navigationTitle("RUNLU MUSIC")
        .sheet(isPresented: $showingPicker) {
            MusicDocumentPicker { urls in library.importFiles(urls) }
        }
        .alert("提示", isPresented: Binding(
            get: { library.message != nil || playback.errorMessage != nil },
            set: { if !$0 { library.message = nil; playback.errorMessage = nil } }
        )) {
            Button("知道了") { library.message = nil; playback.errorMessage = nil }
        } message: {
            Text(playback.errorMessage ?? library.message ?? "")
        }
    }
}
