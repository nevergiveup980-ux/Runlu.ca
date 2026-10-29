import SwiftUI
import WebKit
import UIKit
import OSLog

// All gameplay resources ship in the bundle. No remote page is used as an app shell.
struct GameWebView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> GameViewController { GameViewController() }
    func updateUIViewController(_ controller: GameViewController, context: Context) {}
}

final class GameViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private let storageKey = "twist.native.snapshot.v1"
    private var recoveryCount = 0
    private let logger = Logger(subsystem: "ca.runlu.twist", category: "Startup")
    private weak var errorLabel: UILabel?

    private func isBundledFile(_ url: URL) -> Bool {
        guard url.isFileURL else { return false }
        // On iPhone /var and /private/var can identify the same bundle.
        let root = Bundle.main.bundleURL.resolvingSymlinksInPath().standardizedFileURL.path
        let path = url.resolvingSymlinksInPath().standardizedFileURL.path
        return path.hasPrefix(root + "/")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-dark") { overrideUserInterfaceStyle = .dark }
        #endif
        let content = WKUserContentController()
        content.add(self, name: "twist")
        content.addUserScript(WKUserScript(source: Self.diagnostics, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-qa-suite") {
            UserDefaults.standard.removeObject(forKey: storageKey)
        }
        #endif
        var snapshot = UserDefaults.standard.string(forKey: storageKey) ?? "{}"
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-qa-corrupt") {
            snapshot = #"{"twist-reasoning-v1":"7","twist-reflections-v1":"[]","twist-studio-v1":"{broken","runlu-twist-node001-v1":"null","twist-lang":"en"}"#
        }
        #endif
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
            let canonicalURL = url.resolvingSymlinksInPath()
            logger.info("Loading bundled game: \(canonicalURL.path, privacy: .public)")
            webView.loadFileURL(canonicalURL, allowingReadAccessTo: canonicalURL.deletingLastPathComponent())
        } else {
            showError("Offline game resources are missing. Please reinstall the app. / 离线资源缺失，请重新安装。")
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,
              let source = message.frameInfo.request.url, isBundledFile(source),
              let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        #if DEBUG
        if type == "qa", let report = body["report"] as? [String: Any] {
            let failed = report["failed"] as? Int ?? -1
            let passed = report["passed"] as? Int ?? 0
            logger.info("WK QA report: \(String(describing: report), privacy: .public)")
            let label = UILabel()
            label.accessibilityIdentifier = "twist-qa-result"
            label.text = "WK QA \(failed == 0 ? "PASS" : "FAIL") \(passed)/\(passed + failed)"
            label.backgroundColor = .systemBackground
            label.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(label)
            NSLayoutConstraint.activate([label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),label.leadingAnchor.constraint(equalTo: view.leadingAnchor),label.trailingAnchor.constraint(equalTo: view.trailingAnchor)])
            return
        }
        #endif
        if type == "error", let detail = body["message"] as? String {
            logger.error("JavaScript startup error: \(detail, privacy: .public)")
            showError("Game startup failed. Please reopen the app. / 游戏启动失败，请重新打开。")
        } else if type == "save", let values = body["values"] as? [String: String],
           Set(values.keys).isSubset(of: ["runlu-twist-node001-v1", "twist-lang", "twist-reasoning-v1", "twist-reflections-v1", "twist-studio-v1"]),
           JSONSerialization.isValidJSONObject(values),
           let data = try? JSONSerialization.data(withJSONObject: values), data.count < 65536,
           let string = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(string, forKey: storageKey)
            // Subsequent bundled privacy/support navigation must restore the latest snapshot.
            let content = webView.configuration.userContentController
            content.removeAllUserScripts()
            content.addUserScript(WKUserScript(source: Self.diagnostics, injectionTime: .atDocumentStart, forMainFrameOnly: true))
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
        if isBundledFile(url) {
            logger.info("Allowed bundled navigation: \(url.path, privacy: .public)")
            decisionHandler(.allow)
        } else {
            logger.error("Blocked navigation: \(url.absoluteString, privacy: .public)")
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
        let chinese = message.contains("确定") || message.contains("重置")
        let alert = UIAlertController(title: chinese ? "重置进度" : "Reset progress", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: chinese ? "取消" : "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: chinese ? "重置" : "Reset", style: .destructive) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        syncAppearance()
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-qa-suite"), webView.url?.lastPathComponent == "twist.html",
           let scriptURL = Bundle.main.url(forResource: "qa-suite", withExtension: "js", subdirectory: "Web"),
           let script = try? String(contentsOf: scriptURL, encoding: .utf8) {
            webView.evaluateJavaScript(script + "\nwindow.webkit.messageHandlers.twist.postMessage({type:'qa',report:runTwistQA()}); true;") { [weak self] _, error in
                if let error { self?.showError(error.localizedDescription) }
            }
        }
        if ProcessInfo.processInfo.arguments.contains("-twist-qa-large-type"), webView.url?.lastPathComponent == "twist.html" {
            webView.evaluateJavaScript("""
            (() => {
                const font = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const width = document.documentElement.clientWidth;
                const overflow = document.documentElement.scrollWidth > width + 1;
                const ok = font >= 40 && !overflow;
                window.webkit.messageHandlers.twist.postMessage({type:'qa',report:{passed:ok?1:0,failed:ok?0:1,font,width,overflow}});
                return true;
            })()
            """) { [weak self] _, error in
                if let error { self?.showError(error.localizedDescription) }
            }
        }
        #endif
        guard let url = webView.url, url.lastPathComponent == "twist.html" else { return }
        webView.evaluateJavaScript("document.getElementById('question')?.textContent?.trim().length > 0") { [weak self] result, error in
            guard let self else { return }
            if let error {
                self.logger.error("JavaScript readiness check failed: \(error.localizedDescription, privacy: .public)")
                self.showError("Game startup failed. Please reopen the app. / 游戏启动失败，请重新打开。")
            } else if result as? Bool != true {
                self.showError("Game content did not initialize. / 游戏内容未能初始化。")
            } else {
                self.logger.info("Game ready: question rendered")
            }
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        navigationFailed(error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        navigationFailed(error)
    }

    private func navigationFailed(_ error: Error) {
        logger.error("Bundled navigation failed: \(error.localizedDescription, privacy: .public)")
        showError("Unable to load the offline game. Please reopen the app. / 离线游戏加载失败，请重新打开。")
    }

    private static let diagnostics = """
    window.addEventListener('error', function(e) {
        window.webkit.messageHandlers.twist.postMessage({type:'error',message:String(e.message).slice(0,1000)});
    });
    window.addEventListener('unhandledrejection', function(e) {
        window.webkit.messageHandlers.twist.postMessage({type:'error',message:String(e.reason).slice(0,1000)});
    });
    """

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
        guard errorLabel == nil else { return }
        let label = UILabel()
        errorLabel = label
        label.backgroundColor = .systemBackground
        label.accessibilityIdentifier = "twist-startup-error"
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
