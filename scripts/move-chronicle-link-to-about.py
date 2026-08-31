from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')
link = '          <a class="quiet-badge" href="chronicle.html" data-en="RUNLU Chronicle →" data-zh="润庐纪事 →" data-fr="Chronique RUNLU →" data-es="Crónica RUNLU →">RUNLU Chronicle →</a>'
anchor = '          <p data-en="We do not seek to change people, only to offer space — for life to unfold in its own time." data-zh="润庐不是为了改变你，而是提供一个可以安住的所在——让生命，在时间中自然生长。">We do not seek to change people, only to offer space — for life to unfold in its own time.</p>'

html = html.replace('\n' + link, '', 1)
about = html.find('<section id="about"')
if about == -1:
    raise SystemExit('About section not found; no placement change made.')
pos = html.find(anchor, about)
if pos == -1:
    raise SystemExit('About paragraph anchor not found; no placement change made.')
end = pos + len(anchor)
if link not in html[about:]:
    html = html[:end] + '\n' + link + html[end:]
path.write_text(html, encoding='utf-8')
