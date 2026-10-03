# E042 — Control-State Consequence

A reconfiguration controller needs more than:
- current workload class;
- current codebook.

Its decision state may need:
- regime age / time since detection;
- scheduled endpoint if one exists;
- duration-model class or context;
- current-vs-target regret gap DeltaR;
- switching/version cost;
- uncertainty margin.

This produces the generic rule:

**Switch when expected cumulative decision-regret reduction over the conditional residual regime lifetime exceeds trusted transition cost.**

## Important simplification
If a robust static codebook already keeps regret below the declared budget, the controller can avoid duration forecasting entirely and remain static. Forecasting has value only when the expected gain from adaptation is operationally meaningful.

## Next drill — E043
Ask whether adaptation is worth its own complexity.

Compare:
1. robust static codebook;
2. oracle adaptive upper bound;
3. realistic adaptive controller with detection delay, estimation error, version-switch cost and safe-fallback transition interval.

The quantity of interest becomes **net value of adaptation**, not theoretical oracle improvement.
