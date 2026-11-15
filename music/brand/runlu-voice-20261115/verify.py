"""Offline composition and manifest checks. No network."""
import json
from pathlib import Path
r=Path(__file__).resolve().parent
p=json.loads((r/'project.json').read_text())
assert p['human_listening_approved'] is False
assert len(p['tracks'])==2
assert sum(e['beats'] for e in p['written_identity_theme'])==8
assert p['target_seconds']==54*240/74
for track in p['tracks']:
    cursor=1
    for section in track['sections']:
        assert section['from_bar']==cursor
        cursor+=section['bars']
    assert cursor==55
    prompt=(r/(track['id']+'.prompt.txt')).read_text()
    assert 0<len(prompt)<12000
    assert '175 seconds' in prompt
    print(track['id'], 'PASS: 54 bars, target 175.14 seconds, prompt',len(prompt),'characters')
lyrics=(r/'LYRICS.md').read_text()
lines=[line for line in lyrics.splitlines() if line and not line.startswith(('#','[','润庐之声','歌词是'))]
# Alternating singer cues are stripped, while their lines are retained.
lines=[line.split('] ',1)[-1] for line in lyrics.splitlines() if line and (line.startswith(('[Male] ','[Female] ')) or not line.startswith(('#','[','润庐之声','歌词是')))]
assert len(lines)==20,lines
assert all(len(line)==8 for line in lines),lines
song=(r/'where-the-light-is-home.prompt.txt').read_text()
assert all(line in song for line in lines)
assert lyrics.count('润庐为你留一盏灯')==1 and lyrics.count('润庐与你慢慢生长')==1
assert 'INSTRUMENTAL ONLY' in (r/'runlu-voice-instrumental.prompt.txt').read_text()
print('PASS: 20 original eight-character lyric lines, complete prompts, no listening claims')
