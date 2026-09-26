# E063 — Claim Scope Result

The current methodology fixture passes the analytic-to-synthetic edge:
- executable reproduction exists;
- the synthetic scenario and declared model correspond.

It does not pass the synthetic-to-observational edge because no representative real warehouse dataset has yet established:
- telemetry semantics;
- sampling/coverage adequacy;
- uncertainty on representative observations.

Therefore the highest supported scope in this fixture is:

L1 SYNTHETIC

The following scope jump is explicitly forbidden:

L1 SYNTHETIC -> L3 OPERATIONAL

and especially:

L1 SYNTHETIC -> L4 PRODUCTION SAFETY.

## What may be said
"The synthetic audit shows that duplicate parameterizations of one structural model should not be counted as independent confirmations."

## What may not yet be said
"This proves the warehouse should use this fairness-memory policy."

or

"This policy is safe for production control."

Those broader statements require their own evidence edges.
