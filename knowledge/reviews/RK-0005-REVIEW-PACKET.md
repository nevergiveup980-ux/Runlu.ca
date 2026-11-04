# RK-0005 — Independent review and release packet

**Status: REQUESTED / NOT SIGNED.** This packet is a review instrument, not proof that a review occurred. Do not set review flags to true or publish until evidence is recorded.

**Working manuscript:** [RK-0005-INVENTORY-FULFILLMENT.md](../editorial/RK-0005-INVENTORY-FULFILLMENT.md)  
**Structured draft:** [records.json](../data/records.json), record RK-0005 v1  
**Proposed title (EN):** Why enough carpet inventory may still fail an order

## Technical review — check against actual warehouse practice

| Claim or example | Verification task | Result |
| --- | --- | --- |
| Two 12 ft × 12.5 ft remnants total 300 ft² | Recalculate 2 × 12 × 12.5 = 300 | Pending reviewer |
| One continuous 12 ft × 20 ft piece requires 240 ft² | Recalculate 12 × 20 = 240 and confirm neither 12.5 ft remnant provides 20 ft continuous length | Pending reviewer |
| Sufficient total area is not sufficient for a continuous-piece allocation | Verify under stated no-seam scenario; do not generalize to every installation | Pending reviewer |
| Seam feasibility is project-specific | Check whether customer-approved layout, manufacturer instructions, pattern and pile direction permit the proposed seam | Pending reviewer |
| Reserved / damaged / unverified stock should not be counted as freely allocatable | Review as a RUNLU operational recommendation, not as a claim mandated by CRI | Pending reviewer |
| Six-checkpoint triage is actionable | Walk through one anonymized realistic order and note any missing decision or exception | Pending reviewer |

**Reviewer must record:** name, role or relevant experience, review date, manuscript version or commit, pass / changes requested, and concrete corrections with section references. No invented names, signoffs, or anonymized approvals.

## Source and rights verification

1. Open the official [CRI installation standards index](https://carpet-rug.org/resources/installation-standards/) and verify the current CRI 104 / 105 scope.
2. Inspect the applicable official standard, noting specific section and edition before attributing any installation rule.
3. Verify that the article does not copy protected CRI wording, tables or diagrams.
4. Keep warehouse reservation and synchronization advice explicitly attributed to RUNLU's original operational synthesis, not to CRI.
5. Record reviewer, date, exact source URL, accessible edition and claim-to-section mapping. A prior editorial note alone is not independent signoff.

## Four-language editorial review

For each language, check **meaning, trade terminology, measurement units, limitations and reader-facing caution**, not just spelling.

| Language | Reviewer | Date | Pass / corrections | Evidence link |
| --- | --- | --- | --- | --- |
| Chinese (zh) | Pending | — | Pending | — |
| English (en) | Pending | — | Pending | — |
| French (fr) | Pending | — | Pending | — |
| Spanish (es) | Pending | — | Pending | — |

Particular care: translate **continuous piece**, **usable width**, **reservation**, **dye lot**, **pile direction**, **pattern repeat**, **seam approval**, and **cut authorization** consistently. Preserve the conditional nature of the example.

## Release checklist — manual approval required

- [ ] Independent technical reviewer signed with evidence
- [ ] Source links and exact standard references independently checked
- [ ] Rights/use assessment signed and documented
- [ ] All four languages reviewed with recorded corrections
- [ ] Changes integrated into the final manuscript and structured record
- [ ] Automated publication tests and data audit pass on the intended commit
- [ ] Named editor explicitly approves publication

Only after all checks pass should the editor prepare a **new approved record version** in `knowledge/data/published.json` with full reviewer metadata and ensure the same version is not simultaneously present in drafts. Never auto-promote on the basis of this checklist alone.

## Review outcome

**Technical:** Pending  
**Rights:** Pending  
**Four languages:** Pending  
**Final editor:** Pending  
**Publication decision:** HOLD
