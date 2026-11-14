"""Offline score validation. No network, generation, storage, or retries."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
hooks = []
for variant in 'ABC':
    score = json.loads((root / f'{variant}.score.json').read_text())
    assert score['status'] == 'composition_draft_not_generated'
    assert score['audio_available'] is False and score['audio'] is None
    assert score['key'] == 'G minor' and score['bpm'] == 70
    assert len(score['bars']) == 50
    vocal_count = 0
    for number, bar in enumerate(score['bars'], 1):
        assert bar['number'] == number
        events = bar.get('vocal', bar.get('guitar'))
        assert sum(e['beats'] for e in events) == 4, (variant, number)
        for event in events:
            assert re.fullmatch(r'(?:[A-G](?:b|#)?[2-6]|R)', event['pitch'])
            assert event['beats'] > 0
        if 'vocal' in bar:
            vocal_count += len(events)
            assert len(bar['line']) == 8
            assert bar['singer'] in ('Male', 'Female', 'Together')
    assert vocal_count == 160
    # Syllable order must match each full two-bar lyric line.
    for index in range(4, 48, 2):
        pair = score['bars'][index:index + 2]
        if 'vocal' in pair[0]:
            assert ''.join(e['syllable'] for b in pair for e in b['vocal']) == pair[0]['line']
    hooks.append([e['pitch'] for b in score['bars'][24:26] for e in b['vocal']])
    prompt = (root / f'{variant}.prompt.txt').read_text()
    assert 'NOT GENERATED AUDIO' in prompt and '70 BPM' in prompt
    assert '我们就是家的意义' in prompt
    print(f'{variant}: PASS — 50 bars, 160 lyric syllables, 4 beats/bar, no audio; target {50*4*60/70:.2f}s')
assert len({tuple(h) for h in hooks}) == 3
assert not list(root.glob('*.mp3')) and not list(root.glob('*.wav'))
print('PASS — three distinct hooks; no playable audio artifacts')
