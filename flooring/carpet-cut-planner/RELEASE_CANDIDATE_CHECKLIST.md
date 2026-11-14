# RUNLU Carpet Cut & Waste Planner — Release Candidate Gate

Status: **NOT RELEASED**. Development branch only. A passing CI run is necessary, not sufficient.

## Supported MVP scope
- Rectangular carpet pieces, rectangular roll inventory, dimensions in feet at the UI and inches internally.
- Dye-lot matching; optional 90-degree rotation only when explicitly enabled.
- Per-piece cutting allowances and longitudinal pattern-repeat rounding are planning inputs, **not** verified seam matching.
- Candidate guillotine layouts; heuristics only, **not** mathematically optimal nesting.
- Roll utilization and remaining tail estimates, SF/SYD/LF metrics, JSON save/load, printable cutting sketch.

## Explicit exclusions / safety limits
- No automatic seam placement, seam direction validation, pattern matching across seams, stair/irregular room geometry, nap/shade validation, or site-measurement verification.
- No authenticated sign-off. The five local checklist confirmations and reviewer text are self-reported and do not constitute installer approval.
- A feasible software layout does **not** authorize cutting. Confirm dimensions, dye lots, roll condition, direction, seam allowances, installation requirements and installer approval onsite.
- Waste estimates are geometric allocations, not a guarantee of realized material savings or optimality.

## Automated gate (must be green at release SHA)
- [x] Unit tests: engine, browser adapter, scenarios. (GitHub Actions green at bbf3272)
- [x] Browser tests: inputs, warnings, candidate selection, mobile viewport, print review, stale-review invalidation, JSON reload. (GitHub Actions green at bbf3272)
- [x] Site integrity workflow. (GitHub Actions green at bbf3272)
- [x] Automated regression coverage for incomplete plans, dye-lot isolation and non-overlap; independent real-job verification still pending.

## Manual gate (must be signed off before merge/deploy)
- [ ] Validate three real jobs against independently measured cut sheets, including a mixed-width / mixed-dye-lot job.
- [ ] Review cut direction, rotation and allowances with an experienced installer.
- [ ] Verify paper/PDF print: every roll diagram, readable dimensions, page breaks, review sheet and incomplete-job warning.
- [ ] Verify iPhone Safari and desktop browser: add/edit/delete roll/piece, horizontal table scroll, save/load JSON, calculation and print.
- [ ] Check accessibility: labels, keyboard navigation, warning contrast, screen reader reading order.
- [ ] Confirm product copy explicitly states limitations and no cutting authorization.
- [ ] Record reviewer, date, test device, example job IDs, defects and disposition.

## Release decision
Do **not** merge into production until all manual gates are documented and blocking defects are resolved. Roll back by reverting the release commit if production behavior diverges from acceptance results.

## Verified automated baseline
- Commit: `bbf3272d6b0a85ff87946477b483d3fd86803539`.
- Carpet Planner Checks: https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/41971067807 — success.
- Site integrity: https://github.com/nevergiveup980-ux/Runlu.ca/actions/runs/41971067819 — success.
- These checks do not satisfy the manual gates above; **release remains blocked**.
