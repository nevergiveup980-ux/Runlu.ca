# RUNLU Life Ledger · Canonical Transaction Core V2.1

## Why this core exists

During migration-safety review, the first integrated Candidate V2 prototype exposed an important accounting-semantics bug in its Sheet correction experiment: lowering an Expense total was represented by creating an Income record, and clearing an Expense cell used an Income reversal. That makes the Sheet visible total look right but incorrectly inflates Income statistics.

That prototype remains a UI staging artifact only. Its correction logic must **not** be used for real data.

`life-ledger-core-v2.js` replaces that experiment with a canonical data rule.

## Canonical rule

A record never changes economic type merely to correct a visible total.

- A correction to an **Expense** remains an Expense.
- A correction to **Income** remains Income.
- A normal record stores a positive `amount`.
- A Sheet correction additionally stores signed `adjustmentDelta`.
- `adjustmentDelta > 0` increases that same type's visible total.
- `adjustmentDelta < 0` decreases that same type's visible total.

Example:

Current Grocery Expense = $311.10.

User sets the visible total to $350.00:
- type = Expense
- amount = 38.90
- adjustmentDelta = +38.90
- source = Sheet adjustment

User later sets Grocery to $300.00:
- type = Expense
- amount = 50.00
- adjustmentDelta = -50.00
- source = Sheet adjustment

Income remains unchanged in both cases.

## Core functions

`life-ledger-core-v2.js` exposes `window.RUNLU_LEDGER_CORE` with:

- `effectAmount(record)`
- `cashEffect(record)`
- `totals(entries, prefix)`
- `itemTotal(entries, {item, year, month})`
- `categoryTotals(entries, prefix)`
- `addNormal(entries, input)`
- `adjustVisibleTotal(entries, input)`
- `clearVisibleTotal(entries, input)`
- `undo(entries, token)`
- `weekBucket(date)`
- `recurringPresentation(entries, options)`
- `validate(entries)`
- `exportCanonical(entries)`

The core is intentionally DOM-independent so migration tests and the final UI can use exactly the same transaction math.

## Required invariants

1. Sheet correction must not fabricate Income or Expense of the opposite type.
2. Clearing an Expense must not increase Income.
3. Clearing Income must not increase Expense.
4. Running-total Grocery must equal W1–W5 Grocery summed from the same records.
5. Undo must restore the exact pre-action dataset.
6. Transfers are net-neutral in Income / Expense totals.
7. Normal records remain positive amounts; signed correction behavior is explicit in `adjustmentDelta`.
8. Candidate / migration code must use the shared core rather than duplicate financial math in UI functions.

## Self-test page

`life-ledger-core-tests.html`

The self-test covers:
- base Income / Expense / Balance;
- increasing an Expense total;
- decreasing an Expense total;
- clearing an Expense without inflating Income;
- Undo restoration;
- W1–W5 vs running-total consistency;
- clearing Income without fabricating Expense;
- canonical record validation.

## Integration status

The original `life-ledger-candidate-v2.html` is retained as a layout / interaction staging artifact, but its original Sheet-adjustment math is now superseded.

The next integrated candidate must import `life-ledger-core-v2.js` and delete its duplicate Sheet / total math before it can be considered migration-ready.