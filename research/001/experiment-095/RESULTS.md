# E095 — Provenance-Cluster Evidence Census Result

E095 holds the raw observer count fixed at 20 and changes only the declared provenance partition.

P20:
RAW_OBSERVER_COUNT = 20
UNIQUE_CRITICAL_ROOT_COUNT = 20

P3, with clusters 10 + 7 + 3:
RAW_OBSERVER_COUNT = 20
UNIQUE_CRITICAL_ROOT_COUNT = 3

P2, with clusters 17 + 3:
RAW_OBSERVER_COUNT = 20
UNIQUE_CRITICAL_ROOT_COUNT = 2

P1, with one shared root:
RAW_OBSERVER_COUNT = 20
UNIQUE_CRITICAL_ROOT_COUNT = 1

Thus the declared root-count range is 1 to 20 while the visible observer count never changes.

## Core result

Raw observer multiplicity can dramatically overstate provenance diversity.

However, UNIQUE_CRITICAL_ROOT_COUNT is not an "effective N," probability of correctness, confidence level, or evidence weight. One root can contain excellent evidence and twenty roots can all be wrong.

The count is a dependency diagnostic only.

## Scope

Synthetic governance fixture. The alternative partitions are deliberately constructed assumptions, not estimates of any real warehouse observer structure.
