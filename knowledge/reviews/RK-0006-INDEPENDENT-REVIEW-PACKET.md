# RK-0006 — Independent review packet v0.1

**Status: HOLD.** This packet supports independent review; it does not certify any review as complete.

## Materials to inspect
- Full four-language editorial manuscript: [RK-0006-INVENTORY-AVAILABILITY.md](../editorial/RK-0006-INVENTORY-AVAILABILITY.md)
- Research and source register: [RK-0006-RESEARCH-BRIEF.md](RK-0006-RESEARCH-BRIEF.md)
- Tracking issue: https://github.com/nevergiveup980-ux/Runlu.ca/issues/448
- Editorial PR: https://github.com/nevergiveup980-ux/Runlu.ca/pull/449

## Independent technical review: record PASS / REVISE / NOT CHECKED for each
| ID | Verification question | Result | Evidence / reviewer note |
|---|---|---|---|
| T01 | Is the distinction between physical on-hand, current available, and date-specific ATP accurate for the named ERP products? | NOT CHECKED | |
| T02 | Are any ERP-specific definitions incorrectly presented as universal? | NOT CHECKED | |
| T03 | Does Scenario A correctly show 100 LF − 65 LF = 35 LF, with no implied continuous-cut guarantee? | NOT CHECKED | |
| T04 | Does Scenario B clearly state non-overlap and avoid double-counting 30 LF restricted and 20 LF committed? | NOT CHECKED | |
| T05 | Is it clear that inventory holds/reservations must not be overridden without authorization? | NOT CHECKED | |
| T06 | Are dye lot, roll/remnant identity, usable dimensions, and quality status treated as separate checks? | NOT CHECKED | |
| T07 | Are future expected receipts distinguished from stock physically received? | NOT CHECKED | |
| T08 | Does this article avoid duplicating RK-0005's cut-geometry focus? | NOT CHECKED | |

## Sources and rights
| ID | Required check | Result | Evidence / reviewer note |
|---|---|---|---|
| S01 | Confirm Oracle NetSuite on-hand/committed/available definitions at the cited official URL. | NOT CHECKED | |
| S02 | Confirm Microsoft Dynamics 365 physical inventory / physical reserved / available physical definitions at the cited official URL. | NOT CHECKED | |
| S03 | Confirm Oracle NetSuite ATP scope, timing and configuration caveats. | NOT CHECKED | |
| S04 | Confirm Oracle NetSuite inventory-status commitment restrictions. | NOT CHECKED | |
| S05 | Check links, attribution, quotation/reuse rights and any version-specific qualifications. | NOT CHECKED | |

## Language and reader usability
| ID | Required check | Result | Evidence / reviewer note |
|---|---|---|---|
| L01 | English: clarity, accurate terminology, accessible reading level. | NOT CHECKED | |
| L02 | Chinese: natural phrasing; consistent LF / 色批 / 预留 / 承诺 / ATP. | NOT CHECKED | |
| L03 | French: native proofreading of stock/engagement/ATP terminology. | NOT CHECKED | |
| L04 | Spanish: native proofreading of existencias/asignación/ATP terminology. | NOT CHECKED | |
| L05 | Confirm all four versions describe the same assumptions and calculations. | NOT CHECKED | |
| L06 | Confirm accessibility and mobile behavior only after an actual browser preview is built and tested. | NOT CHECKED | |


## Mobile/browser acceptance script — NOT YET EXECUTED

**Scope:** Preview-only; do not merge or publish to satisfy this checklist. Record device, browser, date, tester, screenshot/video evidence, and PASS / FAIL / NOT CHECKED for each item. A CI success is not a substitute for visual testing.

| ID | Hands-on action | Expected result | Result | Evidence |
|---|---|---|---|---|
| M01 | Open the RK-0006 preview at a narrow iPhone viewport. | No horizontal scrolling; headings, notice and examples remain readable. | NOT CHECKED | |
| M02 | Switch English → 中文 → Français → Español → English. | Heading, full body, editorial notice and HOLD footer all change; browser tab title follows. | NOT CHECKED | |
| M03 | Select 中文, refresh, then use the copied `?lang=zh` URL. | Chinese remains selected; page language is set to zh. | NOT CHECKED | |
| M04 | Load `?lang=invalid` and then use the selector. | Safe English fallback; selector still works. | NOT CHECKED | |
| M05 | Inspect both worked examples in each language. | 100 − 65 = 35 and 80 − 30 − 20 = 30, with non-overlap and cut-geometry caveats intact. | NOT CHECKED | |
| M06 | Follow research and independent-review reference links. | Both open the intended source/review files; no broken paths. | NOT CHECKED | |
| M07 | Inspect accessibility with keyboard and screen reader, where available. | Selector has an accessible label and focus is visible; no content inaccessible by keyboard. | NOT CHECKED | |
| M08 | Inspect page source and public knowledge index. | Preview is marked `noindex,nofollow`, clearly HOLD; RK-0006 is absent from the published index. | NOT CHECKED | |

**Acceptance rule:** Record failures and fix them on the draft branch. Only mark M01–M08 PASS after actual testing with reproducible evidence. L06 remains NOT CHECKED until the required real-device/browser checks are documented.

## Editorial handoff and release decision — PENDING

**Automated checks (2026-11-10):** Three checks succeeded on commit `65f9ee766b893ad77de03676082cf995e3e9ffa1`: Site integrity, RUNLU Knowledge validation, RUNLU Knowledge Publication Gate. This confirms only the automated scope, not manual or independent acceptance.

**Branch integration:** This draft branch has diverged from `main`. Latest comparison shows 13 commits ahead and 21 behind, with no overlapping changed file paths reported. GitHub's mergeability flag was false at last inspection; do not assume a clean merge or override protections. Sync and rerun CI only when ready, without modifying production content.

**Release blockers:** T01–T08, S01–S05, L01–L06 and M01–M08 remain NOT CHECKED. Reviewer identity, evidence, review dates, rights approval, and editorial authorization are absent. No public publication approval is implied.

**Handoff sequence:** (1) Assign independent subject-matter and language reviewers; (2) record evidence against the existing checklist; (3) correct all four manuscripts and preview together; (4) complete real iPhone/browser testing; (5) synchronize branch and rerun CI; (6) seek an explicit editorial release decision. Keep `knowledge/data/published.json` unchanged until authorized.

## Author-led internal review assignment — 2026-11-10

The RUNLU author agreed to serve as final professional-content reviewer for RK-0005 and RK-0006, supported by assistant-led technical/source checks, language-consistency review and publication preparation. This is a reviewer **assignment only**, not a technical PASS, rights clearance, completed four-language proofreading, or permission to publish. Preserve the individual T/S/L/M checklist items as NOT CHECKED until evidence exists. Record a real reviewer name or signature, review date, verdict, and evidence before any approval. No paid external review is required by this chosen workflow, but no source-rights or factual requirement is waived.

## Reviewer record
- Reviewer name / role: **not assigned**
- Review date: **not reviewed**
- Technical verdict: **PENDING**
- Editorial verdict: **PENDING**
- Rights verdict: **PENDING**
- Publication authorization: **NOT GRANTED**

## Release rules
1. Never infer professional approval from CI checks, PR merge, or a language selector working.
2. Keep RK-0006 out of `knowledge/data/published.json` while any blocker is pending.
3. If a reviewer changes a claim, update all four language versions and rerun checks.
4. Only an explicit editorial decision may change HOLD to approved.
