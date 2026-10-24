import XCTest
import UIKit

final class TwistUITests: XCTestCase {
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
        if !share.isHittable { app.swipeUp() }
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
        XCTAssertTrue(app.buttons["Puzzle language"].waitForExistence(timeout: 20) || app.buttons["题目语言"].waitForExistence(timeout: 5))
        let language = app.buttons["Puzzle language"].exists ? app.buttons["Puzzle language"] : app.buttons["题目语言"]
        XCTAssertTrue(language.waitForExistence(timeout: 20))
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
        capture(app, "02-actual-game-Chinese")
        app.terminate()
        app.launch()
        XCTAssertTrue(app.buttons["题目语言"].waitForExistence(timeout: 20))
        app.swipeUp()
        let reset = app.buttons["重置进度"]
        for _ in 0..<3 where !reset.isHittable { app.swipeUp() }
        XCTAssertTrue(reset.exists)
        reset.tap()
        XCTAssertTrue(app.alerts.firstMatch.waitForExistence(timeout: 5))
        app.alerts.buttons["取消"].tap()
        reset.tap()
        app.alerts.buttons["重置"].tap()
        let hint = app.buttons["查看提示"]
        for _ in 0..<3 where !hint.isHittable { app.swipeDown() }
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
        for _ in 0..<4 where !privacy.isHittable { app.swipeUp() }
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
        XCTAssertTrue(app.buttons["Puzzle language"].waitForExistence(timeout: 20) || app.buttons["题目语言"].waitForExistence(timeout: 5))
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
