# RUNLU Carpet Planning Rules — Draft v0.1

Status: design-only, NOT connected to Planner, SmartRoll, Flooring OS or published Knowledge records.
Last reviewed: 2026-11-01

## Separation of concerns

- Knowledge records explain claims and cite their evidence.
- A rule catalog defines machine-readable inputs, constraints, and provenance.
- Planner computes feasible cuts using real dimensions and user-confirmed constraints.
- SmartRoll may later provide inventory, lot and roll data; no inventory assumptions are allowed in the calculation layer.

## Rule contract (proposed)

Each rule has: `id`, `version`, `status` (draft/reviewed/approved),
`knowledge_ids`, `scope` (residential/commercial/product-specific/universal),
`inputs`, `outputs`, `units`, `constraints`, `source_refs`,
`review` (technical, licensing, translation), and `effective_at`.

The calculator MUST only execute approved rules. Unknown constraints require
explicit user input or an "unable to determine" result, never a guessed default.

## Initial rule candidates

| ID | Rule | Constraint |
| --- | --- | --- |
| AREA-001 | SF to SYD | `syd = sf / 9` (area only; RK-0002) |
| ROLL-001 | Available roll width | Positive measured usable width, not nominal catalog width |
| CUT-001 | Cut feasibility | Piece dimensions, orientation and allowances must fit available roll width and remaining length |
| SEAM-001 | Seam/pile orientation | Do not rotate a piece where pile/pattern orientation prohibits it |
| PATTERN-001 | Pattern matching | Repeat dimensions and matching allowances are product-specific inputs |
| LOT-001 | Dye-lot compatibility | Do not combine incompatible lots unless explicitly allowed |
| WASTE-001 | Waste reporting | Distinguish geometric offcut, reserved allowances and unusable remnants |

## Test cases to implement before integration

1. 90 SF => 10 SYD exactly. 9 SYD => 81 SF.
2. 12 ft nominal width but 11.8 ft usable: 11.9 ft wide cut cannot fit without an approved seam.
3. Two cuts whose areas fit a roll but whose lengths exceed the roll length: reject.
4. Pile direction fixed: reject a layout that only fits by rotating a piece 90 degrees.
5. Pattern repeat missing: return "needs product specification", not zero pattern waste.
6. Incompatible dye lots: reject automatic allocation across lots.
7. Missing or zero/negative dimensions: validation error.
8. Waste breakdown: report material consumed, installed area, offcut and allowance separately; never equate area-only difference to reusable remnant.

## Publication and integration gates

- Cite precise technical sources and record applicable editions.
- Confirm manufacturer-specific rules before applying them.
- Do not reproduce copyrighted CRI text/tables; cite or link sources.
- Independent technical review and multilingual terminology review required.
- Add executable tests and a dry-run comparison against real measured jobs.
- Only then consider connecting rules to Planner or publishing explanatory records.

This file is a proposed engineering specification, not an installation instruction or a claim that the current products implement these rules.
