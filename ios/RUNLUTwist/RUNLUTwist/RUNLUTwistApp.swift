import SwiftUI

@main
struct RUNLUTwistApp: App {
    private var testAppearance: ColorScheme? {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-twist-dark") { return .dark }
        #endif
        return nil
    }

    var body: some Scene {
        WindowGroup {
            GameWebView()
                .background(Color(uiColor: .systemBackground))
                .preferredColorScheme(testAppearance)
        }
    }
}
