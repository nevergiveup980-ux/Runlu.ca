import XCTest
import UIKit

final class TwistUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
    }
    override func tearDownWithError() throws {
        XCUIDevice.shared.orientation = .portrait
    }

    func testOfflineGameplayPersistenceAndShare() throws {
        let app = XCUIApplication()
        app.launch()
        let english = app.buttons["Reveal answer"]
        let chinese = app.buttons["揭晓答案"]
        XCTAssertTrue(english.waitForExistence(timeout: 20) || chinese.waitForExistence(timeout: 5))
        let answer = english.exists ? english : chinese
        if answer.isEnabled { answer.tap() }
        XCTAssertTrue(app.staticTexts["Revealed"].waitForExistence(timeout: 10) || app.staticTexts["已揭晓"].exists)
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "Actual-iPhone-gameplay"
        screenshot.lifetime = .keepAlways
        add(screenshot)
        app.terminate()
        app.launch()
        XCTAssertTrue(app.switches["I got it"].waitForExistence(timeout: 15) || app.switches["我想对了"].waitForExistence(timeout: 5))
        let share = app.buttons["Share result"].exists ? app.buttons["Share result"] : app.buttons["分享成绩"]
        for _ in 0..<8 where !share.isHittable { app.swipeUp() }
        share.tap()
        XCTAssertTrue(app.otherElements["ActivityListView"].waitForExistence(timeout: 5) || app.buttons["Copy"].exists || app.buttons["复制"].exists)
    }
}

extension TwistUITests {
    private func capture(_ app: XCUIApplication, _ name: String) {
        let item = XCTAttachment(screenshot: app.screenshot())
        item.name = name
        item.lifetime = .keepAlways
        add(item)
    }

    func testLanguageResetAndScreenshots() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20) || app.descendants(matching: .any)["题目语言"].waitForExistence(timeout: 5))
        var language = app.descendants(matching: .any)["Puzzle language"].exists ? app.descendants(matching: .any)["Puzzle language"] : app.descendants(matching: .any)["题目语言"]
        XCTAssertTrue(language.waitForExistence(timeout: 20))
        if app.descendants(matching: .any)["题目语言"].exists {
            language.tap()
            if app.pickerWheels.firstMatch.waitForExistence(timeout: 2) {
                app.pickerWheels.firstMatch.adjust(toPickerWheelValue: "English")
                if app.buttons["Done"].exists { app.buttons["Done"].tap() }
                else if app.buttons["完成"].exists { app.buttons["完成"].tap() }
            } else {
                app.buttons["English"].tap()
            }
            XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 10))
            language = app.descendants(matching: .any)["Puzzle language"]
        }
        XCTAssertTrue(app.staticTexts["Think first. Reveal the answer. See if you got it right. Twenty puzzles, free to play—no account needed."].waitForExistence(timeout: 10))
        XCTAssertEqual(app.textFields.count, 0)
        app.swipeDown()
        capture(app, "01-actual-game-English")
        language.tap()
        if app.pickerWheels.firstMatch.waitForExistence(timeout: 3) {
            app.pickerWheels.firstMatch.adjust(toPickerWheelValue: "简体中文")
            if app.buttons["Done"].exists { app.buttons["Done"].tap() }
            else if app.buttons["完成"].exists { app.buttons["完成"].tap() }
        } else {
            XCTAssertTrue(app.buttons["简体中文"].waitForExistence(timeout: 5))
            app.buttons["简体中文"].tap()
        }
        XCTAssertTrue(app.buttons["揭晓答案"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["先想一想，再揭晓答案，看看自己是否答对。共20道脑洞题，免费游玩，无需注册。"].waitForExistence(timeout: 10))
        XCTAssertEqual(app.textFields.count, 0)
        capture(app, "02-actual-game-Chinese")
        app.terminate()
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["题目语言"].waitForExistence(timeout: 20))
        app.swipeUp()
        let reset = app.buttons["重置进度"]
        for _ in 0..<9 where !reset.isHittable { app.swipeUp() }
        XCTAssertTrue(reset.exists)
        reset.tap()
        XCTAssertTrue(app.alerts.firstMatch.waitForExistence(timeout: 5))
        app.alerts.buttons["取消"].tap()
        reset.tap()
        app.alerts.buttons["重置"].tap()
        let hint = app.buttons["查看提示"]
        for _ in 0..<9 where !hint.isHittable { app.swipeDown() }
        hint.tap()
        app.buttons["揭晓答案"].tap()
        let got = app.switches["我想对了"]
        for _ in 0..<3 where !got.isHittable { app.swipeUp() }
        XCTAssertTrue(got.exists)
        got.tap()
        capture(app, "03-actual-Chinese-answer-and-assessment")
        XCUIDevice.shared.orientation = .landscapeLeft
        capture(app, "04-actual-landscape")
        XCUIDevice.shared.orientation = .portrait
    }
}

