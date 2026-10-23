#!/usr/bin/env python3
"""Fail closed if the Chinese EPUB source is incomplete or malformed."""
from pathlib import Path
import re
import sys

source = Path(__file__).with_name("CHINESE_BOOK_ASSEMBLED_PROOF_2026-10-22.md")
text = source.read_text(encoding="utf-8")
body, separator, refs = text.partition("\n# 参考文献\n")
errors = []
if not separator:
    errors.append("Missing bibliography")
headings = re.findall(r"^# (.+)$", body, re.M)
chapters = [h for h in headings if re.match(r"^第[一二三四五六七八九十]+章", h)]
if len(chapters) != 11 or not any(h.startswith("序章") for h in headings) or not any(h.startswith("终章") for h in headings):
    errors.append(f"Expected prologue, 11 chapters and epilogue; got: {headings}")
listed = [int(n) for n in re.findall(r"^\[(\d+)\]", refs, re.M)]
if listed != list(range(1, 19)):
    errors.append(f"Bibliography numbering is not 1..18: {listed}")
used = {int(n) for n in re.findall(r"\[(\d+)\]", body)}
if used != set(listed):
    errors.append(f"Reference mismatch: unused={sorted(set(listed)-used)}, undefined={sorted(used-set(listed))}")
hanzi = len(re.findall(r"[\u3400-\u9fff]", re.sub(r"^#{1,6} .*?$", "", body, flags=re.M)))
if hanzi < 35000:
    errors.append(f"Unexpectedly short Chinese body: {hanzi}")
if not text.strip().endswith("发行元数据。"):
    errors.append("Unexpected ending; inspect source completeness")
print(f"Chinese EPUB preflight: {len(headings)} major sections, {hanzi} Hanzi, {len(listed)} references, {len(used)} cited IDs")
if errors:
    for error in errors:
        print("ERROR:", error, file=sys.stderr)
    sys.exit(1)
print("Preflight passed; publication approval and source verification remain separate.")
