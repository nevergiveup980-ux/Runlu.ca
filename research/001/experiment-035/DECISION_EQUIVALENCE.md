# E035 — Decision-Equivalent Freshness

Define the full-information decision at time t as D*(Q_A(t),Q_B(t)).

Let M_A,M_B be the received encoded reports and let D(M_A,M_B,context) be the decision using them.

The task-relevant error event is:

D(M_A,M_B,context) != D*(Q_A(t),Q_B(t)),

subject to a specified tie policy and cost model.

This yields a stronger freshness concept:

**Decision-equivalent freshness = probability the received information still supports the same admissible decision as current full information.**

It naturally includes both encoding resolution and aging.

## Research consequence
A message need not reproduce the world exactly. It only needs enough information to preserve the decision.

This creates a new optimization problem:

minimize communication payload
subject to
- safety invariant;
- bounded decision regret;
- bounded stale/encoding-induced decision mismatch;
- trust/freshness requirements.

## Next drill
E036 should compare 1-bit, 2-bit ordinal, and capped-count encodings under an explicit synthetic queue-cost/distribution model and construct a payload-versus-regret frontier. The model must be declared synthetic until calibrated data exist.
