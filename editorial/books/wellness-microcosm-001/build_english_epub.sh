#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

output="RUNLU_THE_UNIVERSE_WITHIN_US_EN_PROOF.epub"
files=(
  ENGLISH_MANUSCRIPT_00_PROLOGUE.md
  ENGLISH_MANUSCRIPT_01_HEAVEN_EARTH_BODY.md
  ENGLISH_MANUSCRIPT_02_BODY_IN_TIME.md
  ENGLISH_MANUSCRIPT_03_PLACES_WE_LIVE.md
  ENGLISH_MANUSCRIPT_04_ORDER_WITHIN.md
  ENGLISH_MANUSCRIPT_05_INVISIBLE_ENVIRONMENTS.md
  ENGLISH_MANUSCRIPT_06_LIVES_WE_SHARE.md
  ENGLISH_MANUSCRIPT_07_TRADITION_WITHOUT_MYTH.md
  ENGLISH_MANUSCRIPT_08_TESTING_WELLNESS_CLAIMS.md
  ENGLISH_MANUSCRIPT_09_LIVING_WITH_TIME.md
  ENGLISH_MANUSCRIPT_10_LIVING_WITH_DIFFERENCE.md
  ENGLISH_MANUSCRIPT_11_WELLNESS_MYTHS.md
  ENGLISH_MANUSCRIPT_12_EPILOGUE.md
  ENGLISH_BACK_MATTER_REFERENCES_AND_NOTICES.md
)
for f in "${files[@]}"; do
  test -s "$f" || { echo "Missing/empty source: $f" >&2; exit 1; }
done

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
# Pandoc EPUB chapter divisions are controlled by level-one headings.
# Remove internal working-draft labels and normalize chapter titles for proof.
python3 - "$tmp/assembled.md" "${files[@]}" <<'PY'
import pathlib, re, sys
out = pathlib.Path(sys.argv[1])
parts = []
for index, name in enumerate(sys.argv[2:]):
    source = pathlib.Path(name).read_text(encoding="utf-8")
    source = re.sub(r"(?m)^\*The Universe Within Us — English adaptation, working draft\*\s*\n", "", source)
    source = re.sub(r"(?m)^\*English-language adaptation — working manuscript\*\s*\n", "", source)
    source = re.sub(r"(?m)^\*The Universe Within Us — English adaptation, revised working draft\*\s*\n", "", source)
    source = re.sub(r"(?m)^\*The Universe Within Us — English adaptation[^\n]*\*\s*\n", "", source)
    if index == 0:
        start = source.find("# Prologue —")
        if start < 0:
            raise SystemExit("Prologue heading not found")
        source = source[start:]
    if index == len(sys.argv[2:]) - 1:
        source = re.sub(r"(?m)^\*English-edition editorial back matter[^\n]*\*\s*\n", "", source)
    if not re.search(r"(?m)^# ", source):
        raise SystemExit(f"Missing chapter-level heading: {name}")
    parts.append(source.strip())
assembled = "\n\n".join(parts) + "\n"
if re.search(r"(?i)english adaptation[^\n]{0,60}working draft|editorial back matter[^\n]{0,60}working version", assembled):
    raise SystemExit("Working-draft label leaked into reader-facing EPUB text")
if sum(1 for line in assembled.splitlines() if line.startswith("# ")) != len(parts):
    raise SystemExit("Unexpected top-level chapter headings; review EPUB navigation")
out.write_text(assembled, encoding="utf-8")
PY

pandoc "$tmp/assembled.md" --from=markdown --to=epub3 \
  --metadata title="The Universe Within Us" \
  --metadata subtitle="The Human Body, Nature, and the Art of Living in Balance" \
  --metadata author="JOHN ZHANG" \
  --metadata lang="en" \
  --metadata publisher="RUNLU" \
  --toc --toc-depth=1 --epub-chapter-level=1 \
  -o "$output"

test -s "$output"
python3 - "$output" <<'PY'
import sys, zipfile
from xml.etree import ElementTree as ET
with zipfile.ZipFile(sys.argv[1]) as epub:
    assert epub.testzip() is None, "Corrupt EPUB archive"
    names = epub.namelist()
    assert names[0] == "mimetype", "EPUB mimetype must be first"
    assert epub.read("mimetype") == b"application/epub+zip"
    assert "META-INF/container.xml" in names
    container = ET.fromstring(epub.read("META-INF/container.xml"))
    rootfile = container.find(".//{*}rootfile")
    assert rootfile is not None, "Missing OPF rootfile"
    opf = ET.fromstring(epub.read(rootfile.attrib["full-path"]))
    spine = opf.find("{*}spine")
    assert spine is not None and len(spine) >= 14, "Unexpectedly short EPUB spine"
    assert any(name.endswith(".xhtml") for name in names)
print("EPUB archive and spine checks passed")
PY
epubcheck "$output"
echo "Validated EPUB proof: $output"
