# E033 — Exact Dynamic Aging Result

For the stationary two-state process:

p_change(t)
= pi_LOW * P(HIGH at t | LOW at 0)
+ pi_HIGH * P(LOW at t | HIGH at 0)

Substitution gives:

p_change(t)
= 2 pi_LOW pi_HIGH (1 - exp(-(alpha+beta)t))

or equivalently:

**p_change(t) = [2 alpha beta / (alpha+beta)^2] [1 - exp(-(alpha+beta)t)].**

Under the E032 symmetric decision-value approximation:

**regret(t) = p_change(t)/4**

so

**regret(t) = [alpha beta / (2(alpha+beta)^2)] [1 - exp(-(alpha+beta)t)].**

## Symmetric special case
If alpha=beta=lambda:

p_change(t) = (1/2)(1-exp(-2 lambda t))

regret(t) = (1/8)(1-exp(-2 lambda t)).

Thus information value decays exponentially toward a stationary floor/ceiling determined by the queue process rather than becoming worthless at an arbitrary fixed age.

## Important correction to naive TTL thinking
An old binary report does not necessarily converge to the E031 zero-information regret of 1/4 under this stationary Markov model. In the symmetric case it converges to regret 1/8 under the E032 decision rule, because even a statistically independent old report can interact with the receiver's current local state and tie-break structure in a way that differs from the fixed-role baseline.

Therefore E032's p=1 endpoint should not be interpreted as the generic infinite-age limit of a realistic mixing process. E033 supplies the proper dynamic limit.
