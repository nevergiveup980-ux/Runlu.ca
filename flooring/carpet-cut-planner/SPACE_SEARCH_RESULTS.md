# Material search verification — 2026-11-08

Baseline: branch head 5108217af8f3ff9b30e97a9b489ad9e253e66f84, including Smallest area first, roll-length orderings and priority fallback. All baseline candidates remain in the new search. Added candidates try five piece orderings, incremental full-width allocated-area placement, and two disjoint guillotine partitions. They can ignore soft stock-type priority; completion and lower allocated area take precedence. This is a deterministic heuristic search, not a global optimum.

Reproduce: `npm install`, `npm run benchmark -- /absolute/path/report.json`. Seed 980; 1,000 synthetic orders; 1–3 rolls, different widths/remaining lengths, priorities representing FULL/SHORT/REMNANT, A/B lots, optional rotation. Raw inputs and per-order results are included in the JSON. Unit tests also check reversed piece order and all distinct candidate layouts for bounds, overlap, lot, orientation and exact piece accounting.

Only 470 orders complete under both searches enter the material totals. 530 incomplete orders are excluded from savings. No completion gains. New search improves 194 complete orders, ties 276, regresses zero.

| Metric (470 complete orders) | Baseline 5108217 | Expanded search |
|---|---:|---:|
| Placed pieces | 2,344 | 2,344 |
| Allocated SF | 170,423 | 163,872 |
| Allocated SYD | 18,935.89 | 18,208.00 |
| Waste SF | 32,493 | 25,942 |
| Waste / allocated area | 19.07% | 15.83% |
| Material saved SF | 0 | 6,551 |

Material reduction: 3.84% in this corpus only. Waste rate is weighted by allocated area, not an average of order percentages. Waste means unused area inside the full-width length consumed, not all remaining inventory. A reusable side offcut may therefore be counted as waste here; full-width tails are excluded.

The older pre-small-first search remains separately covered by material-benchmark.test.ts: 170,584 SF versus 163,872 SF; these are different baselines and must not be combined.

Limits: rectangular pieces, greedy placement, two guillotine split policies, no backtracking or global optimum guarantee, no seam design/pattern phase/defect mapping/blade kerf, no live inventory reservation. Unspecified piece lots remain unconstrained and require manual confirmation. Different requested lots stay separate; a common lot for an entire job must be entered explicitly. Small-first alone can perform worse, so it never replaces the complete candidate comparison.

Before warehouse acceptance: reconcile measured roll lengths/widths and dye lots, verify pile direction and permitted rotation, confirm allowances and real blade/trim losses, check seam/pattern phase with installer, compare printed selected layout to a supervised real order and record actual consumed lengths/offcuts using FIELD_ACCEPTANCE_TEMPLATE.md. This change is not production acceptance.

Next: record actual cuts and reusable offcuts against the planned allocation, then use those real orders as regression fixtures.
