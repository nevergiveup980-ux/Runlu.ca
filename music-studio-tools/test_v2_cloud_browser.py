"""Cloud UI interaction test with mocked Auth/API/Storage, not live cloud acceptance."""
import hashlib
import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
ID='00000000-0000-4000-8000-000000002a01'
PROJECT='https://ekrnknlawekeoszzkamd.supabase.co'

def main():
    audio=Path(os.environ['RUNLU_TEST_MP3']).read_bytes()
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as pw, TemporaryDirectory() as temp:
            browser=pw.chromium.launch(headless=True)
            context=browser.new_context(accept_downloads=True)
            page=context.new_page()
            calls=[]
            state={'expired':False,'unavailable':True}
            def auth(route):
                if '/auth/v1/token' in route.request.url:
                    route.fulfill(json={'access_token':'fake-test-token','expires_in':3600,'user':{'is_anonymous':False}})
                elif '/auth/v1/logout' in route.request.url:
                    route.fulfill(json={})
                elif '/storage/v1/' in route.request.url:
                    route.fulfill(body=audio,content_type='audio/mpeg')
                else:
                    raise AssertionError('Unexpected external request: '+route.request.url)
            page.route(PROJECT+'/**',auth)
            def api(route):
                calls.append(route.request.url)
                assert route.request.headers.get('authorization')=='Bearer fake-test-token'
                if state['expired']:
                    route.fulfill(status=401,json={'error_code':'UNAUTHENTICATED'})
                elif '/access' in route.request.url:
                    if state['unavailable']:
                        route.fulfill(status=409,json={'error_code':'AUDIO_NOT_READY'})
                    else:
                        route.fulfill(json={'url':PROJECT+'/storage/v1/object/sign/runlu-music-private/test.mp3?token=fake','expires_in':60})
                else:
                    route.fulfill(json={'items':[{'id':ID,'song_id':ID,'title':'When the Lights Go Down','version':'V1','duration':182,'status':'imported','created_at':'2026-11-12T01:00:00Z','audio_available':True}],'has_more':False,'next_cursor':None})
            page.route('**/api/music/**',api)
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/music-studio-v2.html')
            assert not calls
            page.locator('#cloud-email').fill('fixture@example.test')
            page.locator('#cloud-password').fill('fake-test-password')
            page.locator('#cloud-submit').click()
            page.wait_for_selector('#cloud-songs article')
            page.get_by_role('button',name='试听 / 刷新播放链接').click()
            page.wait_for_function("() => document.querySelector('#cloud-songs article p').textContent.includes('尚未保存')")
            state['unavailable']=False
            page.get_by_role('button',name='试听 / 刷新播放链接').click()
            page.wait_for_function("() => document.querySelector('#cloud-songs audio').readyState>=1")
            page.locator('#cloud-songs audio').evaluate('(a)=>a.play()')
            page.wait_for_function("() => document.querySelector('#cloud-songs audio').currentTime>0")
            with page.expect_download() as pending:
                page.locator('#cloud-songs button').last.click()
            downloaded=pending.value
            assert downloaded.suggested_filename=='When the Lights Go Down-V1.mp3'
            target=Path(temp)/'cloud.mp3';downloaded.save_as(target)
            assert hashlib.sha256(target.read_bytes()).digest()==hashlib.sha256(audio).digest()
            assert page.evaluate('localStorage.length')==0
            state['expired']=True
            page.locator('#cloud-refresh').click()
            page.wait_for_function("() => document.querySelector('#cloud-status').textContent.includes('登录已失效')")
            assert page.locator('#cloud-songs article').count()==0
            assert not errors,errors
            browser.close()
            print('PASS: mocked cloud login, no auto requests, not-ready error, refreshed link playback, named byte-identical download, no persisted token, 401 clears private media. Not live JWT/storage/iPhone.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__': main()
