"""Real Chromium interaction smoke test; no API credentials or paid requests."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
import io
import math
import struct
import wave
import re
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]

@contextmanager
def serve():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/music-studio.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)

def test_browser():
    with serve() as url, sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 390, "height": 844}, accept_downloads=True)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url)
            page.locator("#title").fill("原创歌曲 · Browser Test")
            page.locator("#lyrics").fill("第一句原创歌词\\n第二句仍然保留")
            page.locator("#notes").fill("自然换气，原创旋律")
            page.locator("#voice").select_option("female")
            page.locator("#style").select_option("nostalgic")
            page.locator("#languageToggle").select_option("zh")
            page.locator("#save").click()
            assert "草稿已保存在此浏览器" in page.locator("#status").inner_text()
            for lang in ("en", "fr", "es", "zh"):
                page.locator("#languageToggle").select_option(lang)
                assert page.locator("html").get_attribute("data-runlu-language") == lang
                assert page.locator("#lyrics").input_value() == "第一句原创歌词\\n第二句仍然保留"
            page.reload()
            assert page.locator("#title").input_value() == "原创歌曲 · Browser Test"
            assert page.locator("#lyrics").input_value() == "第一句原创歌词\\n第二句仍然保留"
            assert page.locator("#notes").input_value() == "自然换气，原创旋律"
            assert page.locator("#voice").input_value() == "female"
            assert page.locator("#style").input_value() == "nostalgic"
            with page.expect_download() as download_info:
                page.locator("#export").click()
            download = download_info.value
            assert download.suggested_filename == "runlu-music-project.json"
            # Download real UTF-8 prompt and verify original Chinese content.
            with page.expect_download() as prompt_download_info:
                page.locator("#exportprompt").click()
            prompt_download = prompt_download_info.value
            assert prompt_download.suggested_filename == "runlu-music-generation-prompt.txt"
            prompt_bytes = Path(prompt_download.path()).read_bytes()
            assert prompt_bytes.startswith(bytes([0xEF, 0xBB, 0xBF]))
            prompt_text = prompt_bytes.decode("utf-8-sig")
            assert "原创歌曲 · Browser Test" in prompt_text
            assert "第一句原创歌词" in prompt_text
            assert "第二句仍然保留" in prompt_text
            assert "mature expressive female voice" in prompt_text
            assert "natural phrasing" in prompt_text
            # Instrumental mode must never ask the model to sing the lyrics.
            page.locator("#voice").select_option("instrumental")
            assert "No singing" in page.locator("#prompt").inner_text()
            assert "Instrumental theme inspiration" in page.locator("#prompt").inner_text()
            page.locator("#voice").select_option("female")
            # Import a project into the editor, then save and reload it.
            import json
            project = {"schema": "runlu-music-studio-v1", "title": "导入测试曲",
                       "lyrics": "导入的原创歌词", "voice": "male",
                       "style": "nostalgic", "notes": "导入成功"}
            page.locator("#importfile").set_input_files({
                "name": "runlu-music-project.json",
                "mimeType": "application/json",
                "buffer": json.dumps(project, ensure_ascii=False).encode("utf-8")
            })
            expect(page.locator("#title")).to_have_value("导入测试曲")
            expect(page.locator("#lyrics")).to_have_value("导入的原创歌词")
            expect(page.locator("#voice")).to_have_value("male")
            page.locator("#save").click()
            page.reload()
            assert page.locator("#lyrics").input_value() == "导入的原创歌词"
            # Reject malformed JSON without overwriting existing content.
            page.locator("#importfile").set_input_files({
                "name": "invalid.json", "mimeType": "application/json",
                "buffer": b"{invalid json"
            })
            assert page.locator("#lyrics").input_value() == "导入的原创歌词"
            # Exercise local audio loading, replacement and cleanup without playback or network.
            page.evaluate("""() => {
                window.__audioUrls = {created: [], revoked: []};
                const realCreate = URL.createObjectURL.bind(URL);
                const realRevoke = URL.revokeObjectURL.bind(URL);
                URL.createObjectURL = blob => {
                    const url = realCreate(blob);
                    window.__audioUrls.created.push(url);
                    return url;
                };
                URL.revokeObjectURL = url => {
                    window.__audioUrls.revoked.push(url);
                    return realRevoke(url);
                };
            }""")
            for name in ("first.mp3", "replacement.mp3"):
                page.locator("#audiofile").set_input_files({
                    "name": name, "mimeType": "audio/mpeg", "buffer": b"ID3" + bytes(64)
                })
                expect(page.locator("#audioplayer")).to_have_attribute("src", re.compile(r"^blob:"))
            assert page.evaluate("window.__audioUrls.created[0] === window.__audioUrls.revoked[0]")
            # Load a genuinely decodable, original synthetic WAV tone.
            wav_bytes = io.BytesIO()
            with wave.open(wav_bytes, "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(16000)
                samples = (int(4500 * math.sin(2 * math.pi * 440 * i / 16000)) for i in range(16000))
                wav.writeframes(b"".join(struct.pack("<h", value) for value in samples))
            page.locator("#audiofile").set_input_files({
                "name": "original-test-tone.wav", "mimeType": "audio/wav",
                "buffer": wav_bytes.getvalue()
            })
            page.wait_for_function("document.querySelector('#audioplayer').readyState >= 1")
            assert 0.9 <= page.locator("#audioplayer").evaluate("(el) => el.duration") <= 1.1
            page.locator("#audioplayer").evaluate("(el) => el.play()")
            page.wait_for_function("document.querySelector('#audioplayer').currentTime > 0.05")
            page.locator("#audioplayer").evaluate("(el) => el.pause()")
            assert page.locator("#audioplayer").evaluate("(el) => el.paused")
            # Rejected files must not replace the existing audio or revoke its URL.
            current_src = page.locator("#audioplayer").get_attribute("src")
            revoked_before = page.evaluate("window.__audioUrls.revoked.length")
            page.locator("#audiofile").set_input_files({
                "name": "not-a-song.txt", "mimeType": "text/plain", "buffer": b"not audio"
            })
            expect(page.locator("#audioplayer")).to_have_attribute("src", current_src)
            assert page.evaluate("window.__audioUrls.revoked.length") == revoked_before
            assert "MP3" in page.locator("#status").inner_text()
            with TemporaryDirectory() as tmp:
                oversized = Path(tmp) / "oversized.mp3"
                with oversized.open("wb") as audio:
                    audio.write(b"ID3")
                    audio.seek(50 * 1024 * 1024)
                    audio.write(b"0")
                page.locator("#audiofile").set_input_files(str(oversized))
            expect(page.locator("#audioplayer")).to_have_attribute("src", current_src)
            assert page.evaluate("window.__audioUrls.revoked.length") == revoked_before
            assert "50 MB" in page.locator("#status").inner_text()
            page.locator("#clearaudio").click()
            expect(page.locator("#audioplayer")).not_to_have_attribute("src", re.compile(r"^blob:"))
            assert page.evaluate("window.__audioUrls.created.length === 3 && window.__audioUrls.revoked.length === 3")
            assert page.locator("body").evaluate("(el) => el.scrollWidth <= window.innerWidth + 1"), "Mobile horizontal overflow"
            assert not errors, f"Browser JavaScript errors: {errors}"
            print("PASS: Chromium mobile viewport, language switching, save/reload, export/import, invalid JSON, decodable WAV playback, audio validation/cleanup, no JS errors")
        finally:
            browser.close()

if __name__ == "__main__":
    test_browser()
