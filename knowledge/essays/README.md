# RUNLU KNOWLEDGE — Editorial Essays

This directory contains **original editorial essays**, separate from the factual knowledge-record dataset in `../data/published.json`. Never bypass that dataset's verification and licensing checks.

## Current article

`when-science-meets-the-unknown/manifest.json` tracks Chinese, English, French and Spanish editions. Its status is `draft`. Complete manuscripts are **not yet staged**. Do not claim publication.

## Required localized manuscript shape

Each `<language>.json` file uses:

```json
{
  "id": "when-science-meets-the-unknown",
  "language": "en",
  "status": "draft",
  "title": "Full localized title",
  "subtitle": "Full localized subtitle",
  "sections": [
    {"heading": "Full section 1 heading", "paragraphs": ["Complete paragraph", "Next paragraph"]}
  ],
  "closing": "RUNLU · 润庐"
}
```

All **eight** sections must be complete, with all paragraphs from the approved manuscript. No abbreviated text, placeholders, mixed-language fallbacks, or invented replacement prose. Draft/reviewed text is intentionally hidden by the reader.

## Validation

Run `node knowledge/essays/validate.mjs` from the repository root. Missing drafts are reported as not staged; missing published files fail. Publishing requires editorial fact, rights and translation reviews in the manifest, then setting each locale's status to `published` after approval.

## Reader

`../essay.html?id=when-science-meets-the-unknown&lang=en` is the independent reading route. It uses the shared language controller and displays only complete eight-section published locale files. It is currently `noindex` and not linked from the public knowledge listing.

Do not merge to main or deploy before full content review and browser/mobile checks.
