# RK-0007 — Four-language prepublication QA report

**RUNLU KNOWLEDGE · Internal editorial checkpoint · 2026-11-19**

**Status: IN PROGRESS / NOT APPROVED FOR PUBLICATION**

## Materials reviewed
- `RK-0007-EN-DRAFT.md` — original English
- `RK-0007-ZH-DRAFT.md` — Chinese adaptation
- `RK-0007-FR-DRAFT.md` — French adaptation
- `RK-0007-ES-DRAFT.md` — Spanish adaptation

All four files were fetched from the same GitHub editorial branch for this check. This is an editorial consistency review, not an independent professional translation certification.

## Cross-language checkpoints

| Item | Expected across all languages | Result |
|---|---|---|
| Fictional cleaning business | Clearly identified as fictional | Present in all four |
| Currency | Canadian dollars | Present in all four |
| Services performed and invoiced | 12,000 | Present in all four |
| Wages | 6,000 | Present in all four |
| Other operating expenses | 2,000 | Present in all four |
| Illustrative operating profit | 4,000 | Present in all four |
| Starting cash | 5,000 | Present in all four |
| November cash receipts | 0 | Present in all four |
| Cash shortfall | 3,000 | Present in all four |
| Invoice payment date | December 15 | Present in all four |
| Four-week forecast | Four weeks, separate illustration | Present in all four |
| Practical habits | Seven habits | Present in all four |
| Educational disclaimer | No individualized advice | Present in all four |

## Arithmetic verification

**Illustrative operating profit:** 12,000 − 6,000 − 2,000 = **4,000**.

**November projected cash:** 5,000 + 0 − (6,000 + 2,000) = **−3,000**. This is a funding shortfall, not permission to overdraw a bank account.

**Separate four-week forecast:**

| Week | Opening | Receipts | Payments | Closing | Recomputed |
|---|---:|---:|---:|---:|---|
| 1 | 5,000 | 1,000 | 2,000 | 4,000 | PASS |
| 2 | 4,000 | 0 | 3,500 | 500 | PASS |
| 3 | 500 | 4,000 | 2,500 | 2,000 | PASS |
| 4 | 2,000 | 3,000 | 2,000 | 3,000 | PASS |

Week-to-week opening and closing balances reconcile. Lowest projected closing cash is **500 in week 2**. The four-week schedule is expressly independent of the November operating example and must not be combined into a single financial statement.

## Terminology controls

- **Revenue:** EN revenue; ZH 营业收入; FR chiffre d'affaires; ES ingresos.
- **Profit:** EN profit; ZH 利润; FR bénéfice; ES beneficio.
- **Cash collected:** EN cash collected; ZH 实际收款; FR encaissements; ES efectivo cobrado.
- **Cash available:** EN cash available; ZH 可支配现金; FR liquidités disponibles; ES efectivo disponible.
- **Accounts receivable:** EN accounts receivable; ZH 应收账款; FR créances clients; ES cuentas por cobrar.
- **Accounts payable:** EN accounts payable; ZH 应付账款; FR dettes fournisseurs; ES cuentas por pagar.
- **Rolling cash forecast:** EN rolling cash forecast; ZH 滚动现金预测; FR prévision glissante de trésorerie; ES previsión móvil de caja.

These are working editorial equivalents; a qualified native-language financial editor has **not** independently certified them.

## Issues and publication gates

1. **Sources:** The drafts list BDC and Government of Canada URLs, but this QA pass did not independently reopen and verify every cited claim against the live source. Verify all live links and claim-to-source mappings before publication. Do not label this gate complete.
2. **Title/rights:** Original fictional examples and tables are stated as such, but no comprehensive title collision, trademark or rights clearance has been completed. Do not claim legal clearance.
3. **Tax scope:** No tax rates, thresholds or remittance deadlines are stated. Keep jurisdiction-specific claims out until checked.
4. **Translations:** Confirm native idiom and financial terminology, especially FR `bénéfice` vs `résultat` and ES `efectivo disponible` vs `liquidez disponible`, before release.
5. **Web integration:** The four markdown files are editorial drafts, not a published `knowledge/articles/RK-0007.html` page. Language deep links, responsive tables, search visibility and site integrity tests have **not** been performed for RK-0007.
6. **Authorization:** No publisher approval to release RK-0007 has been recorded. Do not merge or publish it automatically.

## Next milestone

Create a non-public four-language HTML preview on the editorial branch; run site tests and inspect mobile table readability. Keep the existing verified-record registry unchanged. Present the preview for publisher acceptance before release.

**Checkpoint result: four drafts exist; central arithmetic and narrative anchors are consistent; remaining gates are open.**
