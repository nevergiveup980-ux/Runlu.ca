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
