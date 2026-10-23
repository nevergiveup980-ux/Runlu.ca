#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SOURCE="CHINESE_BOOK_ASSEMBLED_PROOF_2026-10-22.md"
OUTPUT="RUNLU_HUMAN_MICROCOSM_ZH_PROOF.epub"
command -v pandoc >/dev/null || { echo "Requires pandoc" >&2; exit 1; }
python3 check_chinese_epub_source.py
test -s "$SOURCE" || { echo "Missing manuscript" >&2; exit 1; }
pandoc "$SOURCE" \
  --from=gfm \
  --to=epub3 \
  --output="$OUTPUT" \
  --metadata=title:"人是一个小宇宙" \
  --metadata=subtitle:"从天人相应到生命的整体和谐" \
  --metadata=author:"JOHN ZHANG" \
  --metadata=lang:"zh-Hans" \
  --metadata=publisher:"RUNLU" \
  --metadata=date:"2026" \
  --toc --toc-depth=1 \
  --split-level=1
echo "Created $OUTPUT (proof only; not approved for publication)"
if command -v epubcheck >/dev/null; then
  epubcheck "$OUTPUT"
else
  echo "EPUBCheck not installed; EPUB validation still required" >&2
fi
