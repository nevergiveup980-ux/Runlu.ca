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

## Dual-view mental model
The user should understand the difference without reading documentation:

- **Entries = Show me what happened.** Every transaction is visible as an individual record.
- **Sheet View = Show me the month laid out.** Recurring items and totals are visible in a familiar grid-like structure.
- **Both are editors.** Neither view is a read-only report.
- Switching views changes presentation, not the underlying ledger.
- The app remembers the user's last preferred Ledger view, but never hides the alternate view.
- A short contextual sentence should change with the selected view so a first-time user immediately understands what each mode is for.
- Avoid technical labels such as “database view,” “transaction mode,” or “pivot.” Use plain language: Entries and Sheet View.

### Dual-view interaction lab
`life-ledger-dual-view-lab.html`

The lab proves the product promise with fictional sample data: edit an individual transaction in Entries, then see the Sheet total change; edit or add to a Sheet cell, then see the underlying transaction list change.

## Sheet View rules
- Item labels run vertically on the left.
- Months run horizontally across the top on desktop.
- On iPhone, focus on one month at a time rather than squeezing twelve months onto the screen.
- Common recurring categories may use repeated subrows.
- Groceries / shopping should support W1–W5 style rows.
- Fuel should support W1–W5 style rows.
- Direct cell editing is allowed.
- A blank cell may become a new record.
- Mobile cell editing should offer three explicit actions when useful: Set visible total, Add amount, Clear visible total safely.
- “Add amount” must create a normal underlying transaction so Entries remains fully traceable.
- “Set visible total” must not silently overwrite or delete earlier transactions. It records only the difference between the current total and the requested total as a traceable adjustment.
- “Clear visible total” follows the same correction rule: earlier records remain, and a reversal adjustment brings the visible Sheet cell to zero.
- Every destructive-looking Sheet action should offer an immediate Undo path.
- Historical records remain intact when an item is renamed or archived.
- Optional recurring-category presentation may switch between W1–W5 detail and one running monthly total without duplicating underlying data.

### Traceable Sheet editing semantics
The Sheet should feel like a simple spreadsheet while the underlying ledger behaves like a reliable record system.

1. **Add amount**
   - User enters the new purchase amount, not a recalculated total.
   - A new normal transaction is created with date, note, category and account context.
   - For recurring weekly groups, the transaction can be assigned to W1–W5 from its date.

2. **Set visible total**
   - Example: current Grocery total is $311.10 and user wants the Sheet to show $350.00.
   - The app creates a +$38.90 correction record rather than rewriting earlier grocery transactions.
   - If the requested total is lower, the correction is negative.
   - Entries View describes this plainly as a Sheet adjustment or correction.

3. **Clear visible total safely**
   - Clearing does not erase the history.
   - The app creates a reversal equal to the current visible total, bringing the cell to zero while retaining the earlier entries.
   - The user sees a confirmation and can Undo immediately.

4. **Running total vs W1–W5**
   - These are presentation choices over the same records.
   - In running-total mode, the Sheet sums all grocery records for the month.
   - In W1–W5 mode, those same records are grouped by the week bucket derived from their date.
   - Changing presentation never changes the records.

5. **Auditability without accounting jargon**
   - The interface says “Added from Sheet,” “Sheet adjustment,” or “Corrected total,” not debit/credit language.
   - The user can always answer: what changed, when, and why.

### Sheet audit interaction lab
`life-ledger-sheet-audit-lab.html`

This lab proves that Add, Set Total, Clear and Undo can preserve the Entries history while keeping the Sheet interaction simple.

### Mobile Sheet interaction lab
`life-ledger-mobile-sheet-lab.html`

The mobile lab tests one-month focus, fixed readable item labels, large touch targets, W1–W5 / running-total presentation, and Set Total / Add / Clear editing actions.

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
- Prove that first-time users can understand Entries vs Sheet View without instructions.
- Prove that Sheet Add / Set Total / Clear / Undo can remain traceable without feeling like accounting software.

### Pass 2 — current app transplant
- Map the existing current-app data model to the dual-view model.
- Preserve existing records and local storage keys.
- Add migration safety and export-before-migration.
- Add editable Sheet View without changing stable records.
- Keep a single authoritative transaction model underneath both views.
- Represent Sheet total corrections as explicit adjustment records rather than destructive rewrites.

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