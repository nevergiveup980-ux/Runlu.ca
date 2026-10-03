# E034 — Structural Result

## Same age, different value
Under a fixed regime z with rates alpha_z,beta_z, E033 gives:

p_change(t | z)
= [2 alpha_z beta_z/(alpha_z+beta_z)^2]
  [1-exp(-(alpha_z+beta_z)t)].

Therefore two reports with identical age t can have different probabilities of still representing current queue state.

So:

**age alone is not a sufficient statistic for decision value when queue dynamics are nonstationary.**

## Regime-boundary problem
If the traffic regime changes during the report's lifetime, a single exponential based on the initial or final regime is generally incorrect. The transition probability depends on the path of the time-varying generator.

For a piecewise-constant path, the state distribution propagates through each regime segment in sequence. A report that is 5 seconds old with 4 seconds QUIET + 1 second SURGE need not have the same value as one with 1 second QUIET + 4 seconds SURGE.

## Consequence
A universal TTL derived from long-run average traffic can be systematically misleading:
- too long during a surge;
- unnecessarily short during quiet operation.

E033 remains valid for its stationary model, but its TTL must not be exported unchanged to bursty operation.
