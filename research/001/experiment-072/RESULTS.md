# E072 — Numeric Comparability Result

The fixture compares individually plausible percentage-reduction claims.

A vs B:
same metric, denominator, population, window, and SYNTHETIC scope.
Result: COMPARABLE.

A vs C:
same metric and scope, but C is SURGE-only while A is uniform iid 0–15.
Result: NOT_COMPARABLE because population differs.

A vs D:
D is OBSERVATIONAL and calendar-day based while A is SYNTHETIC and single-allocation based.
Result: NOT_COMPARABLE because scope, population, and window differ.

A vs E:
both are percentages, but E measures collision rate while A measures expected queue-choice regret.
Result: NOT_COMPARABLE because metric differs.

A vs F:
metric metadata are missing.
Result: REVIEW_REQUIRED rather than guessing.

## Core result
A shared unit is not a comparability license.

Two correct percentages can be invalid as a direct comparison when their metrics, denominators, populations, windows, or evidence scopes differ.

## Boundary
The fixture does not rank real warehouse policies and contains no new operational measurement.
