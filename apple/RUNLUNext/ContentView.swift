import SwiftUI

struct ContentView: View {
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadToken = UUID()
    @State private var showLaunch = true

    private var nextURL: URL {
#if DEBUG
        if let preview = Bundle.main.url(forResource: "next-preview", withExtension: "html") { return preview }
#endif
        return URL(string: "https://runlu.ca/next.html")!
    }

    var body: some View {
        NavigationStack {
            ZStack {
                NextWebView(url: nextURL, reloadToken: reloadToken)

                if isLoading && !showLaunch {
                    ProgressView("Opening NEXT…")
                        .padding(18)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                }

                if let loadError, !showLaunch {
                    ContentUnavailableView {
                        Label("NEXT is offline", systemImage: "wifi.slash")
                    } description: {
                        Text("Your existing NEXT data remains on this device. Reconnect, then try again.")
                    } actions: {
                        Button("Try Again") {
                            self.loadError = nil
                            self.isLoading = true
                            self.reloadToken = UUID()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .background(.background)
                }

                if showLaunch {
                    LaunchView()
                        .transition(.opacity)
                        .zIndex(10)
                }
            }
            .ignoresSafeArea(edges: .bottom)
            .navigationTitle(showLaunch ? "" : "NEXT")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(showLaunch ? .hidden : .visible, for: .navigationBar)
        }
        .task {
            try? await Task.sleep(for: .milliseconds(850))
            withAnimation(.easeOut(duration: 0.28)) {
                showLaunch = false
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .nextLoadingChanged)) { note in
            if let value = note.object as? Bool {
                isLoading = value
                if value { loadError = nil }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .nextLoadFailed)) { note in
            isLoading = false
            loadError = note.object as? String
        }
    }
}
