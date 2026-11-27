# RK-0008 · Four-language editorial QA checkpoint

**Review date:** 2026-11-22
**Reviewer:** RUNLU editorial AI-assisted internal check (not independent professional certification)
**Status:** Internal pre-publication QA. **Not a publication approval.**

## Source files checked

- `knowledge/editorial/RK-0008-EN-DRAFT.md`
- `knowledge/editorial/RK-0008-ZH-DRAFT.md`
- `knowledge/editorial/RK-0008-FR-DRAFT.md`
- `knowledge/editorial/RK-0008-ES-DRAFT.md`

All four drafts were fetched from branch `editorial/rk-0008-job-costing-brief-20261120` during this check. Each has three Markdown tables (30 lines beginning with `|`) and an editorial disclaimer. The English, French and Spanish versions each have ten `## 1.`-style numbered headings. The Chinese version uses Chinese punctuation in its headings, so a Latin-digit heading regex returns zero; that is a **test limitation**, not evidence of missing sections.

## Independently recalculated shared example

| Item | Arithmetic | Expected CAD |
|---|---|---:|
| Planned labour | 24 × 25 | 600 |
| Planned costs | 600 + 60 + 40 + 100 | 800 |
| Planned result | 1,200 − 800 | +400 |
| Actual labour | 34 × 25 | 850 |
| Actual costs | 850 + 90 + 60 + 100 | 1,100 |
| Actual result | 1,200 − 1,100 | +100 |
| Erosion | 400 − 100 = 250 + 30 + 20 | 300 |
| Separate rework scenario cost | 1,100 + 150 | 1,250 |
| Separate rework scenario result | 1,200 − 1,250 | −50 |
| Planned result/revenue | 400 ÷ 1,200 | 33.3% rounded |
| Planned markup/cost | 400 ÷ 800 | 50% |
| Actual result/revenue | 100 ÷ 1,200 | 8.3% rounded |
| Rework result/revenue | −50 ÷ 1,200 | −4.2% rounded |

**Pass:** arithmetic itself reconciles. The baseline is positive (+100); only the **additional rework scenario** is negative (−50). The assumed $25/hour is not a validated wage rate. The allocated $100 overhead is a teaching assumption.

## Locale-aware checking

- EN: `1,200`, `33.3%`; ZH: `1,200` or `1,200 加元`; FR: `1 200`, `33,3 %`; ES: `1.200`, `33,3 %`.
- Do **not** treat a missing ASCII `1200` token as an error without normalizing thousands separators.
- Do **not** require headings in all languages to match English `## 1.` punctuation. Match ten semantic sections in order.
- Review accounting terms manually: EN 'job-level result after allocated costs'; ZH '项目结余'; FR 'solde/résultat après les coûts indiqués'; ES 'resultado después de los costos indicados'. These are teaching labels, not claims of statutory accounting equivalence.

## Publication gates

| Gate | Status | Required action |
|---|---|---|
| Four full-language draft files exist | PASS | Keep versions synchronized |
| Example arithmetic and scenario separation | PASS (internal calculation) | Recheck after any content edit |
| Number format and heading format awareness | PASS as QA rule | Build locale-aware preview |
| Human-quality translation and terminology | PENDING | Read every version in rendered preview |
| Primary-source accounting terminology verification | PENDING | Retrieve and cite authoritative sources |
| Similar-title and copyright/trademark screening | PENDING | Search before public release |
| Accessibility/mobile visual test | PENDING | Build and test responsive HTML |
| Publisher approval | PENDING | Explicit authorization before merge/publication |

**Next action:** Create an unpublished four-language responsive preview and run website checks. Do not link from public Knowledge homepage, merge into `main`, or claim deployment until the gates and publisher approval are complete.
