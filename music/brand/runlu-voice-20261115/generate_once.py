"""RUNLU brand music single-pass pair. Dry run by default; no retries, no overwrite."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parent
API = 'https://generativelanguage.googleapis.com/v1beta/interactions'
LIMIT = 36 * 1024 * 1024

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def extract(payload):
    blocks = [b for s in payload.get('steps', []) if s.get('type') == 'model_output'
              for b in s.get('content', []) if b.get('type') == 'audio']
    if len(blocks) != 1:
        raise ValueError('Expected one complete audio block; review response, do not retry')
    data = base64.b64decode(blocks[0]['data'], validate=True)
    if len(data) < 128 or not (data[:3] == b'ID3' or (data[0] == 255 and data[1] & 224 == 224)):
        raise ValueError('Not an MP3; do not retry')
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--confirm-paid', action='store_true')
    args = parser.parse_args()
    selected = ('runlu-voice-instrumental', 'where-the-light-is-home')
    prompts = {v: (ROOT / f'{v}.prompt.txt').read_text() for v in selected}
    for v, prompt in prompts.items():
        if not prompt.strip() or len(prompt) > 12000:
            raise SystemExit('Invalid prompt; no requests sent')
        print(v, 'lyria-3.5', len(prompt), 'characters')
    if not args.confirm_paid:
        print('DRY RUN: zero API requests; no files written')
        return
    if os.environ.get('GITHUB_RUN_ATTEMPT') != '1':
        raise SystemExit('Only first workflow attempt allowed; no requests sent')
    key = os.environ.get('RUNLU_MUSIC_GEMINI_API_KEY')
    if not key:
        raise SystemExit('Missing Secret; no requests sent')
    # Verify decoder before any billable request.
    subprocess.run(['ffmpeg', '-version'], check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['ffprobe', '-version'], check=True, stdout=subprocess.DEVNULL)
    args.output.mkdir(parents=True, exist_ok=False)
    ledger = {'model': 'lyria-3.5', 'run_id': os.environ.get('GITHUB_RUN_ID'),
              'listed_unit_usd': .08, 'actual_billing': 'not_verified', 'results': [], 'target_duration_seconds': 175.14, 'target_bpm': 74}
    def record():
        (args.output / 'results.json').write_text(json.dumps(ledger, indent=2))
    opener = urllib.request.build_opener(NoRedirect())
    for variant, prompt in prompts.items():
        entry = {'variant': variant, 'state': 'request_started_billing_unknown',
                 'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest()}
        ledger['results'].append(entry)
        record()
        request = urllib.request.Request(API, method='POST',
            headers={'Content-Type': 'application/json', 'Api-Revision': '2026-05-20',
                     'x-goog-api-key': key},
            data=json.dumps({'model': 'lyria-3.5', 'input': prompt}, ensure_ascii=False).encode())
        try:
            with opener.open(request, timeout=240) as response:
                raw = response.read(LIMIT + 1)
            if len(raw) > LIMIT:
                raise ValueError('Response too large')
            payload = json.loads(raw)
            data = extract(payload)
            text_blocks = [b.get('text', '') for step in payload.get('steps', [])
                           if step.get('type') == 'model_output'
                           for b in step.get('content', []) if b.get('type') == 'text']
            (args.output / f'{variant}.provider-text.txt').write_text('\n'.join(text_blocks))
            target = args.output / f'{variant}.mp3'
            with target.open('xb') as handle:
                handle.write(data)
            meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
                'format=duration:stream=codec_name,sample_rate,channels', '-of', 'json', str(target)]))
            subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(target), '-f', 'null', '-'], check=True)
            duration = float(meta['format']['duration'])
            if not 10 < duration < 240:
                raise ValueError('Unexpected duration; review without retry')
            stream = next((s for s in meta.get('streams', []) if s.get('codec_name') == 'mp3'), {})
            quality_flags = []
            if not 165 <= duration <= 185:
                quality_flags.append('duration_outside_near_three_minute_target')
            if stream.get('sample_rate') != '44100' or stream.get('channels') != 2:
                quality_flags.append('format_differs_from_documented_44k_stereo')
            entry.update(state='generated_decode_verified_not_listening_approved', quality_flags=quality_flags, filename=target.name,
                         sha256=hashlib.sha256(data).hexdigest(), bytes=len(data), probe=meta)
            record()
            print(variant, 'generated and fully decoded', round(duration, 3), 'seconds', len(data), 'bytes')
        except Exception as error:
            # Never print provider response body, URLs, request headers, or secrets.
            entry.update(state='needs_review_no_retry', error_type=type(error).__name__)
            if isinstance(error, urllib.error.HTTPError):
                entry['http_status'] = error.code
                # Retain bounded provider diagnostics privately; never print secrets.
                try:
                    detail = json.loads(error.read(16384)).get('error', {})
                    entry['provider_error'] = {k: str(detail[k]).replace(key, '[REDACTED]')[:2000]
                                               for k in ('status', 'message') if k in detail}
                except Exception:
                    entry['provider_error'] = {'status': 'unavailable'}
            record()
            raise SystemExit(f'{variant}: {type(error).__name__}; stopped, billing unverified; no retry') from None

if __name__ == '__main__':
    main()
