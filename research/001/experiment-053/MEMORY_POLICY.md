# E053 — Fairness Memory Policy

A fairness value is incomplete unless it binds all of:
- denominator semantics;
- accounting-window / decay semantics;
- objective version;
- session or lifecycle identity when applicable.

Do not compare fairness debt computed under different horizons as if it were the same quantity.

## Engineering preference
If an operational objective has a natural boundary (shift, batch, dispatch wave, session), test that boundary before inventing a statistical decay constant.

If no natural boundary exists, a decay rule may be considered, but its half-life is a policy parameter requiring sensitivity analysis.

## Safety boundary
Fairness debt remains an efficiency/allocation signal only. It cannot override a safety veto or make an unsafe action admissible.

## Next drill — E054
Attack horizon sensitivity systematically.

For a fixed history, sweep:
- rolling window W;
- exponential half-life H.

Locate action-flip boundaries and quantify how close the selected policy is to a horizon-induced reversal.

Question: can we report a **horizon robustness interval** rather than a single arbitrary memory parameter?
