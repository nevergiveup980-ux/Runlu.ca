# The Universe Within Us — EPUB Assembly Manifest

Status: pre-production specification, not a completed EPUB.
Author: JOHN ZHANG
Imprint: RUNLU
Subtitle: The Human Body, Nature, and the Art of Living in Balance

## Reading order

1. Title and copyright page (to be finalized)
2. Prologue — ENGLISH_MANUSCRIPT_00_PROLOGUE.md
3. Chapter One — ENGLISH_MANUSCRIPT_01_HEAVEN_EARTH_BODY.md
4. Chapter Two — ENGLISH_MANUSCRIPT_02_BODY_IN_TIME.md
5. Chapter Three — ENGLISH_MANUSCRIPT_03_PLACES_WE_LIVE.md
6. Chapter Four — ENGLISH_MANUSCRIPT_04_ORDER_WITHIN.md
7. Chapter Five — ENGLISH_MANUSCRIPT_05_INVISIBLE_ENVIRONMENTS.md
8. Chapter Six — ENGLISH_MANUSCRIPT_06_LIVES_WE_SHARE.md
9. Chapter Seven — ENGLISH_MANUSCRIPT_07_TRADITION_WITHOUT_MYTH.md
10. Chapter Eight — ENGLISH_MANUSCRIPT_08_TESTING_WELLNESS_CLAIMS.md
11. Chapter Nine — ENGLISH_MANUSCRIPT_09_LIVING_WITH_TIME.md
12. Chapter Ten — ENGLISH_MANUSCRIPT_10_LIVING_WITH_DIFFERENCE.md
13. Chapter Eleven — ENGLISH_MANUSCRIPT_11_WELLNESS_MYTHS.md
14. Epilogue — ENGLISH_MANUSCRIPT_12_EPILOGUE.md
15. References and Reader Notices — ENGLISH_BACK_MATTER_REFERENCES_AND_NOTICES.md

All paths above are relative to editorial/books/wellness-microcosm-001/.

## Conversion rules

- In the prologue file, the first title/subtitle/author block is front matter; the first chapter-level reading section begins at “Prologue — Looking Outward, Looking Within.” Do not generate duplicate title pages.
- Normalize section heading hierarchy across the assembled manuscript; do not convert every Markdown heading to an EPUB top-level chapter.
- Strip working-draft metadata lines from reader-facing content, preserving edition metadata only in the publication information page.
- Keep references [1]–[18] navigable from body text where technically feasible. Do not mistake reference numbers for chapter numbers.
- Provide an accessible navigation document, meaningful language metadata (en), and reflowable text.
- Cover artwork, dimensions, licensing, and final book identifier remain unverified.
- Include reader notice and copyright page in the EPUB spine.

## Publication gates

- Verify every reference against its source and ensure each claim is supported.
- Final English copy edit and consistent title casing.
- Verify author, publisher, copyright, and ISBN/distribution metadata.
- Generate EPUB 3 and run EPUBCheck; fix every reported error.
- Inspect navigation, footnotes/reference links, cover display, and text flow in Apple Books.
- Confirm no working-draft labels, editorial notes, or duplicate title pages remain.

Do not call the edition ready for Apple Books until these gates are satisfied.
