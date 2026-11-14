# RK-0006 — Independent review packet v0.1

**Status: HOLD.** This packet supports independent review; it does not certify any review as complete.

## Materials to inspect
- Full four-language editorial manuscript: [RK-0006-INVENTORY-AVAILABILITY.md](../editorial/RK-0006-INVENTORY-AVAILABILITY.md)
- Research and source register: [RK-0006-RESEARCH-BRIEF.md](RK-0006-RESEARCH-BRIEF.md)
- Tracking issue: https://github.com/nevergiveup980-ux/Runlu.ca/issues/448
- Editorial PR: https://github.com/nevergiveup980-ux/Runlu.ca/pull/475 (current); historical draft: https://github.com/nevergiveup980-ux/Runlu.ca/pull/449

## Independent technical review: record PASS / REVISE / NOT CHECKED for each
| ID | Verification question | Result | Evidence / reviewer note |
|---|---|---|---|
| T01 | Is the distinction between physical on-hand, current available, and date-specific ATP accurate for the named ERP products? | ASSISTANT SOURCE-TO-MANUSCRIPT CHECK PASS; final technical signoff pending | Four language editions distinguish recorded physical on-hand, allocation availability subject to reservations/status, and date-specific ATP including projected receipts/demand. Source register S01–S04 identifies vendor-specific definitions. Article does not imply expected receipts are physically present. |
| T02 | Are any ERP-specific definitions incorrectly presented as universal? | ASSISTANT SOURCE-TO-MANUSCRIPT CHECK PASS; final technical signoff pending | Both arithmetic examples are explicitly hypothetical and conditional; EN/ZH/FR/ES state ERP fields and calculations vary. The 100−65=35 example is not represented as a universal ERP formula. |
| T03 | Does Scenario A correctly show 100 LF − 65 LF = 35 LF, with no implied continuous-cut guarantee? | AUTHOR SCENARIO CONFIRMED; full review pending | Author explicitly confirmed scenario arithmetic and practical principle on 2026-11-11; no continuous-cut guarantee asserted. |
| T04 | Does Scenario B clearly state non-overlap and avoid double-counting 30 LF restricted and 20 LF committed? | AUTHOR SCENARIO CONFIRMED; full review pending | Author explicitly confirmed the conditional 80 − 30 − 20 = 30 scenario on 2026-11-11; source/translation reviews remain open. |
| T05 | Is it clear that inventory holds/reservations must not be overridden without authorization? | ASSISTANT MANUSCRIPT CHECK PASS; final technical signoff pending | EN explicitly requires responsible authority review; ZH requires authorized approval; FR/ES warn against unauthorized release. This checks manuscript wording, not implementation of warehouse permissions. |
| T06 | Are dye lot, roll/remnant identity, usable dimensions, and quality status treated as separate checks? | ASSISTANT MANUSCRIPT CHECK PASS; final technical signoff pending | EN/ZH/FR/ES distinguish inventory allocation from roll identity, usable continuous cut, dye lot, condition and installation constraints. |
| T07 | Are future expected receipts distinguished from stock physically received? | ASSISTANT MANUSCRIPT CHECK PASS; final technical and language signoff pending | EN/ZH already distinguish future deliveries from stock on hand; FR/ES now explicitly state expected receipts are not physically received today. Both manuscript and four-language HTML preview were updated together (commits 11238369, b4ba580e). |
| T08 | Does this article avoid duplicating RK-0005's cut-geometry focus? | ASSISTANT MANUSCRIPT CHECK PASS; final editorial signoff pending | All four versions identify RK-0005 as cut-geometry article; RK-0006 focuses on commitments, restricted stock and date-specific promise. |

## Sources and rights

The S01–S04 PASS labels below are limited to assistant-performed verification of publicly accessible official documentation on 2026-11-11. They do **not** signify independent human source review, licensing approval, or final editorial authorization. S05 remains NOT CHECKED.
| ID | Required check | Result | Evidence / reviewer note |
|---|---|---|---|
| S01 | Confirm Oracle NetSuite on-hand/committed/available definitions at the cited official URL. | PASS — official source checked 2026-11-11 | Oracle Assessing Stock Levels: available = on hand − committed; on hand includes committed. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2262573.html |
| S02 | Confirm Microsoft Dynamics 365 physical inventory / physical reserved / available physical definitions at the cited official URL. | PASS — official source checked 2026-11-11 | Microsoft On-hand list: Available physical = Physical inventory − Physical reserved; dimensions and filters affect aggregation. https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-on-hand-list |
| S03 | Confirm Oracle NetSuite ATP scope, timing and configuration caveats. | PASS — official source checked 2026-11-11 | Oracle ATP describes projected receipt/ship dates, expected supply and demand; Demand Planning prerequisite noted. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2300269.html |
| S04 | Confirm Oracle NetSuite inventory-status commitment restrictions. | PASS — official source checked 2026-11-11 | Oracle Inventory Status: quantities can remain on hand while excluded from commitment based on status. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515696627.html |
| S05 | Check links, attribution, quotation/reuse rights and any version-specific qualifications. | ASSISTANT MANUSCRIPT RIGHTS-SCREEN PARTIAL; final rights signoff pending | The manuscript and research brief identify four official vendor documentation URLs, describe facts in original wording, and include no reproduced source tables, screenshots, or long quotations. Oracle/Microsoft formulas are explicitly attributed in the source register, not represented as universal. This is a text-level screen only: it does not establish permission for any external images/assets, independent legal clearance, current link availability, or product-version applicability. |

