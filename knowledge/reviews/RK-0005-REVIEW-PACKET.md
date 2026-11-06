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

## Practitioner account — warehouse-to-sales correction (2026-11-06)

**Source:** First-person operational account supplied by a flooring warehouse practitioner in conversation. This is qualitative practitioner input, **not independent verification**, and is not the same as the hypothetical dimensional examples above.

**Confirmed sequence:** The warehouse practitioner found that the originally requested cut dimensions could not be supplied from the available material. The practitioner notified the sales team. Sales then revised the order dimensions to ones that the available stock could accommodate.

**Unknown / do not invent:** Original or revised measurements; roll identifiers; customer identity; whether sales consulted the customer or secured any particular approval; whether cutting, delivery or installation was subsequently completed. Do not assert those details.

**Operational lesson for editorial review:** When the requested cut is infeasible, the warehouse should flag the dimensional mismatch to sales rather than quietly substituting material or changing the order. Sales owns the follow-up and any necessary customer/project authorization; the warehouse must recheck the revised cut against verified usable stock before release. This is RUNLU's proposed workflow framing, not a verified universal industry rule.

**Suggested manuscript treatment:** Present this as an anonymized practitioner-reported example, clearly separate from the hypothetical 12 × 20 ft case, and avoid claiming that the full order was fulfilled or independently audited. The reviewer should confirm the account's wording and any permissions required before public inclusion.

## Field-review worksheet — to be completed by an actual reviewer

Use this worksheet with **one real, anonymized warehouse order** before signing the technical review. Do not enter customer names, addresses, phone numbers, pricing, or other identifying data. A blank worksheet does not count as evidence.

| Field | Reviewer entry |
| --- | --- |
| Reviewer name and relevant trade role | **Pending** |
| Review date (YYYY-MM-DD) | **Pending** |
| Reviewed manuscript commit / version | **Pending** |
| Anonymous case reference | **Pending** |
| Requested number of pieces; width × length of each; units | **Pending** |
| Seam layout and orientation required / approved by whom | **Pending** |
| Candidate roll/remnant IDs (anonymized) | **Pending** |
| Measured usable width × continuous length per candidate | **Pending** |
| Allowance for trim, cutting, pattern repeat and waste | **Pending** |
| Reservation/hold/damage/physical-location checks | **Pending** |
| Product, dye lot, shade, pile direction and pattern compatibility | **Pending** |
| Proposed allocation and who may authorize cutting | **Pending** |
| Outcome: ready / review needed / not fulfillable | **Pending** |
| Specific reason and next action | **Pending** |
| Evidence reference (redacted work record, not customer data) | **Pending** |
| Required corrections with manuscript section | **Pending** |
| Reviewer decision: pass / changes requested | **Pending** |

**Reviewer decision rule:** A successful example should demonstrate that the framework identifies a feasible cut *and* the correct authorization boundary. A failed example should identify which constraint blocks fulfillment and what evidence or approval would change the decision. Do not classify a roll as available solely because its total area is large enough.

**Escalation checks:** If dimensions are reported in mixed units, convert before comparing; distinguish nominal roll width from measured usable width; verify whether trimming and pattern matching consume additional length; check whether a seam is explicitly permitted rather than assuming it is. If records and physical measurements disagree, stop the release decision until reconciled.

**Evidence boundary:** A reviewer can assess the RUNLU operational framework without claiming it is a mandatory CRI procedure. A source-rights reviewer and four-language reviewers must still sign their own sections. The author or automated tests cannot substitute for independent signoff.

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
