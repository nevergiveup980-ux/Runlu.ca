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
| M01 | Open the RK-0006 preview at a narrow iPhone viewport. | No horizontal scrolling; headings, notice and examples remain readable. | PARTIAL PASS — visible EN/ZH/FR/ES sections | Author's five 2026-11-14 iPhone screenshots show readable four-language upper sections and Spanish footer; full-page scroll and examples in all languages not yet inspected. |
| M02 | Switch English → 中文 → Français → Español → English. | Heading, full body, editorial notice and HOLD footer all change; browser tab title follows. | PARTIAL PASS — all four upper sections visually evidenced | Author's 2026-11-14 screenshots show EN/ZH/FR/ES localized banner, selector label, title, notice and opening body; full switch sequence, document title and every footer not yet evidenced. |
| M03 | Select 中文, refresh, then use the copied `?lang=zh` URL. | Chinese remains selected; page language is set to zh. | AUTHOR PASS | Author reported all requested M03/M04 phone checks passed on 2026-11-15, including Chinese deep-link refresh. |
| M04 | Load `?lang=invalid` and then use the selector. | Safe English fallback; selector still works. | AUTHOR PASS | Author reported all requested M03/M04 phone checks passed on 2026-11-15, including English fallback and selector operation. |
| M05 | Inspect both worked examples in each language. | 100 − 65 = 35 and 80 − 30 − 20 = 30, with non-overlap and cut-geometry caveats intact. | AUTHOR PASS + SOURCE/CI PASS | After being asked to inspect both examples in all four languages for full display, consistent figures and truncation, author replied “全部正常” on 2026-11-15. Existing `rk-0006-live.test.mjs` checks arithmetic and operational caveats; author-reported device acceptance is recorded separately from automated evidence. |
| M06 | Follow research and independent-review reference links. | Both open the intended source/review files; no broken paths. | AUTHOR PASS — both iPhone links open | Author confirmed 2026-11-15 that both Research Materials and Review Checklist links open successfully and lead to GitHub repository pages, not RUNLU-branded pages. Source targets were independently fetched via GitHub. No claim of independent visual review of the rendered GitHub pages. |
| M07 | Inspect accessibility with keyboard and screen reader, where available. | Selector has an accessible label and focus is visible; no content inaccessible by keyboard. | SOURCE FIX + CI PASS; DEVICE CHECK PENDING | PR #488 removes the fixed English `aria-label` that overrode the localized `<label for="lang">`; regression test checks association and focus-visible styling. Three workflows passed; squash-merged to `main` as `f1c3fae95ed3471112dc43ca57a308e2f1d2b4ac`. Actual VoiceOver/keyboard operation not yet witnessed. |
| M08 | Inspect page source and public knowledge index. | Preview is marked `noindex,nofollow`, clearly HOLD; RK-0006 is absent from the published index. | SOURCE AUDIT PASS; live HTTP/browser verification pending | GitHub `main` inspected 2026-11-15: preview has robots noindex,nofollow and explicit public-review/HOLD notices; `knowledge/data/published.json` contains `entries: []`; `knowledge/index.html` has no RK-0006 entry. This is repository-source evidence, not a live browser or HTTP header audit. |

**Acceptance rule:** Record failures and fix them on the draft branch. Partial screenshot evidence may be recorded as PARTIAL PASS; only mark each M01–M08 PASS after its entire expected result has been verified with reproducible evidence. L06 remains NOT CHECKED until the required real-device/browser checks are documented.

## Live website visual acceptance — 2026-11-14

Author supplied two iPhone screenshots of `runlu.ca` RK-0006 live preview showing English and Chinese. **PASS (limited visual scope):** both languages render readable title, review banner, language label, editorial notice and beginning of body; Chinese banner and language label are localized. No visible overflow in captured portions. This supports only the pictured portion of M01 and the EN↔ZH portion of M02. **NOT CHECKED:** full-page scroll/overflow, French and Spanish in this screenshot pair, refresh/query persistence, both worked examples, research links, assistive technology, and page source/index audit. Earlier screen recording was described as showing Spanish switching, but it is not a substitute for all remaining checks. No screenshot is uploaded to the repository in this change; evidence resides in the author's 2026-11-14 chat attachments. Do not mark M01–M08 collectively PASS or lift HOLD.

## Additional author iPhone visual evidence — 2026-11-14

