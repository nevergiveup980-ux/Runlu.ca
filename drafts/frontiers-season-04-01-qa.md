# Frontiers IV / 01 — Editorial and technical acceptance record
Date: 2026-11-01
Status: PRE-PUBLICATION / NOT APPROVED FOR PUBLIC RELEASE

## Source files inspected
- frontiers-season-04-01-en.md
- frontiers-season-04-01-zh.md
- frontiers-season-04-01-fr.md
- frontiers-season-04-01-es.md
- frontiers-season-04-01-preview.html
- ../runlu-language.js

## Confirmed from repository source
- Four complete article editions exist (zh, en, fr, es).
- Each draft has six section headings, in the same conceptual order: uncertainty; capability versus social choice; institutions; participation; optimism and fear; responsibility.
- Preview HTML has four article containers, 24 section headings, and four language selector options.
- Preview references the existing shared language script with a relative path appropriate for the drafts directory.
- Preview has a noindex/nofollow meta directive and an editorial preview warning.
- No edits were made to the public Frontiers catalog or previous three seasons.

## Editorial alignment notes
- All four editions distinguish present observations from uncertain future scenarios.
- Automated hiring and medical access are illustrative hypothetical examples, not claims about a named deployed system.
- All four editions retain the warehouse-worker safety example and the principle of meaningful public participation.
- The article is primarily normative commentary. It does not present numeric empirical results or named research studies.

## Remaining checks / release blockers
1. Human or qualified language review for idiomatic French and Spanish; spot-check Chinese against English intent.
2. Browser testing of language selector on mobile and desktop, including saved preference and direct-link navigation.
3. Validate HTML and accessibility with a browser-based audit; source inspection is not an interaction test.
4. Independent fact-check for any substantive empirical assertions before public release; add citations where needed.
5. Prepare and approve a season IV index and navigation plan before adding public links.
6. On publication, move to public article path, replace draft-relative URLs, set canonical and social metadata, and remove noindex only after approval.

## Decision
Keep as editorial preview. Do not claim public publication or full QA signoff.

## Source verification update — 2026-11-01
- Re-fetched current English, Chinese, French and Spanish drafts, both HTML preview files, and shared language script from GitHub.
- Performed 18 independent source-level assertions in the connected tool environment: **18 passed, 0 failed**.
- Confirmed four manuscripts each have six headings; four article language containers and four index language containers; 24 article h2 elements; 40 index cards (10 per language); four links from index to essay and four back-links; both preview pages remain noindex/nofollow; shared language script declares all four languages.
- This does **not** mean the repository Node.js QA script has been executed, nor does it establish mobile/browser interaction, language quality, accessibility or independent factual accuracy.
- Decision remains: preview only, not public release.