extension TwistUITests {
    func testPrivacyRoundTripPreservesProgress() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.buttons["Reveal answer"].waitForExistence(timeout: 15) || app.buttons["揭晓答案"].waitForExistence(timeout: 5))
        let answer = app.buttons["Reveal answer"].exists ? app.buttons["Reveal answer"] : app.buttons["揭晓答案"]
        if answer.isEnabled { answer.tap() }
        let privacy = app.links["Privacy / 隐私"]
        for _ in 0..<9 where !privacy.isHittable { app.swipeUp() }
        XCTAssertTrue(privacy.exists)
        privacy.tap()
        let back = app.links["← Game / 返回游戏"]
        XCTAssertTrue(back.waitForExistence(timeout: 10))
        back.tap()
        XCTAssertTrue(app.buttons["Reveal answer"].waitForExistence(timeout: 10) || app.buttons["揭晓答案"].waitForExistence(timeout: 5))
        let restored = app.buttons["Reveal answer"].exists ? app.buttons["Reveal answer"] : app.buttons["揭晓答案"]
        XCTAssertFalse(restored.isEnabled)
    }
}

extension TwistUITests {
    func testDarkAppearanceScreenshot() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-twist-dark"]
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20) || app.descendants(matching: .any)["题目语言"].waitForExistence(timeout: 5))
        let darkReady = NSPredicate { _, _ in
            guard let image = app.screenshot().image.cgImage,
                  let pixel = image.cropping(to: CGRect(x: 10, y: image.height / 3, width: 1, height: 1)) else { return false }
            var rgba = [UInt8](repeating: 0, count: 4)
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            guard let context = CGContext(data: &rgba, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4,
                                          space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
            context.draw(pixel, in: CGRect(x: 0, y: 0, width: 1, height: 1))
            return Int(rgba[0]) + Int(rgba[1]) + Int(rgba[2]) < 240
        }
        expectation(for: darkReady, evaluatedWith: nil)
        waitForExpectations(timeout: 10)
        let item = XCTAttachment(screenshot: app.screenshot())
        item.name = "05-actual-dark-appearance"
        item.lifetime = .keepAlways
        add(item)
    }
}


