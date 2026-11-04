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

## Scenario-based warehouse acceptance test (hypothetical; awaiting reviewer)

For each scenario, the reviewer should independently record **roll ID(s), required cut, usable dimensions, reservations, compatibility, proposed allocation, decision and reason**. The expected decisions below are editorial hypotheses, **not verified operational results**.

| Case | Verified stock and order | Expected decision | Reason / condition to verify |
| --- | --- | --- | --- |
| A — aggregate-area trap | Order requires one continuous 12 ft × 20 ft piece. Available remnants R1 and R2 are each 12 ft × 12.5 ft, with no approved seam | **Not fulfillable as specified** | 300 ft² total exceeds 240 ft² order, but neither remnant supplies 20 ft continuous length |
| B — reserved material | Order requires one continuous 12 ft × 18 ft piece. Roll R3 has verified usable dimensions 12 ft × 25 ft but is fully reserved for another confirmed order | **Review needed / not allocatable** | Physical dimensions fit, but the stock is not freely available; do not silently override reservation |
| C — compatible available roll | Order requires one continuous 12 ft × 18 ft piece. Roll R4 has 12 ft usable width × 25 ft continuous length, correct product and project-required dye lot, no holds or damage, and approved orientation | **Potentially fulfillable, pending cut authorization** | All listed screening conditions pass; final cut release remains subject to normal approvals |
| D — seam-dependent allocation | Order requires 12 ft × 20 ft coverage. Only R1 and R2 are available, and a seam is proposed but not yet approved | **Review needed** | A technically feasible layout must be checked against project/manufacturer instructions and authorized by the appropriate decision-maker |

**Reviewer exercise:** For each case, write the decision without consulting the expected-decision column; then compare, explain any difference, and identify any missing real-world constraint (e.g. pattern repeat, edge trimming, cutting tolerance, stock measurement reliability). The dimensions are simplified; they do **not** include cutting allowances, pattern matching or installation waste.

| Case | Reviewer decision | Missing constraints / correction | Reviewer initials and date |
| --- | --- | --- | --- |
| A | Pending | Pending | — |
| B | Pending | Pending | — |
| C | Pending | Pending | — |
| D | Pending | Pending | — |

**Pass condition:** All four outcomes and caveats are technically defensible for the stated assumptions; any dispute is resolved in the manuscript and four language editions before signoff.

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
