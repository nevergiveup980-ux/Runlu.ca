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
