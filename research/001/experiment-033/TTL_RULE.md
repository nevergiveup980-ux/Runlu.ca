# E033 — From Value Budget to TTL

A defensible TTL should start from an allowed decision-regret budget R_max, not from an arbitrary number of seconds.

Let:
K = alpha beta / [2(alpha+beta)^2]
r = alpha+beta.

E033 gives:
R(t)=K(1-exp(-rt)).

If 0 < R_max < K, the maximum age satisfying R(t) <= R_max is:

**t_max = -(1/r) ln(1 - R_max/K).**

If R_max >= K, this coarse model alone imposes no finite TTL from queue-choice regret because even fully mixed information remains below that budget.

## Engineering meaning
TTL depends on:
- state transition rates alpha and beta;
- the tolerated decision-regret budget;
- the chosen state abstraction and decision rule.

It cannot be universal.

## Next falsification
E034 should challenge the Markov assumption with bursty/nonstationary arrivals and threshold crossings. Warehouse work often arrives in batches, so exponential memorylessness may overstate or understate useful lifetime.