final class RemediationUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
    }
    override func tearDownWithError() throws {
        XCUIDevice.shared.orientation = .portrait
    }

    func testActualWKFullGameplayAndNativeRecovery() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-twist-qa-suite"]
        app.launch()
        let result = app.staticTexts["twist-qa-result"]
        XCTAssertTrue(result.waitForExistence(timeout: 40))
        XCTAssertEqual(result.label, "WK QA PASS 8/8")
        XCTAssertFalse(app.staticTexts["twist-startup-error"].exists)
        let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = "TWIST-11-actual-WK-suite"; shot.lifetime = .keepAlways; add(shot)
        app.terminate()
        app.launchArguments = []
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20))
        let reflection = app.switches["I settled on my first guess too quickly"]
        for _ in 0..<7 where !reflection.isHittable { app.swipeUp() }
        XCTAssertTrue(reflection.exists)
        let next = app.buttons["Next challenge →"]
        for _ in 0..<10 where !next.isHittable { app.swipeUp() }
        XCTAssertTrue(next.exists)
        XCTAssertFalse(next.isEnabled)
        XCTAssertTrue(app.staticTexts["Correct 10 / 10"].exists)
        let privacy = app.links["Privacy / 隐私"]
        for _ in 0..<7 where !privacy.isHittable { app.swipeUp() }
        privacy.tap()
        let back = app.links["← Game / 返回游戏"]
        XCTAssertTrue(back.waitForExistence(timeout: 10)); back.tap()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20))
        for _ in 0..<10 where !next.isHittable { app.swipeUp() }
        XCTAssertTrue(app.staticTexts["Correct 10 / 10"].exists)
    }

    func testTouchReasoningReflectionStudioAndLandscape() throws {
        let app = XCUIApplication(); app.launchArguments=["-twist-qa-suite"];app.launch()
        XCTAssertTrue(app.staticTexts["twist-qa-result"].waitForExistence(timeout: 40));app.terminate();app.launchArguments=[];app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20) || app.descendants(matching: .any)["题目语言"].waitForExistence(timeout: 3))
        // Fresh fixture from the full WK suite is English and has a revealed classic.
        let lens = app.switches["Word meaning"]
        for _ in 0..<7 where !lens.isHittable { app.swipeUp() }
        XCTAssertTrue(lens.exists); lens.tap()
        let reflection = app.switches["I overlooked another interpretation"]
        for _ in 0..<5 where !reflection.isHittable { app.swipeUp() }
        XCTAssertTrue(reflection.exists); reflection.tap()
        let restart = app.buttons["Restart studio"]
        for _ in 0..<9 where !restart.isHittable { app.swipeUp() }
        restart.tap(); XCTAssertTrue(app.alerts.firstMatch.waitForExistence(timeout: 5));app.alerts.buttons["Reset"].tap()
        let blue = app.buttons["BLUE"]
        for _ in 0..<5 where !blue.isHittable { app.swipeDown() }
        XCTAssertTrue(blue.exists);blue.tap()
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label BEGINSWITH %@", "Correct deduction.")).firstMatch.waitForExistence(timeout: 5))
        XCUIDevice.shared.orientation = .landscapeLeft
        // Wait for the rotated frame, then perform a gesture to settle accessibility geometry.
        expectation(for: NSPredicate { _, _ in app.frame.width > app.frame.height }, evaluatedWith: nil)
        waitForExpectations(timeout: 10)
        app.swipeUp()
        // Exercise a control after rotation so screenshots cannot capture the animation.
        let before = XCTAttachment(screenshot: app.screenshot()); before.name="TWIST-11-stable-landscape-before-navigation"; before.lifetime = .keepAlways; add(before)
        let next = app.buttons["Next challenge →"]
        // iOS 26.5 WebKit can report an invalid AX activation point after rotation.
        // Use its actual frame, scroll it into the visible window, and verify the resulting navigation.
        let bounds = app.frame
        for _ in 0..<7 {
            let frame = next.frame
            if bounds.contains(frame) && frame.width > 0 && frame.height > 0 { break }
            app.swipeUp()
        }
        let frame = next.frame
        // AX may expose a partially clipped frame after rotation; the navigation assertion below is authoritative.
        app.coordinate(withNormalizedOffset: .zero).withOffset(CGVector(dx: frame.midX-bounds.minX, dy: frame.midY-bounds.minY)).tap()
        XCTAssertTrue(app.staticTexts["Challenge 2 / 10"].waitForExistence(timeout: 10))
        app.swipeDown()
        let shot = XCTAttachment(screenshot: app.screenshot());shot.name="TWIST-11-landscape-Studio";shot.lifetime = .keepAlways;add(shot)
        XCUIDevice.shared.orientation = .portrait
    }
}

extension RemediationUITests {
    func testCorruptedNativeSaveLaunchesAndAcceptsNewChoices() throws {
        let app=XCUIApplication();app.launchArguments=["-twist-qa-corrupt"];app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["Puzzle language"].waitForExistence(timeout: 20))
        let lens=app.switches["Hidden assumption"]
        for _ in 0..<7 where !lens.isHittable {app.swipeUp()}
        XCTAssertTrue(lens.exists);lens.tap()
        let reveal=app.buttons["Reveal answer"]
        for _ in 0..<7 where !reveal.isHittable {app.swipeUp()}
        reveal.tap()
        let reflection=app.switches["I overlooked another interpretation"]
        for _ in 0..<7 where !reflection.isHittable {app.swipeDown()}
        XCTAssertTrue(reflection.exists);reflection.tap()
        XCTAssertFalse(app.staticTexts["twist-startup-error"].exists)
    }
}


