import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            NextWebView(url: URL(string: "https://runlu.ca/next.html")!)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle("NEXT")
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}
