"""Mobile Chromium acceptance of the standalone, no-cost music demo."""
from playwright.sync_api import sync_playwright, expect
from test_browser import serve

def test_offline_acceptance():
    with serve() as base, sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, accept_downloads=True)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(base.replace("/music-studio.html", "/music-studio-offline-acceptance.html"))
            expect(page.locator("#status")).to_contain_text("Ready")
            expect(page.locator("#download")).to_be_disabled()
            page.locator("#start").click()
            expect(page.locator("#status")).to_contain_text("Completed", timeout=10000)
            expect(page.locator("#download")).to_be_enabled()
            page.wait_for_function("document.querySelector('#player').readyState >= 1")
            duration = page.locator("#player").evaluate("(el) => el.duration")
            assert 2.9 <= duration <= 3.1, duration
            page.locator("#player").evaluate("(el) => el.play()")
            page.wait_for_function("document.querySelector('#player').currentTime > 0.05")
            page.locator("#player").evaluate("(el) => el.pause()")
            assert page.locator("#player").evaluate("(el) => el.paused")
            with page.expect_download() as event:
                page.locator("#download").click()
            download = event.value
            assert download.suggested_filename == "runlu-offline-test-tone.wav"
            with open(download.path(), "rb") as handle:
                assert handle.read(4) == b"RIFF"
            page.locator("#fail").click()
            expect(page.locator("#status")).to_contain_text("Failed")
            expect(page.locator("#download")).to_be_disabled()
            page.locator("#start").click()
            expect(page.locator("#status")).to_contain_text("Completed", timeout=10000)
            page.locator("#forbidden").click()
            expect(page.locator("#security")).to_contain_text("403")
            expect(page.locator("#download")).to_be_enabled()
            page.locator("#unauth").click()
            expect(page.locator("#security")).to_contain_text("401")
            expect(page.locator("#download")).to_be_disabled()
            expect(page.locator("#status")).to_contain_text("private playback cleared")
            assert not page.locator("#player").get_attribute("src")
            # A pending async completion must not restore audio after session expiry.
            page.locator("#start").click()
            expect(page.locator("#status")).to_contain_text("Queued")
            page.locator("#unauth").click()
            expect(page.locator("#status")).to_contain_text("private playback cleared")
            page.wait_for_timeout(1500)
            expect(page.locator("#download")).to_be_disabled()
            assert not page.locator("#player").get_attribute("src")
            page.locator("#reset").click()
            expect(page.locator("#download")).to_be_disabled()
            expect(page.locator("#status")).to_contain_text("Ready")
            assert not errors, errors
        finally:
            browser.close()

if __name__ == "__main__":
    test_offline_acceptance()
