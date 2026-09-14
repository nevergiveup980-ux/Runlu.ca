# RUNLU Life Ledger · Candidate V2 Integration Checklist

Status: integrated prototype only. Do not merge to production until the production-data and device-testing gates below are complete.

## What Candidate V2 now combines
- Home with month balance, Income, Expenses and recent activity.
- Home category bars answering “Where the money went”.
- Optional monthly Income vs Expenses flow chart.
- Direct Home links to Entries and Sheet View.
- Quick Add with amount-first flow and frequent-item shortcuts.
- Entries View with direct record editing.
- Sheet View over the same underlying records.
- Desktop 12-month Sheet presentation.
- Mobile focused-month Sheet presentation.
- Sheet “Add amount” action that creates a normal underlying transaction.
- Sheet “Set visible total” action that creates only a traceable difference adjustment.
- Sheet “Clear visible total safely” action that creates a reversal rather than erasing history.
- Undo for the last Sheet-generated change in the prototype session.
- Category-bar drill-down into contributing Entries.
- Trends page with simple Income vs Expenses bars.
- Familiar Home / Add / Ledger / Trends / Settings navigation.

## Product promise now represented in one flow
**One ledger. Two views. Both editable.**

Entries answers: **What happened?**

Sheet View answers: **How is the month laid out?**

Home answers: **How is this month going?**

Trends answers: **How is it changing over time?**

All are presentations of one authoritative transaction model.

## Deliberately not production-ready yet
The candidate uses an isolated fictional-data localStorage key and must not be wired directly to the current private Life Ledger dataset yet.

Before any production transplant:
1. inventory the current Life Ledger storage keys and record schema;
2. export a complete safety backup from the current app;
3. write a non-destructive migration mapper;
4. test migration against a copy, never the only real ledger;
5. verify totals before and after migration for every month and year;
6. verify item rename/archive behavior against historical records;
7. verify CSV export after migration;
8. verify backup / restore and any encrypted sync path;
9. verify correction records do not distort Income / Expense summaries;
10. confirm Transfers remain excluded from Income / Expense net calculations unless explicitly intended.

## Device gate
Test on at least:
- current iPhone portrait;
- iPhone landscape for Sheet View;
- Mac / desktop browser at common width;
- narrow mobile browser with software keyboard open.

Check:
- bottom navigation is never covered;
- Sheet item labels remain readable;
- amount editor remains reachable with keyboard open;
- Add / Set Total / Clear are not easy to tap accidentally;
- Undo appears immediately after a Sheet correction;
- horizontal desktop Sheet scrolling keeps item labels understandable;
- chart bars and amounts remain legible with larger accessibility text.

## Data semantics gate
### Normal entry
Creates one transaction.

### Add amount from Sheet
Creates one normal transaction with source metadata such as `Added from Sheet`.

### Set visible total
Creates a correction for only the difference between the current computed total and requested visible total. Earlier entries remain unchanged.

### Clear visible total
Creates a reversal equal to the computed total. Earlier entries remain unchanged.

### Undo
Production implementation should not depend only on volatile in-memory state. Undo should have a safe persisted mechanism or a clear reversal action.

## Still to refine before App Store work
- final product name: Life Ledger vs a safer distinct App Store name;
- icon and brand lockup;
- first-run onboarding limited to one or two screens at most;
- empty-state behavior;
- category/item management;
- search and simple filters;
- CSV export UI;
- backup / restore UI;
- accessibility labels and Dynamic Type behavior;
- App Store screenshots and metadata.

## Screenshot sequence emerging from the product
1. **See your month at a glance.** — Home, Balance + category bars.
2. **One ledger. Two views. Both editable.** — Entries and Sheet View.
3. **Track it your way.** — weekly detail or running-total Sheet behavior.
4. **Add without doing the math.** — `+ Add amount` on a Sheet cell.
5. **See where the money goes. Instantly.** — category bars and drill-down.

## Merge rule
This branch remains a design / interaction staging area until real-data migration has been separately reviewed and backed up. A visually successful prototype is not sufficient reason to merge it into the current private ledger.