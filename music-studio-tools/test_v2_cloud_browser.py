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
            engine=os.environ.get('RUNLU_TEST_ENGINE','chromium')
            if engine not in ('chromium','webkit'): raise ValueError('Unsupported test engine')
            browser=getattr(pw,engine).launch(headless=True)
            device=pw.devices['iPhone 13'] if engine=='webkit' else {}
            context=browser.new_context(accept_downloads=True,**device)
            page=context.new_page()
            calls=[]
            state={'expired':False,'unavailable':True,'download_failed':False,'auth_error':True,'auth_network':False}
            def auth(route):
                if '/auth/v1/token' in route.request.url:
                    if state['auth_network']:
                        route.abort();return
                    if state['auth_error']:
                        route.fulfill(status=400,json={'code':'invalid_credentials'});return
                    route.fulfill(json={'access_token':'fake-test-token','expires_in':3600,'user':{'is_anonymous':False}})
                elif '/auth/v1/logout' in route.request.url:
                    route.fulfill(json={})
                elif '/storage/v1/' in route.request.url:
                    if state['download_failed']: route.fulfill(status=403,json={'error':'expired'})
                    else: route.fulfill(body=audio,content_type='audio/mpeg')
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
            page.wait_for_function("() => document.querySelector('#cloud-status').textContent.includes('密码不正确')")
            assert page.locator('#cloud-login').is_visible()
            assert not calls
            state['auth_error']=False
            page.locator('#cloud-password').fill('fake-test-password')
            page.locator('#cloud-submit').click()
            page.wait_for_selector('#cloud-songs article')
            assert not page.locator('#cloud-login').is_visible()
            assert page.locator('#cloud-account').inner_text()=='已登录：fixture@example.test'
            page.get_by_role('button',name='试听 / 刷新播放链接').click()
            page.wait_for_function("() => document.querySelector('#cloud-songs article p').textContent.includes('尚未保存')")
            state['unavailable']=False
            page.get_by_role('button',name='试听 / 刷新播放链接').click()
            page.wait_for_function("() => document.querySelector('#cloud-songs audio').readyState>=1")
            page.locator('#cloud-songs audio').evaluate('(a)=>a.play()')
            page.wait_for_function("() => document.querySelector('#cloud-songs audio').currentTime>0")
            state['download_failed']=True
            page.locator('#cloud-songs button').last.click()
            page.wait_for_function("() => document.querySelector('#cloud-songs article p').textContent.includes('下载失败或链接已过期')")
            assert page.locator('#cloud-songs button').last.is_enabled()
            state['download_failed']=False
            with page.expect_download() as pending:
                page.locator('#cloud-songs button').last.click()
            downloaded=pending.value
            assert downloaded.suggested_filename=='When the Lights Go Down-V1.mp3'
            target=Path(temp)/'cloud.mp3';downloaded.save_as(target)
            assert hashlib.sha256(target.read_bytes()).digest()==hashlib.sha256(audio).digest()
            fallback=page.get_by_role('link',name='未开始下载？点此打开或保存 MP3')
            assert fallback.is_visible()
            assert fallback.get_attribute('download')=='When the Lights Go Down-V1.mp3'
            assert page.evaluate('localStorage.length')==0
            state['expired']=True
            page.locator('#cloud-refresh').click()
            page.wait_for_function("() => document.querySelector('#cloud-status').textContent.includes('登录已失效')")
            assert page.locator('#cloud-songs article').count()==0
            assert page.locator('#cloud-login').is_visible()
            assert not page.locator('#cloud-account').is_visible()
            state['auth_network']=True
            page.locator('#cloud-password').fill('fake-test-password')
            page.locator('#cloud-submit').click()
            page.wait_for_function("() => document.querySelector('#cloud-status').textContent.includes('无法连接 RUNLU 账号服务')")
            assert page.locator('#cloud-submit').is_enabled()
            assert not errors,errors
            browser.close()
            print(engine + ': PASS: mocked cloud login, no auto requests, not-ready error, refreshed link playback, named byte-identical download, no persisted token, 401 clears private media. Not live JWT/storage/iPhone.')
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__': main()
