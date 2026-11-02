# RUNLU KNOWLEDGE — Source rights and provenance policy v0.1

Status: internal policy proposal, not legal advice or blanket permission to publish.
Updated: 2026-11-01

## Distinguish evidence from reuse

A source may support a factual claim without granting rights to copy its prose, figures, photographs, diagrams, tables or design. Linking to a source and independently expressing an uncopyrightable fact are different from republishing source material. Public availability and attribution alone are NOT a reuse license.

## Source decision record (required before approval)

For every source, record:
- Source title, organization/author, publication or revision date, version, exact relevant page/section, URL and access date.
- Role: primary evidence / corroboration / background / licensed content.
- Material used: factual relationship only / original independent paraphrase / direct quotation / adapted figure / reproduced material.
- Rights basis: own original work / documented license / explicit permission / public domain determination / no third-party material copied.
- Evidence: license URL and version, written permission reference, or reasoned assessment for independently expressed facts.
- Attribution requirement and any restrictions (commercial use, modification, share-alike, jurisdiction).
- Reviewer, review date, follow-up date and decision: permitted / restricted / unknown / prohibited.

Never mark `license_status: permitted` just because a source is a government site or a publicly accessible PDF. A source marked unknown, restricted or prohibited is blocked by the existing public dataset filter.

## Rights review outcomes

- **Permitted**: documented, applicable rights basis for the actual intended use, reviewed.
- **Restricted**: a use might be possible with conditions not yet satisfied.
- **Unknown**: rights basis or scope not adequately documented.
- **Prohibited**: explicit incompatibility or unresolved prohibition.

If only original factual statements are used, record the rationale and the absence of copied protected expression; do not represent this as a license to reproduce the underlying publication.

## RK-0002 preliminary assessment

The unit equality 1 yd² = 9 ft² is a mathematical fact. The four-language summaries appear independently authored, and the intended knowledge card need not reproduce NIST tables or graphics. This is a **preliminary editorial assessment**, not an independently signed rights review. Keep both NIST source statuses as unknown until the actual use and reviewer evidence are recorded.

## Release gate

No published entry until facts, source-rights disposition, all four language checks, reviewer and review date have passed; do not change `knowledge/data/published.json` during preliminary assessment.

## Maintenance

Reassess source links and licenses when a source changes, the planned use expands (e.g. quoting or illustrations), or a rights complaint arrives. Withdraw or revise public records when necessary.

## v0.2 — Factual references versus reproduction (2026-11-01)

For original knowledge entries citing facts without copying protected expression, record `use_type: factual_reference`, `rights_basis` (why the intended use is independently authored), and `rights_evidence` (the review record). A source's `license_status: unknown` does not by itself block that narrow factual-reference use, because a reproduction license is not the right question. This is **not** a finding that the underlying publication is freely reusable. A source expressly marked `prohibited` still blocks publication pending review.

For reproduced or adapted third-party expression, continue to require `license_status: permitted`, `rights_basis` and `rights_evidence`. Missing documentation remains a blocker. The public page and automated publication validator now implement this distinction. The editorial team must assess actual use; a label alone is not a legal determination.
