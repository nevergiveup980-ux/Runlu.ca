"""Free browser acceptance using an existing private MP3; never uploads audio.
RUNLU_TEST_MP3 must point outside the public repository.
"""
import hashlib
import os
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def main():
    source = Path(os.environ['RUNLU_TEST_MP3'])
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as pw, TemporaryDirectory() as temp:
            options = {'headless': True}
            if os.environ.get('RUNLU_TEST_BROWSER'):
                options['executable_path'] = os.environ['RUNLU_TEST_BROWSER']
            browser = pw.chromium.launch(**options)
            context = browser.new_context(accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/music-studio-v2.html')
            page.wait_for_function("() => document.querySelector('#status').textContent.includes('已就绪')")
            page.locator('#file').set_input_files(str(source))
            page.locator('#save').click()
            page.wait_for_selector('article audio')
            decoded = page.evaluate('''async () => {
              const {openLibrary,transact}=await import('/music/v2/library.mjs');
              const db=await openLibrary();const rows=await transact(db,'readonly',s=>s.getAll());
              const context=new AudioContext();
              try { const audio=await context.decodeAudioData(await rows[0].audio.arrayBuffer());
                return {duration:audio.duration,channels:audio.numberOfChannels};
              } finally {await context.close();db.close();}
            }''')
            assert decoded['duration'] > 180 and decoded['channels'] == 2
            page.locator('article audio').evaluate('(a)=>a.play()')
            page.wait_for_function("() => document.querySelector('audio').currentTime > 0")
            page.locator('article audio').evaluate('(a)=>{a.pause();a.currentTime=30;}')
            assert page.locator('audio').evaluate('(a)=>a.currentTime') >= 29
            page.reload()
            page.wait_for_selector('article audio')
            assert page.locator('article').count() == 1
            with page.expect_download() as pending:
                page.get_by_role('button', name='Download MP3').click()
            download = pending.value
            assert download.suggested_filename == 'When the Lights Go Down-V1.mp3'
            target = Path(temp)/'download.mp3'
            download.save_as(target)
            assert hashlib.sha256(target.read_bytes()).digest() == hashlib.sha256(source.read_bytes()).digest()
            page.locator('#version').select_option('V2')
            page.locator('#file').set_input_files(str(source))
            page.locator('#save').click()
            page.wait_for_function("() => document.querySelectorAll('article').length===2")
            assert 'V1' in page.locator('#songs').inner_text() and 'V2' in page.locator('#songs').inner_text()
            page.locator('#file').set_input_files({'name':'fake.mp3','mimeType':'audio/mpeg','buffer':b'not audio'*100})
            page.locator('#save').click()
            page.wait_for_function("() => document.querySelector('#status').textContent.includes('不是 MP3')")
            assert page.locator('article').count() == 2
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.get_by_role('button',name='Download MP3').first.bounding_box()['height'] >= 44
            page.screenshot(path='/private/tmp/runlu-v2-mobile.png',full_page=True)
            fresh = browser.new_context()
            other = fresh.new_page()
            other.goto(page.url)
            other.wait_for_function("() => document.querySelector('#status').textContent.includes('已就绪')")
            assert other.locator('article').count() == 0
            assert not errors, errors
            browser.close()
            print('PASS: real V1 playback/pause/seek, refresh persistence, byte-identical named download, V1/V2 coexistence, invalid-file rejection, mobile layout, separate-browser isolation. Not real iPhone or hosted RLS.')
    finally:
        server.shutdown()
        server.server_close()

if __name__ == '__main__':
    main()