The author supplied three more screenshots from the live `runlu.ca` RK-0006 page: French upper page, Spanish upper page, and Spanish footer. **PASS for visible scope:** FR/ES localized banner, language label, title, notice and opening body render legibly; Spanish lower article, editorial note, footer and research/review link labels render with no visible horizontal overflow. **Remaining checks:** complete four-language footer switching, two numerical examples in all languages, actual link navigation, query/refresh persistence, keyboard/screen-reader, full page/source checks. The Spanish footer still starts with English `HOLD`; this is a localization polish item, not evidence of publication approval. The screenshot shows link text, not a successful click-through. Images remain in the author's chat attachments; do not claim they are repository artifacts.

## Live-preview regression protection — 2026-11-14

GitHub PR #482 merged to `main` (squash commit `329a62c074e8f1bf8e31ca8e62999ad39c9a4fc7`) after successful Site integrity (run 43673757031), RUNLU Knowledge Publication Gate (run 43673756958), and RUNLU Knowledge validation (run 43673756969). This adds a CI-enforced test of the deployed RK-0006 review-preview source for four-language content presence, localized status/footer, query-based language switching, review links and `noindex,nofollow`. This is **automated regression protection**, not evidence of real-device click-through, human proofreading, source-rights signoff or publication authorization.

## Four-language live scenario regression — 2026-11-15

GitHub PR #483 merged into `main` (squash commit `ae55db564ca8e6a9b3642eb45f535d0237478277`) after successful RUNLU Knowledge validation (run 43676583528), RUNLU Knowledge Publication Gate (run 43676583548), and Site integrity (run 43676583540). The deployed-preview regression now asserts all four languages preserve both illustrative inventory scenarios (100−65=35 LF with 50 LF request; 80−30−20=30 LF under non-overlap), hold authorization and RK-0005 cut-geometry distinction. **Automated text checks only:** they do not constitute actual iPhone scrolling through the examples, independent editorial approval, rights clearance or proof of business-system behavior.

## S05 follow-up — direct official sources and usage terms checked 2026-11-15

**Disposition: PARTIAL / HOLD, not legal clearance.** The assistant directly opened all four official documentation pages on 2026-11-15. The URLs resolve and support the core article distinctions: Oracle stock levels (on-hand, committed, available), Microsoft Dynamics 365 available physical (physical inventory minus physical reserved, with dimension/filter qualifications), Oracle ATP (expected supply/demand and projected date; Demand Planning feature dependency), and Oracle inventory status (on-hand can remain present while unavailable for commitment). Microsoft documentation page showed last updated 2026-06-15. This is a current source-link and meaning check, not a guarantee of future availability or independent review.

- S01: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2262573.html — opened and concept verified 2026-11-15.
- S02: https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-on-hand-list — opened and concept verified 2026-11-15; aggregation/dimensions and expected-receipts configuration matter.
- S03: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2300269.html — opened and concept verified 2026-11-15; Demand Planning must be enabled for NetSuite ATP.
- S04: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515696627.html — opened and concept verified 2026-11-15; inventory-status commitment eligibility is configurable.
- Oracle site terms: https://www.oracle.com/legal/terms/ — default materials usage is limited; no general redistribution or modification permission should be assumed. Oracle documentation legal notices: https://docs.oracle.com/en/dcommon/html/cpyr.htm — documentation copying/translation/republication is restricted unless licensed or legally allowed.
- Microsoft Learn site terms: https://learn.microsoft.com/en-us/legal/termsofuse — default terms restrict copying/republishing; some specific documents may have overriding explicit licenses. **No license specific to the cited Dynamics page was established in this check.** A CC-BY license for a different Microsoft repository cannot be assumed to apply to this page.

**Editorial control:** Continue using original explanations, independently invented warehouse examples and source hyperlinks; do not import, translate or reproduce vendor manuals, screenshots, tables, logos or substantial passages. Verify source applicability to specific ERP versions before making vendor-specific operational promises. The final four-language manuscript must be screened for copied material, and a responsible editor must record a dated rights decision. S05 remains OPEN; do not mark rights approved or lift HOLD.

## Four-language paragraph-level editorial audit — 2026-11-15 (assistant review; not native proofreading)

**Material inspected:** the full EN/ZH/FR/ES text in `knowledge/editorial/RK-0006-INVENTORY-AVAILABILITY.md` on the draft branch, and the branch's embedded preview article bodies. **Scope:** terminology, semantic alignment, original expression and editorial caution. This is not a claim that L01–L04 are independently signed off.