## S05 preliminary source-use assessment — 2026-11-11

**Scope:** Editorial risk assessment of RK-0006's four vendor documentation references; **not** a vendor permission grant, legal opinion, or completed rights signoff.

- The manuscript presents original hypothetical warehouse arithmetic and paraphrases functional ERP concepts, rather than copying Oracle/Microsoft screenshots, diagrams, tables, or substantial passages. The four source URLs identify the publishers and enable verification.
- Factual concepts and independently authored explanations generally differ from copying protected source expression. Nonetheless, vendor-specific terminology, licensing terms, and trademarks must not be presented as endorsed or licensed by Oracle or Microsoft.
- Keep the vendor names in factual attribution only. No vendor logos, branded screenshots, or copied manuals should be added without separate rights checks.
- Before changing S05 to PASS: recheck each page's applicable terms of use and version context; verify that the final four-language article still contains no protected passages or visual assets; record the responsible editor's rights decision and date. No blanket claim of permission is supported by this assessment.

**Disposition: PRELIMINARY / OPEN.** Publication rights gate remains HOLD.

## Language and reader usability

**Cross-language audit scope (2026-11-11):** Assistant compared the four editorial language sections for numbers, stated assumptions, central inventory distinctions, cut-geometry caveat and workflow cautions. The L05 result is not a native-language proofreading certificate; L01–L04 remain NOT CHECKED until a complete editorial language review is documented.
| ID | Required check | Result | Evidence / reviewer note |
|---|---|---|---|
| L01 | English: clarity, accurate terminology, accessible reading level. | NOT CHECKED | |
| L02 | Chinese: natural phrasing; consistent LF / 色批 / 预留 / 承诺 / ATP. | NOT CHECKED | |
| L03 | French: native proofreading of stock/engagement/ATP terminology. | NOT CHECKED | |
| L04 | Spanish: native proofreading of existencias/asignación/ATP terminology. | NOT CHECKED | |
| L05 | Confirm all four versions describe the same assumptions and calculations. | ASSISTANT CROSS-CHECK PASS; independent proofreading pending | Compared EN/ZH/FR/ES manuscript on 2026-11-11: all state 100 LF on hand, 65 LF committed, 35 LF remainder and 50 LF new request; all state 80 LF physical, 30 LF blocked, 20 LF separately committed, 30 LF remainder with non-overlap; all distinguish allocation from continuous-cut suitability and caution against treating ERP formulas as universal. This is semantic consistency review only, not native-speaker proofreading or final language approval. |
| L06 | Confirm accessibility and mobile behavior only after an actual browser preview is built and tested. | NOT CHECKED | |


## Mobile/browser acceptance script — PARTIALLY EXECUTED (2026-11-14)

**Scope:** Preview-only; do not merge or publish to satisfy this checklist. Record device, browser, date, tester, screenshot/video evidence, and PASS / FAIL / NOT CHECKED for each item. A CI success is not a substitute for visual testing.

| ID | Hands-on action | Expected result | Result | Evidence |
|---|---|---|---|---|
| M01 | Open the RK-0006 preview at a narrow iPhone viewport. | No horizontal scrolling; headings, notice and examples remain readable. | PARTIAL PASS — visible EN/ZH viewport only | Author's two 2026-11-14 iPhone screenshots show readable headings and opening body; full-page scroll and examples not yet inspected. |
| M02 | Switch English → 中文 → Français → Español → English. | Heading, full body, editorial notice and HOLD footer all change; browser tab title follows. | PARTIAL PASS — EN/ZH only | Author's two 2026-11-14 iPhone screenshots show localized EN/ZH banner, language label, title, notice and opening body; FR/ES, footer and browser title not evidenced by these images. |
| M03 | Select 中文, refresh, then use the copied `?lang=zh` URL. | Chinese remains selected; page language is set to zh. | NOT CHECKED | |
| M04 | Load `?lang=invalid` and then use the selector. | Safe English fallback; selector still works. | NOT CHECKED | |
| M05 | Inspect both worked examples in each language. | 100 − 65 = 35 and 80 − 30 − 20 = 30, with non-overlap and cut-geometry caveats intact. | NOT CHECKED | |
| M06 | Follow research and independent-review reference links. | Both open the intended source/review files; no broken paths. | NOT CHECKED | |
| M07 | Inspect accessibility with keyboard and screen reader, where available. | Selector has an accessible label and focus is visible; no content inaccessible by keyboard. | NOT CHECKED | |
| M08 | Inspect page source and public knowledge index. | Preview is marked `noindex,nofollow`, clearly HOLD; RK-0006 is absent from the published index. | NOT CHECKED | |

