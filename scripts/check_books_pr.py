#!/usr/bin/env python3
"""Read-only structural QA for RUNLU Books PR #410."""
from pathlib import Path
from html.parser import HTMLParser
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["book/index.html", "book/where-to-read.html", "book/the-glass-throne.html"]
class Inspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.hrefs = []
        self.languages = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.hrefs.append(attrs["href"])
        for key in attrs:
            if key in ("data-en", "data-zh", "data-fr", "data-es"):
                self.languages.add(key[5:])

issues = []
parsed = {}
for name in PAGES:
    p = ROOT / name
    if not p.is_file():
        issues.append(f"Missing file: {name}")
        continue
    inspector = Inspector()
    inspector.feed(p.read_text(encoding="utf-8"))
    parsed[name] = inspector
    duplicates = sorted({i for i in inspector.ids if inspector.ids.count(i) > 1})
    if duplicates:
        issues.append(f"{name}: duplicate IDs: {duplicates}")
    for href in inspector.hrefs:
        if href.startswith(("#", "http:", "https:", "mailto:", "tel:", "javascript:", "data:")):
            continue
        target = href.split("#", 1)[0].split("?", 1)[0]
        if target and not (p.parent / target).exists() and not (p.parent / target / "index.html").exists():
            issues.append(f"{name}: missing relative link target {href}")

guide = (ROOT / "book/where-to-read.html").read_text(encoding="utf-8")
if "runlu_site_language" not in guide:
    issues.append("Distribution guide does not use shared language key")
if not all(re.search(r"\b" + lang + r":\{", guide) for lang in ("en", "zh", "fr", "es")):
    issues.append("Distribution guide missing one or more language dictionaries")
if "@media(max-width:520px)" not in guide:
    issues.append("Distribution guide missing mobile CSS rule")
if "the-glass-throne.html" not in guide:
    issues.append("Distribution guide missing Glass Throne link")
if "where-to-read.html" not in (ROOT / "book/index.html").read_text(encoding="utf-8"):
    issues.append("Bookshelf missing distribution guide link")
if "where-to-read.html" not in (ROOT / "book/the-glass-throne.html").read_text(encoding="utf-8"):
    issues.append("Glass Throne page missing return link")
# Each standalone wellness translation must route to the other three files.
WELLNESS = {
    "zh": "wellness-season-03-01.html",
    "en": "wellness-season-03-01-en.html",
    "fr": "wellness-season-03-01-fr.html",
    "es": "wellness-season-03-01-es.html",
}
for language, filename in WELLNESS.items():
    page = ROOT / filename
    if not page.is_file():
        issues.append(f"Missing wellness translation: {filename}")
        continue
    content = page.read_text(encoding="utf-8")
    if 'data-runlu-language-select' not in content:
        issues.append(f"{filename}: missing shared language selector")
    if 'src="runlu-language.js' not in content:
        issues.append(f"{filename}: missing shared language script")
    if 'dataset.runluLanguageBound="true"' not in content:
        issues.append(f"{filename}: custom selector not protected from double binding")
    if f'const current="{language}"' not in content:
        issues.append(f"{filename}: language routing does not match edition")
    for target in WELLNESS.values():
        if target not in content:
            issues.append(f"{filename}: missing translation route {target}")

for issue in issues:
    print("FAIL:", issue)
print(f"Checked {len(parsed)} HTML pages; {len(issues)} issue(s).")
sys.exit(bool(issues))