| Section | Cross-language result | Editorial finding |
|---|---|---|
| Opening / physical presence | ALIGNED | All four versions separate physical stock from allocation permission; EN additionally names quarantine/damage, while FR/ES group restrictions more briefly. No substantive contradiction. |
| On-hand / available / ATP | ALIGNED WITH CAVEAT | All four distinguish present inventory, current allocation, and date-specific promise. Keep the ERP-specific caveat. Avoid translating ATP as a guarantee of delivery. |
| Scenario A | ALIGNED | EN/ZH/FR/ES retain 100 LF, 65 committed, 35 remainder and new 50 LF request; all identify example as hypothetical. |
| Scenario B | ALIGNED | EN/ZH/FR/ES retain 80 LF, 30 restricted, 20 separately committed, 30 conditional remainder, non-overlap and prohibition on unauthorized hold release. |
| Cut geometry and dye lot | ALIGNED | Each version separates available quantity from continuous usable cut and RK-0005. ZH has additional installation detail; not an incompatible claim. |
| Confirmation workflow | ALIGNED | All versions require checking product/unit, reservations, roll/lot, usable dimensions, future receipts, authority and discrepancy handling. |
| Editorial caution | ALIGNED WITH STYLE DIFFERENCE | EN/ZH explicitly defer to contracts/company/manufacturer rules; FR/ES state non-universal formula and installation caveat but are less explicit about precedence. Consider adding equivalent priority-of-rules language during native proofreading. |

**Targeted terminology suggestions (not automatically applied):**
- EN: Keep `on hand`, `available` and `ATP` separate; do not claim every ERP uses the illustrative subtraction.
- ZH: Prefer consistent `现存数量` / `当前可用数量` / `可承诺数量（ATP）`; verify whether `色批` or `染色批次` best matches RUNLU's glossary.
- FR: Review `stock en main` (literal anglicism) versus `stock physique` / `stock disponible`; check `disponible à promettre` and `pieds linéaires` with a qualified French-language editor.
- ES: Review `disponible para prometer` against industry terminology `disponible para compromiso`; check `pies lineales`, `lote de teñido` and `alfombra` for target market.
- The draft-branch preview file is older than the live `main` preview (which has four-language localized status, links and HOLD footer). **Before any future PR that merges preview HTML, reconcile it against `main` to avoid undoing accepted localization.**

**Result:** Assistant paragraph-level semantic audit complete; L01–L04 remain **NOT CHECKED for independent/native proofreading**, L06 and real-device M03–M08 remain open. No publication approval granted.

## Targeted FR/ES editorial amendments — 2026-11-15

Draft manuscript commit `67b9f5fdff5bc4714944d1dbbf526cfe835349d4` changes the French heading to describe physically present stock rather than the literal anglicism `stock en main`, and aligns FR/ES closing cautions with EN/ZH by explicitly deferring to applicable internal procedures, contractual conditions and manufacturer instructions. **Editorial changes only:** no vendor language was copied, arithmetic and scenarios were unchanged. FR/ES terminology still requires independent/native proofreading. The public `main` preview has **not** been updated by this manuscript-only commit; reconcile preview bodies and localized UI before asking the author to visually accept these new phrases. Publication remains HOLD.

## Author four-language switching acceptance — 2026-11-15

The author explicitly reported **four-language switching accepted** in chat on 2026-11-15. This is user-reported functional acceptance of switching, not independent confirmation of all eight M01–M08 mobile checks, all four full article scrolls, screen-reader accessibility or complete native-language proofreading. PR #485 (FR/ES copy sync) passed RUNLU Knowledge validation, RUNLU Knowledge Publication Gate and Site integrity, then was squash-merged to `main` as `56c9f335db6615d186d902f0bf08448c6800707a`. Record the switching portion of M02 as **AUTHOR PASS**, retaining M02's full footer/tab-title checks as not independently evidenced. Formal publication remains HOLD.

## M08 repository-source audit — 2026-11-15

Inspected current `main` versions of `knowledge/preview/RK-0006.html` (blob `2caebf7fa7e6493aefe9539afff568dad1583772`), `knowledge/data/published.json` (blob `4f30a2fd2628029e8971c455f304f03356968ea6`) and `knowledge/index.html` (blob `5979694d17a9a1804a9a3c117bb18904a2b92e0f`). The preview source includes `<meta name="robots" content="noindex,nofollow">` and review-only HOLD wording. The published dataset has an empty `entries` array, and the public index source does not contain RK-0006. **Result: M08 source audit PASS; actual deployed HTTP/browser verification still pending.** No change to publication status.

