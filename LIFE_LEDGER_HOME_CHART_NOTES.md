# RUNLU Life Ledger · Home + Chart Refinement

## Goal
Home should pass a three-second test. Before a new user taps anything, they should understand:

1. current monthly balance;
2. income;
3. expenses;
4. the largest places the money went.

The Home page is not a report center. It is a clear answer page.

## First-screen hierarchy
1. Month context.
2. Monthly balance as the strongest number.
3. Income and Expenses as the only two secondary numbers.
4. Two direct Ledger paths: Entries and Sheet View.
5. A simple spending bar view immediately below the hero.

Avoid adding extra KPI cards simply because space exists.

## Bar-chart hierarchy
### Default: Where the money went
Use horizontal category bars ordered from largest to smallest.

Why:
- category names remain readable on iPhone;
- the largest expense is obvious without reading every number;
- bar length communicates scale before the user reads the amount;
- tapping a bar can reveal the entries behind the total.

The default Home chart should answer a practical question, not display analytics for its own sake.

### Secondary: Monthly flow
A compact Income vs Expenses monthly bar rhythm may be available through a simple toggle. It should remain secondary to the category view on Home. The fuller historical exploration belongs in Trends.

## Traceability from chart to ledger
A category bar is not a dead graphic. Tapping it should reveal the records that produced the total.

This reinforces the product model:
- Home summarizes;
- Entries explains what happened;
- Sheet View lays the month out;
- Trends compares over time.

All four are different presentations of the same underlying ledger.

## Dual-view bridge on Home
Home should expose both Ledger paths without forcing the user through an intermediate menu:

- **Entries** — show me what happened.
- **Sheet View** — show me the month laid out.

This keeps the app's strongest differentiator visible from the first screen.

## Mobile rules
- Do not hide the balance below a decorative header.
- Keep balance, Income and Expenses above the fold on common iPhone sizes.
- Prefer two secondary metric blocks instead of three or four.
- Category bars must be large enough to tap comfortably.
- Show only the recent records necessary to establish confidence; the full list belongs in Entries.
- Keep the bottom Home / Add / Ledger / Trends / Settings navigation stable.

## App Store screenshot implication
The Home screen can support one of the first App Store screenshots because it communicates value without explanation:

**See your month at a glance.**

A later screenshot should then demonstrate the stronger differentiator:

**One ledger. Two views. Both editable.**

The bar chart should be real UI, not decorative marketing artwork.

## Interaction lab
`life-ledger-home-chart-lab.html`

The lab uses fictional sample data and tests:
- month navigation;
- balance / income / expense hierarchy;
- horizontal category bars;
- category-to-record drill-down;
- optional monthly Income vs Expenses flow;
- direct Entries / Sheet View paths;
- a restrained recent-activity section.

## Production boundary
Home must remain understandable even if the user never opens Trends. At the same time, Home should never expand into a dense financial dashboard. If a metric does not help answer “How is this month going?” quickly, it probably belongs elsewhere.