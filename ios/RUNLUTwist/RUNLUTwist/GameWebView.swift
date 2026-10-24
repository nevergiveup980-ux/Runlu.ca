import SwiftUI
import WebKit
import UIKit

// All gameplay resources ship in the bundle. No remote page is used as an app shell.
struct GameWebView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> GameViewController { GameViewController() }
    func updateUIViewController(_ controller: GameViewController, context: Context) {}
}

final class GameViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private let storageKey = "twist.native.snapshot.v1"
    private var recoveryCount = 0

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-dark") { overrideUserInterfaceStyle = .dark }
        #endif
        let content = WKUserContentController()
        content.add(self, name: "twist")
        let snapshot = UserDefaults.standard.string(forKey: storageKey) ?? "{}"
        let bootstrap = "window.__twistNativeSnapshot = \(snapshot);"
        content.addUserScript(WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let config = WKWebViewConfiguration()
        config.userContentController = content
        config.websiteDataStore = .default()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground
        webView.scrollView.backgroundColor = .systemBackground
        webView.overrideUserInterfaceStyle = overrideUserInterfaceStyle
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor)
        ])
        if let url = Bundle.main.url(forResource: "twist", withExtension: "html", subdirectory: "Web") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            showError("Offline game resources are missing. Please reinstall the app. / 离线资源缺失，请重新安装。")
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.isFileURL == true,
              let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        if type == "save", let values = body["values"] as? [String: String],
           Set(values.keys).isSubset(of: ["runlu-twist-node001-v1", "twist-lang"]),
           JSONSerialization.isValidJSONObject(values),
           let data = try? JSONSerialization.data(withJSONObject: values), data.count < 65536,
           let string = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(string, forKey: storageKey)
            // Subsequent bundled privacy/support navigation must restore the latest snapshot.
            let content = webView.configuration.userContentController
            content.removeAllUserScripts()
            content.addUserScript(WKUserScript(source: "window.__twistNativeSnapshot = \(string);", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        } else if type == "share", let text = body["text"] as? String, text.count < 2000,
                  presentedViewController == nil {
            // Share text only: never leak the local file:// bundle path or an unpublished preview URL.
            let sheet = UIActivityViewController(activityItems: [text], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
            present(sheet, animated: true)
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Only bundle files can navigate in the webview. Explicit support links open in Safari.
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.isFileURL, url.standardizedFileURL.path.hasPrefix(Bundle.main.bundleURL.path + "/") {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
            if navigationAction.navigationType == .linkActivated,
               url.scheme == "https", url.host == "runlu.ca" {
                UIApplication.shared.open(url)
            }
        }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        guard presentedViewController == nil else { completionHandler(false); return }
        let chinese = message.contains("确定")
        let alert = UIAlertController(title: chinese ? "重置进度" : "Reset progress", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: chinese ? "取消" : "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: chinese ? "重置" : "Reset", style: .destructive) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        syncAppearance()
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        syncAppearance()
    }

    private func syncAppearance() {
        guard webView != nil else { return }
        var dark = traitCollection.userInterfaceStyle == .dark
        #if DEBUG
        dark = dark || ProcessInfo.processInfo.arguments.contains("-twist-dark")
        #endif
        let appearance = dark ? "dark" : "light"
        webView.evaluateJavaScript("document.documentElement.dataset.nativeAppearance = '\(appearance)'")
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        recoveryCount += 1
        if recoveryCount < 3 { webView.reload() }
        else { showError("Please close and reopen RUNLU TWIST. / 请关闭后重新打开应用。") }
    }

    private func showError(_ text: String) {
        let label = UILabel()
        label.text = text
        label.numberOfLines = 0
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
                                     label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
                                     label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24)])
    }
}
