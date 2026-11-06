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
                Text("歌曲仍保存在原位置。文件授权失效时，可重新选择歌曲。")
                    .font(.footnote).foregroundStyle(.secondary)
            }
            Section("我的音乐") {
                ForEach(library.tracks) { track in
                    HStack {
                        Button { playback.play(track, from: library) } label: {
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
                        Button("上一首") { playback.previous() }
                        Spacer()
                        Button(playback.isPlaying ? "暂停" : "播放") {
                            if playback.isPlaying { playback.pause() } else { playback.resume() }
                        }
                        Spacer()
                        Button("下一首") { playback.next() }
                    }
                    Toggle("循环整个列表", isOn: $playback.repeatAll)
                    Button("停止播放", role: .destructive) { playback.stop() }
                }
            }
            if playback.needsRelink {
                Section {
                    Button("重新选择无法访问的歌曲") { showingPicker = true }
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
