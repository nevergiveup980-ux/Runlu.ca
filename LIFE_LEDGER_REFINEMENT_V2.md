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
- Months run horizontally across the top on desktop.
- Common recurring categories may use repeated subrows.
- Groceries / shopping should support W1–W5 style rows.
- Fuel should support W1–W5 style rows.
- Direct cell editing is allowed.
- A blank cell may become a new record.
- Clearing a cell removes that cell-derived record only after a clear, reversible user action in the production app.
- Historical records remain intact when an item is renamed or archived.

## Mobile Sheet View decision
The iPhone version must not simply shrink the 12-month desktop spreadsheet. It keeps the spreadsheet mental model but changes the interaction:

- Show **one focused month at a time** with large previous / next month controls.
- Keep item names permanently visible; do not require horizontal scrolling just to discover what a value belongs to.
- Each amount cell is a generous tap target.
- Tapping a cell opens a bottom editor with three explicit actions:
  1. **Replace total** — set the cell to a chosen amount.
  2. **+ Add to current** — add the newly entered amount to the existing monthly amount without requiring mental arithmetic.
  3. **Clear this cell** — explicit destructive action, protected in production.
- `+ Add to current` should create or preserve a real underlying activity entry so Entries View can still show the history behind the monthly result.
- The focused-month screen shows Income, Expenses, and Balance above the sheet rows and refreshes immediately after an edit.
- The desktop version retains the familiar 12-month cross-sheet layout.

### Flexible grocery / recurring-entry rule
Recurring shopping is deliberately user-controlled rather than forced into one bookkeeping style.

**Detailed mode**
- Groceries W1–W5 stay as separate rows.
- Fuel W1–W5 stay as separate rows.
- This is best when the user wants to see weekly rhythm.

**Running-total mode**
- The same group may be displayed as one monthly total row.
- `+ Add to current` lets the user enter only the new shopping amount; the app handles the accumulation.
- The user does not need to manually add the previous total, although direct replacement remains available for people who prefer spreadsheet-style control.
- Switching display mode must not duplicate or lose data; it changes presentation, not the source of truth.

This flexibility is a product feature, not an exception. The app should never force users to record more detail than they want.

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
- Prove focused-month mobile Sheet View, tap-cell editing, Replace / + Add / Clear, and detailed-vs-running recurring rows.

### Pass 2 — current app transplant
- Map the existing current-app data model to the dual-view model.
- Preserve existing records and local storage keys.
- Add migration safety and export-before-migration.
- Add editable Sheet View without changing stable records.
- Ensure mobile `+ Add` writes an underlying activity record rather than silently flattening history.

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

## Prototypes
- `life-ledger-refine-v2.html` — full app interaction prototype.
- `life-ledger-mobile-sheet-lab.html` — focused iPhone Sheet View interaction lab.

Both prototypes intentionally use fictional sample values only. Their purpose is interaction and layout validation, not production data storage.