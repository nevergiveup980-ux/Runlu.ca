# RK-0002 — Publication evidence dossier (working draft)

**Record:** Carpet area units: square feet and square yards  
**Status:** Editorial preparation only; NOT approved for publication  
**Date:** 2026-11-01  
**Target languages:** English, Chinese, French, Spanish

## 1. Atomic claims and evidence

| Claim ID | Claim | Evidence | Decision |
| --- | --- | --- | --- |
| RK-0002-C1 | 1 square yard = 9 square feet | NIST Handbook 44 (2025), Appendix C; SI conversion relationships | Factual relationship established |
| RK-0002-C2 | SF↔SYD conversion describes area, not cut feasibility | Mathematical distinction between area and geometry; independently written explanation | Accept as explanatory claim |
| RK-0002-C3 | Roll length, usable width, layout and waste need separate evaluation | Scope clarification, not a universal installation specification | Accept as scope limitation; avoid prescriptive installation guidance |

## 2. Reference register

- NIST Handbook 44 (2025), Appendix C: https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958917
- NIST Guide to the SI, conversion factors: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9

Use source links for attribution. Do not copy figures, source tables, prose, or document layout. The factual conversion is independently expressible; nevertheless, the current data model marks both source license statuses `unknown`. **Do not change to `permitted` until the platform's source-rights policy and review are documented.**

## 3. Terminology review checklist

| Concept | EN | ZH | FR | ES |
| --- | --- | --- | --- | --- |
| square foot | square foot (SF) | 平方英尺 | pied carré | pie cuadrado |
| square yard | square yard (SYD) | 平方码 | yard carré | yarda cuadrada |
| usable roll width | usable roll width | 有效卷宽 | largeur utile du rouleau | ancho útil del rollo |
| cutting layout | cutting layout | 裁切布局 | plan de coupe | plan de corte |

These are proposed terms, not independent four-language reviewer sign-off. Confirm whether French professional usage prefers `verge carrée` in Canadian contexts and whether Spanish terminology should be region-specific before approving translations.

## 4. Publication blockers

- [x] Fact relationship and its limits recorded
- [x] Independent concise draft summaries present in all four languages
- [ ] Source-rights disposition and evidence recorded
- [ ] Four-language terminology reviewed and signed off
- [ ] Reviewer identity, review date and maintenance owner assigned
- [ ] Publication schema check and live four-language acceptance test

**Release decision: HOLD.** Leave `knowledge/data/records.json` status as `draft` and `knowledge/data/published.json` empty. Do not imply source copyright permission merely from public access.

## 5. Suggested public presentation (after approval)

One short knowledge card with title, conversion equation, scope limitation, primary source links, reviewed date and version. Avoid an embedded calculator in this editorial project; link to a separate tool if one is eventually available.
