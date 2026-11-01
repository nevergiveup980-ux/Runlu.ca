"""Read-only content extraction/scan; outputs evidence, never a rights clearance."""
import csv, hashlib, json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parents[3]
html = (root / 'twist.html').read_text()
en = json.loads(re.search(r'^const puzzles=(.*);$', html, re.M)[1])
zh = json.loads(re.search(r'^const zh=(.*);$', html, re.M)[1])
explain_match = re.search(r'^const explanations=\{en:(\[.*\]),zh:(\[.*\])\};$', html, re.M)
explain_en, explain_zh = (json.loads(v) for v in explain_match.groups())
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
assert len(en) == len(zh) == len(explain_en) == len(explain_zh) == 20
assert en[0][2].startswith('A conversation.') and zh[0][2].startswith('一段对话。')
assert '1975' not in html and '房间号' not in html
with (out / 'classic-content-register.csv').open('w', newline='') as stream:
    writer = csv.writer(stream)
    writer.writerow(['puzzle', 'english_question', 'english_hint', 'english_answer',
                     'chinese_question', 'chinese_hint', 'chinese_answer',
                     'english_explanation', 'chinese_explanation', 'immediate_source',
                     'english_rights', 'translation_rights', 'explanation_rights'])
    for i, (a, b) in enumerate(zip(en, zh), 1):
        source = 'Git 536199c replacement; newly authored claim not legal originality proof' if i == 1 else 'Git 166fe24 initial collection; external acquisition source UNKNOWN'
        writer.writerow([i, *a, *b, explain_en[i-1], explain_zh[i-1], source,
                         'UNKNOWN', 'UNKNOWN', 'UNKNOWN'])
product = Path(sys.argv[2])
if product.suffix == '.xcarchive':
    product = next((product / 'Products/Applications').glob('*.app'))
web = product / 'Web'
hits = []
files = []
for path in sorted(web.rglob('*')):
    if not path.is_file(): continue
    data = path.read_bytes()
    files.append({'file': str(path.relative_to(product)), 'bytes': len(data),
                  'sha256': hashlib.sha256(data).hexdigest()})
    for text in ['1975', '房间号', 'born in 1975', 'died in 1975']:
        if text.encode() in data: hits.append({'file': str(path.relative_to(product)), 'match': text})
test_markers = [v for v in hits if v['file'] == 'Web/qa-suite.js' and v['match'] == '房间号']
game_hits = [v for v in hits if v not in test_markers]
assert not game_hits, game_hits
assert (web / 'twist.html').read_bytes() == (root / 'ios/RUNLUTwist/RUNLUTwist/Web/twist.html').read_bytes()
result = {'result': 'PASS', 'scope': 'new candidate Web resources, not historical archives/documents',
          'old_riddle_hits': game_hits, 'negative_test_markers': test_markers,
          'test_marker_note': 'qa-suite.js rejects the old explanation; marker is not a game question',
          'files': files, 'first_answer_en': en[0][2],
          'first_answer_zh': zh[0][2], 'remaining_classics_rights': '19 UNKNOWN, not cleared'}
(out / 'packaged-content-scan.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(json.dumps(result, ensure_ascii=False, indent=2))
