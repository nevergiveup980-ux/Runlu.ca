# RUNLU Life Ledger · App Store Polish Plan

Lead staging build: `life-ledger-appstore-candidate-v2-3.html`

## Store-facing product promise
**One ledger. Two views. Both editable.**

Supporting line:
**Spreadsheet freedom. Without spreadsheet work.**

Do not market the app as accounting software, tax software, bank aggregation, or AI finance. The product should feel like a clear personal ledger with unusually flexible editing.

## First-run experience
The first-run guide must teach the product in one screen, not a tutorial carousel:
- Entries = see every transaction.
- Sheet View = see the month laid out.
- Charts = understand where money moved.
- Both views edit the same data.

Two exits are enough: `Start with Sheet View` and `Start on Home`.

## App Store screenshot sequence
The staging page supports deterministic fictional-data states with `?shot=1` through `?shot=5`. Screenshot mode hides the staging badge.

### Screenshot 1 — Home
Headline: **See your month at a glance.**
Supporting copy: `Balance, income, expenses, and spending — without a dashboard maze.`
State: `?shot=1`

### Screenshot 2 — Entries
Headline: **Every transaction stays easy to edit.**
Supporting copy: `Search, review, and change the records behind your totals.`
State: `?shot=2`

### Screenshot 3 — Sheet View
Headline: **One ledger. Two views. Both editable.**
Supporting copy: `Use W1–W5 detail or one running total. Your ledger, your way.`
State: `?shot=3`

### Screenshot 4 — Quick Add
Headline: **Add a record in seconds.**
Supporting copy: `Amount first. Familiar items rise to the top.`
State: `?shot=4`

### Screenshot 5 — Privacy / control
Headline: **Your ledger stays under your control.**
Supporting copy: `No bank connection. Portable CSV and JSON exports.`
State: `?shot=5`

## Polish rules now implemented in V2.3
- 44px-or-larger primary touch targets.
- visible keyboard focus states.
- iPhone safe-area handling.
- 390px narrow-screen pass.
- `prefers-reduced-motion` support.
- first-run guide.
- empty states instead of blank panels.
- entry search.
- frequent-item ordering for Quick Add suggestions.
- last Ledger view preference.
- recurring Sheet mode preference.
- read-only treatment for traceable adjustment rows.
- isolated fictional storage key.
- deterministic App Store screenshot states.

## Before real release
1. Finalize app name only after current App Store naming/conflict research.
2. Replace staging/sample language with production privacy language.
3. Connect only after current private schema is read-only inventoried and migration is reconciled.
4. Test on the smallest supported iPhone and a current large iPhone.
5. Test desktop Sheet on Mac Safari and Chrome.
6. Verify VoiceOver labels and Dynamic Type behavior in the native wrapper/build.
7. Re-run canonical Core tests after every financial-math change.
8. Capture final screenshots only from fictional/demo data.

## Product discipline
Do not add features merely to fill the Settings page or screenshot count. If a feature does not make recording faster, viewing clearer, or editing freer, it should wait.