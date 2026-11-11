"""Mobile Chromium acceptance of the standalone, no-cost music demo."""
from playwright.sync_api import sync_playwright, expect
import io
import math
import struct
import wave
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
            expect(page.locator("#player")).to_be_hidden()
            expect(page.locator("#audio-empty")).to_be_visible()
            expect(page.locator("#toggle")).to_be_disabled()
            expect(page.locator("#scene")).to_be_visible()
            expect(page.locator("#fullscreen")).to_be_visible()
            expect(page.locator("#scene-file")).to_have_attribute("accept", "image/jpeg,image/png,image/webp,image/heic,image/heif")
            expect(page.locator("#reset-scene")).to_be_visible()
            page.locator("#scene-file").set_input_files({"name":"My_Lake_View.png","mimeType":"image/png","buffer":__import__("base64").b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y+Q6KsAAAAASUVORK5CYII=")})
            expect(page.locator("#caption")).to_contain_text("My Lake View")
            page.locator("#reset-scene").click()
            expect(page.locator("#caption")).to_contain_text("Sunset Road")
            page.locator("#fullscreen").click()
            expect(page.locator("#scene")).to_have_class("expanded")
            expect(page.locator("#close-scene")).to_be_visible()
            page.locator("#close-scene").click()
            expect(page.locator("#scene")).not_to_have_class("expanded")
            expect(page.locator("#style")).to_have_value("folk")
            page.locator("#style").select_option("neon")
            expect(page.locator("#scene")).to_have_class("neon")
            page.locator("#still").click()
            expect(page.locator("#still")).to_have_attribute("aria-pressed", "true")
            page.locator("#waves").click()
            expect(page.locator("#waves")).to_have_attribute("aria-pressed", "true")
            expect(page.locator("details")).not_to_have_attribute("open", "")
            page.locator("#start").click()
            expect(page.locator("#status")).to_contain_text("Completed", timeout=10000)
            expect(page.locator("#download")).to_be_enabled()
            expect(page.locator("#player")).to_be_visible()
            expect(page.locator("#audio-empty")).to_be_hidden()
            expect(page.locator("#toggle")).to_be_enabled()
            page.locator("#repeat").click()
            expect(page.locator("#repeat")).to_contain_text("One")
            page.locator("#repeat").click()
            expect(page.locator("#repeat")).to_contain_text("All")
            page.locator("#repeat").click()
            expect(page.locator("#repeat")).to_contain_text("Off")
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
            expect(page.locator("#player")).to_be_hidden()
            page.locator("#start").click()
            expect(page.locator("#status")).to_contain_text("Completed", timeout=10000)
            page.locator("#forbidden").click()
            expect(page.locator("#security")).to_contain_text("403")
            expect(page.locator("#download")).to_be_enabled()
            page.locator("#unauth").click()
            expect(page.locator("#security")).to_contain_text("401")
            expect(page.locator("#download")).to_be_disabled()
            expect(page.locator("#status")).to_contain_text("private playback cleared")
            expect(page.locator("#player")).to_be_hidden()
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
            buffer = io.BytesIO()
            with wave.open(buffer, "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(8000)
                wav.writeframes(b"".join(struct.pack("<h", int(3000 * math.sin(2 * math.pi * 220 * i / 8000))) for i in range(8000 * 12)))
            page.locator("#local-files").set_input_files({"name": "local-test.wav", "mimeType": "audio/wav", "buffer": buffer.getvalue()})
            expect(page.locator("#track-name")).to_contain_text("local-test.wav")
            expect(page.locator("#toggle")).to_be_enabled()
            page.wait_for_function("document.querySelector('#player').duration >= 11.9")
            page.locator("#forward").click()
            assert page.locator("#player").evaluate("(el) => el.currentTime") >= 9.5
            page.locator("#back").click()
            assert page.locator("#player").evaluate("(el) => el.currentTime") <= 0.5
            page.locator("#seek").evaluate("(el) => { el.value = 6; el.dispatchEvent(new Event(\'input\', {bubbles:true})); }")
            assert 5.5 <= page.locator("#player").evaluate("(el) => el.currentTime") <= 6.5
            expect(page.locator("#playlist li")).to_have_count(1)
            page.locator("#playlist .remove").click()
            expect(page.locator("#playlist li")).to_have_count(0)
            expect(page.locator("#player")).to_be_hidden()
            assert not errors, errors
        finally:
            browser.close()

if __name__ == "__main__":
    test_offline_acceptance()
