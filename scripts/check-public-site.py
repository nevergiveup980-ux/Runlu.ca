from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path('.')
HOST = 'runlu.ca'


def repo_target(url_path: str) -> Path:
    path = url_path or '/'
    if path == '/':
        return ROOT / 'index.html'
    rel = path.lstrip('/')
    if path.endswith('/'):
        return ROOT / rel / 'index.html'
    return ROOT / rel


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'a' and data.get('href'):
            self.links.append(data['href'])
        elif tag == 'script' and data.get('src'):
            self.links.append(data['src'])
        elif tag == 'link' and data.get('href'):
            self.links.append(data['href'])


sitemap = ET.parse(ROOT / 'sitemap.xml')
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [node.text.strip() for node in sitemap.findall('.//sm:loc', ns) if node.text]

missing = []
public_pages = []

for url in urls:
    parsed = urlsplit(url)
    if parsed.hostname != HOST:
        missing.append(f'sitemap external host: {url}')
        continue
    target = repo_target(parsed.path)
    if not target.exists():
        missing.append(f'sitemap target missing: {url} -> {target}')
        continue
    if target.suffix.lower() == '.html':
        public_pages.append(target)

for page in sorted(set(public_pages)):
    parser = Links()
    parser.feed(page.read_text(encoding='utf-8'))
    for href in parser.links:
        if href.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
            continue
        parsed = urlsplit(href)
        if parsed.scheme in ('http', 'https'):
            if parsed.hostname != HOST:
                continue
            target = repo_target(parsed.path)
        else:
            path = parsed.path
            if not path:
                continue
            target = (page.parent / path)
            if path.endswith('/'):
                target = target / 'index.html'
        if not target.exists():
            missing.append(f'{page}: {href} -> {target}')

if missing:
    raise SystemExit('Public site integrity failures:\n' + '\n'.join(missing))

print(f'Public site integrity passed: {len(urls)} sitemap URLs, {len(set(public_pages))} HTML pages checked.')