**Acceptance rule:** Record failures and fix them on the draft branch. Partial screenshot evidence may be recorded as PARTIAL PASS; only mark each M01–M08 PASS after its entire expected result has been verified with reproducible evidence. L06 remains NOT CHECKED until the required real-device/browser checks are documented.

## Live website visual acceptance — 2026-11-14

Author supplied two iPhone screenshots of `runlu.ca` RK-0006 live preview showing English and Chinese. **PASS (limited visual scope):** both languages render readable title, review banner, language label, editorial notice and beginning of body; Chinese banner and language label are localized. No visible overflow in captured portions. This supports only the pictured portion of M01 and the EN↔ZH portion of M02. **NOT CHECKED:** full-page scroll/overflow, French and Spanish in this screenshot pair, refresh/query persistence, both worked examples, research links, assistive technology, and page source/index audit. Earlier screen recording was described as showing Spanish switching, but it is not a substitute for all remaining checks. No screenshot is uploaded to the repository in this change; evidence resides in the author's 2026-11-14 chat attachments. Do not mark M01–M08 collectively PASS or lift HOLD.

## Editorial handoff and release decision — PENDING

**Automated checks (2026-11-14):** On PR #475, latest verified commit `5698408c329b27571239d4998fd3a6db34b032e3`, all three checks completed successfully: Site integrity (run 43633245773), RUNLU Knowledge validation (run 43633245776), and RUNLU Knowledge Publication Gate (run 43633245819). Four-language scenario safeguards and standalone-safe GitHub review URLs have automated assertions. The publication-gate run produced `rk-0006-editorial-preview-html` (artifact ID `14128992459`, expires 2026-11-28) and `knowledge-editorial-quality-report` (artifact ID `14129092168`, expires 2026-12-14). Download preview from the run's Artifacts section for actual iPhone acceptance. These establish automated checks and artifact presence only, not human language/rights approval or actual browser acceptance.

**Branch integration:** PR #475 was created from current `main` after wellness language-check fix #470 and carries the six RK-0006 editorial/research/preview/workflow files from draft #449. GitHub reported mergeable=false on inspection; draft status remains. The previous ahead/behind counts for #449 are historical and must not be used as the current #475 branch status.

**Release blockers:** Final technical signoff, source rights/version review (S05), full EN/ZH/FR/ES proofreading (L01–L04), actual iPhone/browser checks (L06/M01–M08), reviewer/date evidence and editorial authorization remain open. Assistant checks and author scenario confirmations are recorded above with limited scope; do not downgrade them to NOT CHECKED or upgrade them to independent approval. No public publication approval is implied.

**Handoff sequence:** (1) Assign independent subject-matter and language reviewers; (2) record evidence against the existing checklist; (3) correct all four manuscripts and preview together; (4) complete real iPhone/browser testing; (5) synchronize branch and rerun CI; (6) seek an explicit editorial release decision. Keep `knowledge/data/published.json` unchanged until authorized.

## Author professional scenario confirmation — 2026-11-11

**Decision recorded:** The RUNLU author explicitly confirmed in conversation that the three proposed warehouse scenarios and their decision principles match practical flooring-warehouse experience. Scope: RK-0005's two 12 ft × 12.5 ft remnants (300 ft² total) cannot independently supply a single continuous 12 ft × 20 ft cut (240 ft²) without an approved joining approach; RK-0006's illustrative 100 LF − 65 LF = 35 LF, and 80 LF − 30 LF restricted − 20 LF separately committed = 30 LF under non-overlapping assumptions.

**Evidence:** Author's explicit response “确认” to the question listing all three cases and asking whether their judgments fit actual warehouse practice, 2026-11-11 (conversation). This is **author practitioner confirmation of the scenario principles**, not independent verification of real customer transactions, universal ERP rules, installation permissions, source rights, four-language translations, mobile testing or overall publication approval. Do not mark other checklist items complete on this basis.

## Author-led internal review assignment — 2026-11-10

The RUNLU author agreed to serve as final professional-content reviewer for RK-0005 and RK-0006, supported by assistant-led technical/source checks, language-consistency review and publication preparation. This is a reviewer **assignment only**, not a technical PASS, rights clearance, completed four-language proofreading, or permission to publish. Preserve all unverified T/S/L/M checklist items as NOT CHECKED; T03/T04 record only the limited author scenario confirmation, not a full independent technical PASS. Record a real reviewer name or signature, review date, verdict, and evidence before any approval. No paid external review is required by this chosen workflow, but no source-rights or factual requirement is waived.

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
