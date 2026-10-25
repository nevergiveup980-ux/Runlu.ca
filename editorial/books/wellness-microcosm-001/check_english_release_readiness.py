#!/usr/bin/env python3
"""Fail closed when English source contains unfinished publication metadata.

Usage: python3 check_english_release_readiness.py
Proof EPUBs may still be generated for review; this check is required before
any EPUB is named or uploaded as a release candidate.
"""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parent
sources = sorted(root.glob("ENGLISH_MANUSCRIPT_*.md"))
sources += [root / "ENGLISH_BACK_MATTER_REFERENCES_AND_NOTICES.md"]
patterns = {
    "unfinished copyright page": r"(?i)pending final verification",
    "publication instructions": r"(?i)\*\*before publication:\*\*",
    "working editorial copy": r"(?i)editorial back matter.*working version",
}
errors = []
for path in sources:
    if not path.is_file():
        errors.append(f"Missing: {path.name}")
        continue
    text = path.read_text(encoding="utf-8")
    for label, regex in patterns.items():
        if re.search(regex, text):
            errors.append(f"{path.name}: {label}")
if len(sources) != 14:
    errors.append(f"Expected 13 narrative parts and 1 back matter, found {len(sources)}")
if errors:
    print("RELEASE BLOCKED — proof files remain review-only:", file=sys.stderr)
    for error in errors:
        print(f" - {error}", file=sys.stderr)
    sys.exit(1)
print("No known editorial placeholders detected. Other release gates still apply.")
