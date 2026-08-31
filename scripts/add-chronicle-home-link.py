from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')
marker = 'href="chronicle.html"'
anchor = '          <p data-en="We do not seek to change people, only to offer space — for life to unfold in its own time." data-zh="润庐不是为了改变你，而是提供一个可以安住的所在——让生命，在时间中自然生长。">We do not seek to change people, only to offer space — for life to unfold in its own time.</p>'
link = '          <a class="quiet-badge" href="chronicle.html" data-en="RUNLU Chronicle →" data-zh="润庐纪事 →" data-fr="Chronique RUNLU →" data-es="Crónica RUNLU →">RUNLU Chronicle →</a>'

if marker not in html:
    if anchor not in html:
        raise SystemExit('About RUNLU anchor not found; homepage left unchanged.')
    html = html.replace(anchor, anchor + '\n' + link, 1)
    path.write_text(html, encoding='utf-8')
