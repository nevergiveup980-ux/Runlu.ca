# RUNLU Carpet Cut & Waste Planner · Project B

Independent flooring cutting planner prototype. Separate from RUNLU KNOWLEDGE.

## Files
- `index.html`: dependency-free browser prototype; open locally to try it.
- `engine.ts`: reusable TypeScript rectangular-cut planning engine.
- `engine.test.ts`: baseline Vitest tests (requires a Vitest-enabled project).

## Current calculation contract
- Input dimensions in the browser are feet. Engine dimensions are inches.
- SF = square feet, SYD = SF / 9; LF is length per roll and must be interpreted with roll width.
- Greedy largest-area-first, guillotine split heuristic. **Not guaranteed optimal.**
- Dye lot matches required when a piece specifies one; otherwise the piece can be placed on any roll. For production use, enforce job-level dye lot assignment.
- Rotation is disabled unless explicitly allowed. User remains responsible for pile/nap direction.
- Allocated area is full roll width times furthest occupied length per roll. Waste in allocated area = allocated area minus cut area.
- Unused roll tails are shown separately, not counted as waste.
- When any piece is unplaced, the plan is incomplete and must not be used for ordering.

## Known gaps / release blockers
1. Browser prototype and TypeScript engine duplicate the heuristic; unify before shipping.
2. No seam layout, pattern repeat, installation allowances, irregular rooms, offcut reuse classification, or direction enforcement beyond the rotation flag.
3. No automated browser test or verified deployment yet.
4. PDF is currently browser Print/Save as PDF, not a dedicated downloadable PDF report.
5. Input JSON has schema checks but no comprehensive size limits / security hardening.
6. Algorithmic comparison against actual installer-verified jobs is outstanding.

## Acceptance scenarios
- Two 6ft x 10ft pieces fit side-by-side on 12ft wide roll.
- Different required dye lot must not be allocated to a mismatched roll.
- A 12ft-wide piece must not fit on a 10ft-wide roll unless rotation is explicitly permitted and geometrically feasible.
- Insufficient stock produces an explicit unplaced list.
- Importing invalid JSON must not erase the current valid project.
- Validate printable diagram and totals on mobile and desktop.

## Next milestone
Integrate a single shared engine into a buildable app, add fixture-based regression tests, real job allowances and a report schema. Keep changes on `feature/carpet-cut-planner-mvp` until acceptance.


## Product differentiation decision · 2026-10-25

RUNLU Field Calculator is an already-published field calculation app with a carpet module. Do **not** position this project as another basic room-area calculator.

**Project B focus:** professional multi-roll cutting optimization, stock/offcut utilization, dye-lot-safe allocation, multiple scenario comparison, and installer-ready cut lists.

**Reuse-first audit gate (mandatory before implementing overlapping modules):**
- Locate Field Calculator source and its carpet measurement, pattern repeat, seam, waste, visualization, and export modules.
- Locate SmartRoll / Flooring OS source and document roll inventory identifiers and integration contracts.
- Record for each capability: existing source path, license/ownership, suitability, required adapter, and regression fixtures.
- Avoid copying code until provenance and actual behavior are verified.

**Algorithm roadmap:**
1. Establish a single shared deterministic engine; remove browser/TypeScript duplication.
2. Model stock rolls and offcuts separately, with unique IDs, widths, lengths, dye lots, reservation status and usable remnants.
3. Generate multiple feasible plans (alternative piece orderings and placement strategies), deduplicate and rank them.
4. Rank by explicit objective: material purchase cost, stock consumption, waste, seam count, and constraints. Never label heuristic output globally optimal.
5. Add installer-confirmed pile direction, pattern matching, seam allowance and cut tolerances before production use.
6. Provide plan provenance and a cut list with source roll ID, start offset, cut size, direction, and remaining material.

**Release guardrail:** Current prototype is a demo, not a verified installation plan or sellable optimization product.

## Browser preview build

