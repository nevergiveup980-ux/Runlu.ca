# Reproducible material comparison — synthetic orders

Baseline reviewed at `f36089bc26d0638918190a73b164ea723aa5c223`.
This evaluates the small-area-first candidate already added in `77add02`; it does
not introduce a new packing algorithm or claim realized warehouse savings.

## Method

`comparePlans(rolls, pieces, {includeSmallAreaFirst:false})` reconstructs the full
candidate search before `77add02` (as in `3f04159`): area descending, length,
width, input order, shorter/longer roll order, and priority-free fallback.
The default search adds only area ascending. Both use identical geometry,
feasibility ranking, dye-lot and rotation rules. Removing small-first before
layout deduplication avoids dropping an old candidate that shares its layout.
The benchmark compares the best **complete** candidate from each search; a
partial order never receives a savings figure.

Allocated SF = sum of roll width × furthest used length, divided by 144 for
inch inputs. Allocated SYD = allocated SF / 9. Waste SF = allocated SF minus
placed cut area. Unused full-width tails are excluded from waste. All fixture
allowances and pattern repeats are zero; all cuts specify lot A, no rotation.

Run from `flooring/carpet-cut-planner`:

```sh
npm install --no-audit --no-fund
npm test -- material-benchmark.test.ts
```

## Fixed orders

One lot-A roll, 12 × 100 ft. Piece dimensions are width × length in feet,
listed in input order. Source: `materialFixtures` in `material-benchmark.ts`.

| Order | Pieces | Old allocated SF / SYD | Small-first SF / SYD | Selected SF / SYD | Waste SF old → selected |
| --- | --- | --- | --- | --- | --- |
| Improvement | 11×10, 2×6, 8×10, 4×16, 6×16, 5×16 | 624 / 69.333333 | 576 / 64 | 576 / 64 | 182 → 134 |
| Tie | 6×10, 6×10 | 120 / 13.333333 | 120 / 13.333333 | 120 / 13.333333 | 0 → 0 |
| Small-first loses | 6×10, 6×5 | 120 / 13.333333 | 180 / 20 | 120 / 13.333333 | 30 → 30 |
| Impossible | 13×10 | Incomplete | Incomplete | Incomplete | Not a savings comparison |

The improvement order has 442 SF of cuts. Used length drops from 52 to 48 ft;
allocated material and geometric waste each drop by 48 SF (5.333333 SYD).
The losing order has small-first waste of 90 SF, so retaining old candidates
matters. This is evidence for testing another heuristic, not global optimality.

Load `examples/small-first-win.json` through **Load project JSON** to reproduce
that order in the UI. The candidate table shows allocated SF, allocated SYD and
waste SF; an end-to-end test checks the displayed values and selected strategy.

## Fixed-seed corpus

The test contains the exact LCG generator (seed 980), dimensions, lot selection,
priority distribution and rotation flags. These are synthetic stress inputs,
not a representative distribution of customer jobs. In 1,000 orders:

- 470 complete in both searches: 4 improve, 466 tie, 0 regress.
- 530 have no complete plan in either search; no completion gains observed.
- Across the 470 comparable orders: allocated SF 170,584 → 170,423;
  allocated SYD 18,953.777778 → 18,935.888889.
- Total allocated and waste reduction: 161 SF (17.888889 SYD). Cut demand is
  unchanged on complete orders. No savings claim is made for incomplete orders.

Tests also verify bounds, no overlaps, dye-lot isolation, permitted orientations
and area accounting. Exact fixture expectations prevent a shared comparator
change from silently turning the benchmark into a no-op. The corpus regression
checks the old feasible search is never replaced by an incomplete or higher-area
result. It provides finite regression evidence, not an optimality proof.

## Remaining field acceptance

No merge or production deployment is authorized by this report. Follow
`RELEASE_CANDIDATE_CHECKLIST.md` and record evidence using
`FIELD_ACCEPTANCE_TEMPLATE.md`: three independently measured real jobs (including
mixed widths/lots), installer review of direction/rotation/allowances/seams and
pattern phase, physical stock condition, paper/PDF legibility and page breaks,
iPhone Safari/desktop interactions and accessibility. Synthetic comparisons do
not replace these checks or authorize cutting.
