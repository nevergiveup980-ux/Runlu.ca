#!/usr/bin/env python3
"""Prepare a reader-facing Markdown proof with working numbered citation links."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
src = (root / "CHINESE_BOOK_ASSEMBLED_PROOF_2026-10-22.md").read_text(encoding="utf-8")
body, sep, refs = src.partition("\n# 参考文献\n")
if not sep:
    raise SystemExit("Missing bibliography")
# Remove only the internal manuscript-status callout, not health or copyright notices.
body = re.sub(r"^> 中文版完整合稿（出版前校样）。正文及参考文献仍须完成出版级逐条校核。\s*\n", "", body, count=1, flags=re.M)
# HTML anchors are recognized by Pandoc and retained in EPUB XHTML.
refs = re.sub(r"^\[(\d+)\](?=\s)", lambda m: f'<span id="ref-{m.group(1)}"></span>[{m.group(1)}]', refs, flags=re.M)
body = re.sub(r"\[(\d+)\]", lambda m: f'[[{m.group(1)}]](#ref-{m.group(1)})', body)
out = root / "CHINESE_EPUB_READER_PROOF.generated.md"
out.write_text(body + "\n# 参考文献\n" + refs, encoding="utf-8")
print(f"Prepared {out.name}")
