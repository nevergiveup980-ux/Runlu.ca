# E052 — Fairness Denominator Policy

## Rule 1 — Never report "fairness" without naming the denominator
Examples:
- equal raw service count;
- service per eligible demand;
- service per eligible opportunity.

These are different objectives.

## Rule 2 — Eligibility must be defined before counting it
A task that could not legally/safely/operationally receive the resource should not silently enter an "eligible opportunity" denominator.

## Rule 3 — The accounting window is part of semantics
A 10-minute fairness balance and a shift-long fairness balance can imply different actions.

Therefore a future operational state must bind:
- objective version;
- denominator definition;
- accounting-window definition.

## Rule 4 — Do not infer normative fairness
E052 shows mathematical non-equivalence between definitions. It does not decide which fairness definition Warehouse OS ought to use.

## Next drill — E053
Attack the accounting window.

Compare:
- fixed rolling window;
- exponentially decayed history;
- cumulative-since-session state.

Construct histories where the same current demand/opportunity ratios yield different fairness debt depending on horizon.

Question: how much history should fairness remember before old imbalance stops affecting current allocation?
