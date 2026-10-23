#!/usr/bin/env python3
"""Check EPUB ZIP packaging and core EPUB 3 navigation metadata."""
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED
from xml.etree import ElementTree as ET
import sys

epub = Path(__file__).with_name("RUNLU_HUMAN_MICROCOSM_ZH_PROOF.epub")
errors = []
if not epub.is_file():
    raise SystemExit("EPUB file missing")
with ZipFile(epub) as z:
    bad = z.testzip()
    if bad:
        errors.append(f"Corrupt ZIP member: {bad}")
    entries = z.infolist()
    if not entries or entries[0].filename != "mimetype" or entries[0].compress_type != ZIP_STORED:
        errors.append("EPUB mimetype must be first and uncompressed")
    elif z.read("mimetype") != b"application/epub+zip":
        errors.append("Incorrect EPUB mimetype")
    try:
        container = ET.fromstring(z.read("META-INF/container.xml"))
        rootfile = container.find(".//{*}rootfile")
        opfpath = rootfile.attrib["full-path"]
        opf = ET.fromstring(z.read(opfpath))
        if opf.attrib.get("version", "").split(".")[0] != "3":
            errors.append("Expected EPUB 3 package")
        items = opf.findall(".//{*}manifest/{*}item")
        nav = [i for i in items if "nav" in i.attrib.get("properties", "").split()]
        if len(nav) != 1:
            errors.append("Expected exactly one EPUB navigation item")
        spine = opf.findall(".//{*}spine/{*}itemref")
        if len(spine) < 10:
            errors.append(f"Unexpectedly short EPUB spine: {len(spine)}")
        titles = [e.text for e in opf.findall(".//{http://purl.org/dc/elements/1.1/}title")]
        if "人是一个小宇宙" not in titles:
            errors.append("Incorrect EPUB title")
        languages = [e.text for e in opf.findall(".//{http://purl.org/dc/elements/1.1/}language")]
        if "zh-Hans" not in languages:
            errors.append("Missing zh-Hans language metadata")
        if nav:
            from posixpath import dirname, normpath, join
            navpath = normpath(join(dirname(opfpath), nav[0].attrib["href"]))
            navroot = ET.fromstring(z.read(navpath))
            if not navroot.findall(".//{http://www.w3.org/1999/xhtml}nav"):
                errors.append("Navigation XHTML has no nav element")
    except Exception as exc:
        errors.append(f"EPUB metadata/navigation parse failed: {exc}")
if errors:
    for err in errors:
        print("ERROR:", err, file=sys.stderr)
    sys.exit(1)
print(f"EPUB container, metadata, spine and nav passed: {epub.name}")
