# RK-0006 — Inventory on hand vs available-to-promise (research brief v0.1)

**Status:** RESEARCH / HOLD. Not approved, not published. Related: #448 and RK-0005 (different topic: cut geometry).

## Editorial thesis
A warehouse can physically hold material that it cannot promise to a new customer: some quantity may be committed to earlier orders, reserved, or excluded from commitment by inventory status. A projected future promise (ATP) may also depend on expected receipts and dated demand. Never assume one ERP formula applies universally.

## Primary-source evidence (checked 2026-11-08)
1. Oracle NetSuite, *Assessing Stock Levels*: quantity available = on hand − committed; on hand includes committed. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2262573.html
2. Microsoft Dynamics 365, *Inventory on-hand list*: available physical = physical inventory − physical reserved; additional fields and inventory dimensions distinguish reservation from other availability concepts. https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-on-hand-list
3. Oracle NetSuite, *Available to Promise*: ATP can use expected receipts and expected demand to assess a future availability date. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2300269.html
4. Oracle NetSuite, *Inventory Status*: on-hand quantity may be excluded from commitment based on inventory status. https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515696627.html

**Rights:** Facts are independently paraphrased. No source tables, screenshots, or copyrighted passages copied. Licensing review remains pending.

## Original hypothetical examples (NOT customer records)
**Scenario A — already committed:** 100 linear feet on hand, 65 linear feet committed to prior orders. Under a simple on-hand-minus-committed rule, 35 linear feet remain available; a new 50-linear-foot request cannot be promised immediately. This arithmetic does not prove a continuous usable cut, dye-lot match, or project suitability.

**Scenario B — inventory status hold:** 80 linear feet physically present; 30 linear feet designated as not available for commitment by an applicable inventory-status rule, and 20 additional linear feet already committed from eligible stock. Only 30 linear feet would remain under these explicit hypothetical assumptions. Do not automatically release held material; verify authorized status change and recheck quantities.

## Sales-to-warehouse confirmation checklist
1. Identify exact SKU, location, dye lot, roll/remnant identifiers and unit of measure.
2. Separate physical on-hand, reserved/committed, restricted and available quantities; avoid double-counting.
3. Check continuous usable dimensions and installation constraints separately (RK-0005).
4. Confirm any expected receipt dates and their uncertainty before promising future delivery.
5. Escalate discrepancies to the responsible sales/inventory authority; do not override reservations or material holds without authorization.
6. Record the verified decision, who approved it and when; do not claim a customer delivery occurred without evidence.

## Language titles (provisional; require human proofreading)
- EN: Why On-Hand Stock Is Not the Same as Available-to-Promise Inventory
- ZH: 为什么账面有库存，却不能承诺给新订单？
- FR: Pourquoi le stock en main n’est pas toujours disponible à la commande
- ES: Por qué las existencias físicas no siempre están disponibles para un nuevo pedido

## Publication blockers
- [ ] Independent trade review of definitions, scenarios and workflow.
- [ ] Check rights and exact scope of each primary source.
- [ ] Four-language full draft and independent proofreading.
- [ ] Editorial approval and explicit publication decision.

Do not add RK-0006 to `knowledge/data/published.json` or remove HOLD until all blockers are closed.