## M06 research and review links — repository target verification, 2026-11-15

Read the three `href` targets in the `main` preview source. The research link resolves to `knowledge/reviews/RK-0006-RESEARCH-BRIEF.md` on the named editorial branch (GitHub blob `cb164d7a1e9ff56926693ee11bc7af38e780caf0`), and the independent-review link resolves to `knowledge/reviews/RK-0006-INDEPENDENT-REVIEW-PACKET.md` (blob `48362a36892ccabcb034b9d60397c8ea9c8a3d77`); both exact files were fetched successfully through GitHub. The third `../` link is a relative return to `/knowledge/` when the preview is hosted at `/knowledge/preview/RK-0006.html`. **Result: source-link target check PASS, live browser tap/redirect/accessibility still NOT CHECKED.** Do not claim the author clicked either link.

## M06 author acceptance — 2026-11-15

The author explicitly confirmed that **both** `研究资料` (Research Materials) and `审核清单` (Review Checklist) links open successfully when tapped on their phone. The author also observed that both links lead to GitHub repository-file pages rather than RUNLU-branded pages. **M06 link-opening acceptance: AUTHOR PASS.** The GitHub destination is expected for the present editorial review workflow; these materials are not approved for formal public publishing. Consider a RUNLU-branded, appropriately access-controlled review interface in a future iteration only if needed; do not expose internal review material as a public-facing article. No new publishing permission is implied, and RK-0006 remains HOLD.

## M03/M04 author acceptance and regression protection — 2026-11-15

After receiving direct instructions to test Chinese `?lang=zh` refresh and invalid `?lang=invalid` fallback with subsequent selector switching, the author replied **“全部验收过关”**. Record **M03 AUTHOR PASS** and **M04 AUTHOR PASS** based on that explicit report, not independent device observation. PR #487 added source-contract regression assertions; all three GitHub workflows succeeded, and PR #487 was squash-merged to `main` at `a2e97ed6f8566d05a6a8a0c139523384298af037`. M01/M02 full scroll/title/footer details, M05 full examples, M07 accessibility, M08 live HTTP verification and editorial rights/language approvals remain distinct outstanding gates. Formal publication stays HOLD.

## M05 four-language scenario code verification — 2026-11-15

Reopened the exact current `main` files `knowledge/preview/rk-0006-live.test.mjs` (blob `79b45001ee7cbd9589de7b73321e71fc57669c62`) and `knowledge/preview/RK-0006.html` (blob `2caebf7fa7e6493aefe9539afff568dad1583772`). The preview contains both numeric examples in all four languages. The existing automated test explicitly checks `100 − 65 = 35`, `80 − 30 − 20 = 30`, each language's key quantities, non-overlapping exclusion categories, authorization/hold restrictions and the distinction from RK-0005 cut geometry. These checks have been present in `main` and were covered by previously successful workflows. **M05 SOURCE/CI PASS; author must still visually inspect both full examples in all four languages on phone.** Scenario quantities are illustrative, not a universal ERP availability formula. Publication remains HOLD.

## M05 author four-language scenario acceptance — 2026-11-15

Following a request to inspect both inventory scenarios in EN/ZH/FR/ES on the iPhone for complete display, consistent numbers and truncation, the author responded **“全部正常”**. Record **M05 AUTHOR PASS** in addition to prior source/CI checks. This does not constitute independent technical peer review or legal clearance, and it does not automatically close M01/M02 full-page review, M07 accessibility, M08 live HTTP verification, or outstanding terminology/rights gates. Formal publication remains HOLD.

## M07 accessible language label — source fix merged, 2026-11-15

PR #488 corrected the language selector's accessible-name source by removing the fixed English `aria-label` and relying on its translated visible `<label id="langLabel" for="lang">`. The existing `render` function updates that label per language, and the regression test guards the association and focus-visible styles. GitHub checks RUNLU Knowledge Publication Gate, RUNLU Knowledge validation and Site integrity all passed; PR #488 squash-merged into `main` at `f1c3fae95ed3471112dc43ca57a308e2f1d2b4ac`. **M07 source fix PASS, actual iPhone VoiceOver and external keyboard interaction remain NOT CHECKED.** No accessibility certification is claimed. RK-0006 remains editorial HOLD.

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
