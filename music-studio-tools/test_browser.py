"""Real Chromium interaction smoke test; no API credentials or paid requests."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
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
            assert page.evaluate("window.__audioUrls.created.length === 2 && window.__audioUrls.revoked.length === 2")
            assert page.locator("body").evaluate("(el) => el.scrollWidth <= window.innerWidth + 1"), "Mobile horizontal overflow"
            assert not errors, f"Browser JavaScript errors: {errors}"
            print("PASS: Chromium mobile viewport, language switching, save/reload, export/import, invalid JSON, audio validation/cleanup, no JS errors")
        finally:
            browser.close()

if __name__ == "__main__":
    test_browser()