From `flooring/carpet-cut-planner`:

```sh
npm install
npm run typecheck
npm test
npm run build
```

Open `index.html` after the build; it loads `dist/browser.js` and uses the **same TypeScript engine** as the tests. The development branch CI is configured to upload `index.html` and `dist/browser.js` as the `carpet-planner-preview` artifact after successful checks.

The UI now shows candidate scenario summaries. The current SVG displays the highest-ranked candidate only. Do not publish the standalone HTML without its generated `dist/browser.js`. Deployment and browser acceptance remain unverified.

### Material comparison evidence

See [MATERIAL_COMPARISON.md](MATERIAL_COMPARISON.md) for full pre-small-first
baseline comparisons, fixed-seed corpus results and reproduction instructions.
Load `examples/small-first-win.json` to inspect the synthetic improvement case;
candidate rows now report allocated SF and SYD alongside waste SF. Results are
finite heuristic comparisons, not verified real-job savings or global optima.

## CSV order import and field comparison (2026-11-09)

Use **Import order CSV** above the roll editor. Download the two header templates,
fill one row per roll/piece, then select **both** files and preview. The complete
files are validated before any order data changes; **Replace order with preview**
replaces both inventories atomically, recalculates and clears previous reviews
and trial records. Job reference, reviewer and current cut allowances are retained;
check those settings before applying. Notes columns are accepted but discarded.
Files stay in the browser; import does not write to inventory or a database.

Required headers:
- Rolls: `roll_id,stock_type,width_ft,available_length_ft,dye_lot`
- Pieces: `piece_id,width_ft,length_ft,dye_lot,allow_rotate`
- Optional column: `notes`

Headers are case-sensitive and may be reordered. Stock types: `FULL`, `SHORT`,
`REMNANT`. Rotation: explicit `true` or `false` (case-insensitive); blanks are rejected.
Dimensions must be positive decimal feet, with a decimal point (no unit suffix,
thousands separator or scientific notation). IDs must be unique within each file.
Roll dye lot is required. Blank piece lot remains unconstrained and produces a
warning; require a common lot explicitly on every relevant piece. UTF-8 BOM,
CRLF/LF, commas inside quoted fields, doubled quotes and multiline quoted notes
are supported. Unknown/duplicate headers, malformed quoting, wrong field counts,
empty datasets and invalid dimensions reject the entire import with a row/header
error. Limit: 1 MB and 1,000 data rows per file. Preview displays the first 20 rows;
validation covers all rows. CSV contents are treated as text, not formulas.

Layouts now show roll width and consumed length, top-left origin, X/Y direction,
numbered cut rectangles and a complete coordinate/dimension/orientation legend.
All cut dimensions include allowances. Tiny rectangles may omit their in-diagram
number; the legend and SVG title still include every cut. The diagram covers
allocated length only, excluding the unused full-width tail.

For a supervised real-order trial, enter job/reviewer, calculate, complete the
pre-cut checklist, then enter independently expected and actually consumed LF for
**each** roll (including zero for unused rolls). Independently compare the complete
piece sheet, directions, lots and geometry, record issues, and compare. The result
is BLOCKED if required evidence/readings are absent or invalid, FAIL if any roll's
expected/actual length differs from plan by more than 0.01 LF, otherwise PASS.
This fixed comparison tolerance is not a physical cutting tolerance. PASS is a
self-reported comparison result, not installer approval or a release decision.
Export JSON for **all** statuses to retain inputs, selected strategy, placements,
UTC timestamp, build commit, local pre-cut evidence, raw readings and per-roll differences.
Changing inputs, reviewer, scenario or trial readings invalidates the previous
record. Recalculate before entering fresh readings. Project JSON deliberately
excludes trial records; archive the separate acceptance export. Printed review
includes the current trial comparison status when present.

No real customer order has been accepted through these automated synthetic tests.
Continue to use FIELD_ACCEPTANCE_TEMPLATE.md and all release checklist gates.
