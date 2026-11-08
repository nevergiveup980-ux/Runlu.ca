# Life Ledger · App Store Candidate QA Gate

Target: `life-ledger-appstore-candidate-v2-3.html`
Core: `life-ledger-core-v2.js`

## Blockers
Any failure below blocks production connection or App Store submission of this build.

### Financial integrity
- Income totals do not change when an Expense total is reduced or cleared.
- Expense totals do not change when an Income total is reduced or cleared.
- W1–W5 edits affect only the selected week.
- Running total equals the sum of W1–W5 for the same recurring item/month.
- Undo removes only the record created by the last Sheet action.
- Category bars equal the canonical monthly Expense totals by category.
- Home Balance = Income − Expenses from the same canonical record set.

### Dual-view integrity
- Add in Quick Add appears immediately in Entries and Sheet View.
- Edit a normal Entries record and Sheet View changes immediately.
- Add from Sheet creates a normal traceable record in Entries.
- Set Visible Total creates a traceable adjustment; prior records are retained.
- Clear Visible Total creates a traceable reversal; prior records are retained.
- Adjustment rows are read-only in Entries in the candidate UI.

### Data safety
- Candidate uses only `runlu-life-ledger-appstore-candidate-v2-3-sample` plus its preference key.
- Candidate never reads or writes unknown/private legacy keys.
- Export contains only the isolated candidate records.
- Reset affects only candidate sample data.

## iPhone interaction pass
Test portrait first.

- Home fits without horizontal scrolling.
- Balance remains readable at 390px width.
- Bottom navigation remains reachable above the safe area.
- Quick Add focuses Amount first.
- Text fields do not cause clipped modal content when keyboard appears.
- Sheet month arrows have comfortable touch targets.
- Sheet value cells are comfortable to tap.
- W1–W5 / Running totals toggle is obvious and does not mutate data.
- Editor can be dismissed without losing existing data.
- Toasts do not cover the active bottom navigation target.

## Empty-state pass
Test after moving to a month with no sample records.

- Home shows a useful empty state, not zero-value visual clutter alone.
- Recent activity shows an Add action.
- Spending chart shows an Add action.
- Entries search with no match explains the result clearly.

## First-run pass
- First run shows one concise guide, not a multi-page tutorial.
- `Start with Sheet View` goes directly to Sheet View.
- `Start on Home` goes directly to Home.
- Guide does not show again after completion unless replayed from Settings.
- Screenshot mode bypasses the guide.

## App Store screenshot states
- `?shot=1` Home.
- `?shot=2` Entries.
- `?shot=3` Sheet View with W1–W5 detail.
- `?shot=4` Quick Add.
- `?shot=5` Settings/privacy/export.
- Staging badge is hidden in screenshot mode.
- All screenshots use fictional sample data only.

## Accessibility / resilience
- Keyboard focus is visible.
- Primary actions are at least 44px high.
- Reduced-motion preference removes nonessential transitions.
- Navigation has an accessible label.
- Toast uses a live status region.
- Dialog uses modal semantics.

## Release gate
Do not connect real data until:
1. current private storage schema is verified from source/read-only audit;
2. full backup exists;
3. migration is run on a copy;
4. month/category totals reconcile exactly;
5. iPhone and Mac tests pass;
6. current App Store naming review is complete.