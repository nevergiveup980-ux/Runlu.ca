import SwiftUI

struct ContentView: View {
    @State private var isLoading = true
    @State private var loadError: String?

    private let nextURL = URL(string: "https://runlu.ca/next.html")!

    var body: some View {
        NavigationStack {
            ZStack {
                NextWebView(url: nextURL)

                if isLoading {
                    ProgressView("Opening NEXT…")
                        .padding(18)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                }

                if let loadError {
                    ContentUnavailableView {
                        Label("NEXT is offline", systemImage: "wifi.slash")
                    } description: {
                        Text("Your existing NEXT data remains on this device. Reconnect and reopen the app.\n\n" + loadError)
                    }
                    .padding()
                    .background(.background)
                }
            }
            .ignoresSafeArea(edges: .bottom)
            .navigationTitle("NEXT")
            .navigationBarTitleDisplayMode(.inline)
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
