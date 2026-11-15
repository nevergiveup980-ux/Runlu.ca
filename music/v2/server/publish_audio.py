#!/usr/bin/env python3
"""Trusted, single-upload audio publication. Never generates music or retries.
Default is OFFLINE decode/hash only. --commit requires existing server secret.
Never run this from a public web request or put the secret in browser code.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import urllib.error
import urllib.request
import uuid

BUCKET = 'runlu-music-private'
PROJECT = 'https://ekrnknlawekeoszzkamd.supabase.co'
MAX_BYTES = 50 * 1024 * 1024


def validate_audio(path):
    import miniaudio
    data = Path(path).read_bytes()
    if not 128 <= len(data) <= MAX_BYTES:
        raise ValueError('INVALID_AUDIO_SIZE')
    if not (data[:3] == b'ID3' or (data[0] == 255 and data[1] & 224 == 224)):
        raise ValueError('NOT_MP3')
    # Decode the exact bytes that will be uploaded; no path/file race.
    decoded = miniaudio.mp3_read_s16(data)
    duration = decoded.num_frames / decoded.sample_rate
    if not 0 < duration < 1200 or not decoded.samples or decoded.nchannels not in (1, 2):
        raise ValueError('INVALID_AUDIO_DURATION')
    return data, {'duration': duration, 'sha256': hashlib.sha256(data).hexdigest(), 'audio_bytes': len(data)}


def publish(*, data, metadata, owner, song, version_id, title, version, source, send):
    for value in (owner, song, version_id):
        if str(uuid.UUID(value)) != value:
            raise ValueError('INVALID_ID')
    if not title.strip() or len(title) > 120 or version not in ('V1', 'V2') or source not in ('imported', 'completed'):
        raise ValueError('INVALID_METADATA')
    if metadata['sha256'] != hashlib.sha256(data).hexdigest() or metadata['audio_bytes'] != len(data):
        raise ValueError('HASH_MISMATCH')
    # send must use privileged server credentials. Check owner/song BEFORE upload.
    users = send('GET', '/auth/v1/admin/users/' + owner, None)
    user = users.get('user', users)
    if user.get('id') != owner or user.get('is_anonymous') is True:
        raise ValueError('OWNER_NOT_VERIFIED')
    songs = send('GET', '/rest/v1/runlu_music_songs?song_id=eq.' + song + '&select=owner_id', None)
    if songs and songs[0].get('owner_id') != owner:
        raise ValueError('SONG_OWNER_MISMATCH')
    existing = send('GET', '/rest/v1/runlu_music_versions?version_id=eq.' + version_id + '&select=version_id', None)
    if existing:
        raise ValueError('VERSION_ALREADY_EXISTS')
    key = owner + '/' + version_id + '.mp3'
    send('POST', '/storage/v1/object/' + BUCKET + '/' + key, data)
    # Read back exact persisted bytes before publishing a playable version.
    stored = send('GET', '/storage/v1/object/authenticated/' + BUCKET + '/' + key, None)
    if not isinstance(stored, bytes) or hashlib.sha256(stored).hexdigest() != metadata['sha256']:
        raise RuntimeError('STORAGE_VERIFICATION_FAILED_NEEDS_REVIEW_NO_RETRY')
    try:
        send('POST', '/rest/v1/rpc/runlu_music_publish_version', {
            'p_owner': owner, 'p_song': song, 'p_version_id': version_id,
            'p_title': title.strip(), 'p_version': version, 'p_status': source,
            'p_duration': metadata['duration'], 'p_sha256': metadata['sha256'],
            'p_audio_bytes': metadata['audio_bytes']})
    except Exception as error:
        # Orphan stays private: RLS requires a ready, matching version record.
        raise RuntimeError('PUBLISH_UNCERTAIN_NEEDS_REVIEW_NO_RETRY') from error
    return version_id


def transport(secret):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect())
    def send(method, path, payload):
        headers = {'apikey': secret, 'Authorization': 'Bearer ' + secret, 'Cache-Control': 'no-store'}
        if isinstance(payload, bytes):
            headers.update({'Content-Type': 'audio/mpeg', 'x-upsert': 'false'})
        elif payload is not None:
            headers['Content-Type'] = 'application/json'
            payload = json.dumps(payload).encode()
        request = urllib.request.Request(PROJECT + path, data=payload, headers=headers, method=method)
        try:
            with opener.open(request, timeout=60) as response:
                body = response.read(MAX_BYTES + 1)
                if len(body) > MAX_BYTES:
                    raise RuntimeError('RESPONSE_TOO_LARGE')
                return body if response.headers.get_content_type() == 'audio/mpeg' else json.loads(body or b'null')
        except (urllib.error.URLError, TimeoutError) as error:
            raise RuntimeError('BACKEND_REQUEST_FAILED_NO_RETRY') from error
    return send


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--audio', required=True)
    parser.add_argument('--owner')
    parser.add_argument('--song-id')
    parser.add_argument('--version-id')
    parser.add_argument('--title', default='When the Lights Go Down')
    parser.add_argument('--version', choices=['V1', 'V2'], default='V1')
    parser.add_argument('--source', choices=['imported', 'completed'], default='imported')
    parser.add_argument('--commit', action='store_true')
    args = parser.parse_args()
    data, metadata = validate_audio(args.audio)
    if not args.commit:
        print(json.dumps({'mode': 'OFFLINE_ONLY_NO_UPLOAD', **metadata}))
        return
    if not all((args.owner, args.song_id, args.version_id)):
        raise SystemExit('Explicit owner, song-id and unique version-id required. No upload attempted.')
    secret = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not secret:
        raise SystemExit('Existing trusted server credential required; never paste it into chat. No upload attempted.')
    identifier = publish(data=data, metadata=metadata, owner=args.owner, song=args.song_id,
                         version_id=args.version_id, title=args.title, version=args.version,
                         source=args.source, send=transport(secret))
    print('Stored private version:', identifier)


if __name__ == '__main__':
    main()
