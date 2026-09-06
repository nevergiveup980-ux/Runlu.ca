# RUNLU Life Ledger · Refinement V2

Status: working refinement branch. Stable public page and current private app remain untouched.

## Product sentence
A personal ledger that keeps the speed of a modern app and the freedom of a spreadsheet, with one dataset editable from either view.

## Non-negotiable product boundaries
- Preserve the familiar primary navigation: Home / Add / Ledger / Trends / Settings.
- No bank connection as a product requirement.
- Do not turn the product into bookkeeping or accounting software.
- Do not make AI the main selling point.
- Preserve CSV portability.
- Protect the privacy-first position and never use real financial data in public demos.
- Keep both mobile and desktop useful; mobile entry is the first priority.

## Differentiator
### One dataset, two editable views
1. **Entries View** — chronological transaction list, easy to search and edit.
2. **Sheet View** — spreadsheet-like month-by-month layout, directly editable cell by cell.

Edits from either view immediately update the same underlying record set. There is no duplicate ledger and no manual reconciliation step.

## Sheet View rules
- Item labels run vertically on the left.
- Months run horizontally across the top.
- Common recurring categories may use repeated subrows.
- Groceries / shopping should support W1–W5 style rows.
- Fuel should support W1–W5 style rows.
- Direct cell editing is allowed.
- A blank cell may become a new record.
- Clearing a cell removes that cell-derived record only after a clear, reversible user action in the production app.
- Historical records remain intact when an item is renamed or archived.

## Home
Home answers four questions immediately:
1. What is the current monthly balance?
2. How much income came in?
3. How much went out?
4. What changed recently?

Home should include one compact monthly/year rhythm visualization, not an analytics wall.

## Add
The fastest path is:
1. Amount
2. Item
3. Type / Category / Account
4. Date
5. Optional note
6. Save

Previously used items should become suggestions and frequent/recent choices should rise naturally.

## Trends
The first chart is a simple bar chart:
- monthly income vs expenses;
- clear labels;
- no decorative complexity;
- drill-down only after the overview is understandable.

Future optional drill-down may include category, merchant, annual comparison, debt payment, and net cash flow. These are secondary to the main bar view.

## Settings
Keep settings focused on:
- item library;
- CSV export;
- privacy;
- user-controlled backup / sync;
- app preferences.

## Design direction
- RUNLU dark header + restrained green accent.
- High contrast, generous touch targets.
- Avoid oversized cards when they lengthen daily entry unnecessarily.
- Keep labels visible; avoid icon-only ambiguity.
- Mobile bottom navigation remains persistent and familiar.
- Desktop gets more space for Sheet View without changing the information architecture.

## Implementation sequence
### Pass 1 — interaction proof
- Build a standalone prototype with fictional data.
- Prove list editing ↔ sheet editing synchronization.
- Prove mobile Add flow.
- Prove simple bar chart.

### Pass 2 — current app transplant
- Map the existing current-app data model to the dual-view model.
- Preserve existing records and local storage keys.
- Add migration safety and export-before-migration.
- Add editable Sheet View without changing stable records.

### Pass 3 — polish
- Search / filters.
- Better item suggestions.
- Category drill-down.
- Accessibility and keyboard behavior.
- iPhone layout / App Store screenshots.

### Pass 4 — release readiness
- Naming / App Store conflict review.
- Privacy wording.
- Offline and migration testing.
- Backup/restore testing.
- Final App Store metadata and screenshots.

## Prototype
`life-ledger-refine-v2.html`

The prototype intentionally uses fictional sample values only. Its purpose is interaction and layout validation, not production data storage.