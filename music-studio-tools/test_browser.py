"""Real Chromium interaction smoke test; no API credentials or paid requests."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
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
            assert page.locator("body").evaluate("(el) => el.scrollWidth <= window.innerWidth + 1"), "Mobile horizontal overflow"
            assert not errors, f"Browser JavaScript errors: {errors}"
            print("PASS: Chromium mobile viewport, language switching, save/reload, export/import, invalid JSON, no JS errors")
        finally:
            browser.close()

if __name__ == "__main__":
    test_browser()
