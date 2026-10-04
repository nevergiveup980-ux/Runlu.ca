# E101 — Transitive Model Ancestry Policy

Before treating specification roots as distinct model provenance:
- compute transitive ancestry, not only immediate parents;
- preserve ancestry depth;
- report the actual common ancestor;
- distinguish shared framework, loss, simulator, data, and mathematical-assumption ancestry where known;
- mark incomplete ancestry explicitly.

Statuses:
- TRANSITIVE_COMMON_ANCESTOR
- NO_DECLARED_COMMON_ANCESTOR
- ANCESTRY_INCOMPLETE

Never translate NO_DECLARED_COMMON_ANCESTOR into INDEPENDENT without a completeness argument.

Never translate a shared ancestor into equal dependence strength or automatic invalidity.

## E102
Ancestry depth sensitivity audit.

The apparent number of provenance families can depend on how far upward the graph is traversed. E102 should report diversity as a function of ancestry depth and test whether a claimed independence conclusion survives reasonable depth choices.
