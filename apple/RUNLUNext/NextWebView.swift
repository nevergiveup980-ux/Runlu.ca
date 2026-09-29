import SwiftUI
import WebKit

struct NextWebView: UIViewRepresentable {
    let url: URL

    final class Coordinator: NSObject, WKNavigationDelegate {
        var parent: NextWebView
        init(_ parent: NextWebView) { self.parent = parent }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            NotificationCenter.default.post(name: .nextLoadingChanged, object: true)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            NotificationCenter.default.post(name: .nextLoadingChanged, object: false)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            NotificationCenter.default.post(name: .nextLoadingChanged, object: false)
            NotificationCenter.default.post(name: .nextLoadFailed, object: error.localizedDescription)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            NotificationCenter.default.post(name: .nextLoadingChanged, object: false)
            NotificationCenter.default.post(name: .nextLoadFailed, object: error.localizedDescription)
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.keyboardDismissMode = .interactive
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard webView.url == nil else { return }
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData))
    }
}

extension Notification.Name {
    static let nextLoadingChanged = Notification.Name("RUNLUNext.loadingChanged")
    static let nextLoadFailed = Notification.Name("RUNLUNext.loadFailed")
}