final class AccessibilityUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
    }
    func testEnglishAndChineseAccessibilityAudit() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-twist-qa-suite"]
        app.launch()
        XCTAssertTrue(app.staticTexts["twist-qa-result"].waitForExistence(timeout: 40))
        app.terminate(); app.launchArguments = []; app.launch()
        let language = app.descendants(matching: .any)["Puzzle language"]
        XCTAssertTrue(language.waitForExistence(timeout: 20))
        let checks: XCUIAccessibilityAuditType = [.contrast, .hitRegion, .sufficientElementDescription, .dynamicType, .textClipped, .trait]
        try app.performAccessibilityAudit(for: checks) { issue in
            let detail = "\(issue.compactDescription): \(issue.detailedDescription)\n\(issue.element?.debugDescription ?? "no element")"
            print("TWIST_A11Y_ISSUE: " + detail)
            let attachment = XCTAttachment(string: detail); attachment.name="Build4-accessibility-issue";attachment.lifetime = .keepAlways;self.add(attachment)
            return false // Record every issue as a failure; no audit finding is suppressed.
        }
        let reflection = app.switches["I overlooked another interpretation"]
        for _ in 0..<7 where !reflection.isHittable { app.swipeUp() }
        XCTAssertTrue(reflection.exists)
        try app.performAccessibilityAudit(for: checks) { issue in
            let detail = "\(issue.compactDescription): \(issue.detailedDescription)\n\(issue.element?.debugDescription ?? "no element")"
            print("TWIST_A11Y_ISSUE: " + detail)
            let attachment = XCTAttachment(string: detail); attachment.name="Build4-accessibility-issue";attachment.lifetime = .keepAlways;self.add(attachment)
            return false // Record every issue as a failure; no audit finding is suppressed.
        }
        let studio = app.buttons["Restart studio"]
        for _ in 0..<9 where !studio.isHittable { app.swipeUp() }
        XCTAssertTrue(studio.exists)
        try app.performAccessibilityAudit(for: checks) { issue in
            let detail = "\(issue.compactDescription): \(issue.detailedDescription)\n\(issue.element?.debugDescription ?? "no element")"
            print("TWIST_A11Y_ISSUE: " + detail)
            let attachment = XCTAttachment(string: detail); attachment.name="Build4-accessibility-issue";attachment.lifetime = .keepAlways;self.add(attachment)
            return false // Record every issue as a failure; no audit finding is suppressed.
        }
        for _ in 0..<12 where !language.isHittable { app.swipeDown() }
        language.tap()
        if app.pickerWheels.firstMatch.waitForExistence(timeout: 2) {
            app.pickerWheels.firstMatch.adjust(toPickerWheelValue: "简体中文")
            if app.buttons["Done"].exists {app.buttons["Done"].tap()}
            else if app.buttons["完成"].exists {app.buttons["完成"].tap()}
        } else {app.buttons["简体中文"].tap()}
        XCTAssertTrue(app.descendants(matching: .any)["题目语言"].waitForExistence(timeout: 10))
        try app.performAccessibilityAudit(for: checks) { issue in
            let detail = "\(issue.compactDescription): \(issue.detailedDescription)\n\(issue.element?.debugDescription ?? "no element")"
            print("TWIST_A11Y_ISSUE: " + detail)
            let attachment = XCTAttachment(string: detail); attachment.name="Build4-accessibility-issue";attachment.lifetime = .keepAlways;self.add(attachment)
            return false // Record every issue as a failure; no audit finding is suppressed.
        }
        let shot = XCTAttachment(screenshot: app.screenshot());shot.name="Build4-Chinese-accessibility";shot.lifetime = .keepAlways;add(shot)
    }
}


extension AccessibilityUITests {
    func testLargestDynamicTypeHasNoHorizontalOverflow() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-UIPreferredContentSizeCategoryName", UIContentSizeCategory.accessibilityExtraExtraExtraLarge.rawValue, "-twist-qa-large-type"]
        app.launch()
        let layout = app.staticTexts["twist-qa-result"]
        XCTAssertTrue(layout.waitForExistence(timeout: 30))
        XCTAssertEqual(layout.label, "WK QA PASS 1/1", "Expected root and language-control fonts >=40pt and no horizontal document overflow")
        let language = app.descendants(matching: .any)["Puzzle language"].exists ? app.descendants(matching: .any)["Puzzle language"] : app.descendants(matching: .any)["题目语言"]
        XCTAssertTrue(language.exists)
        let shot = XCTAttachment(screenshot: app.screenshot());shot.name="Build4-largest-Dynamic-Type";shot.lifetime = .keepAlways;add(shot)
        XCTAssertFalse(app.staticTexts["twist-startup-error"].exists)
    }
}
