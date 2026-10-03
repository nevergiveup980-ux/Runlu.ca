# E100 — Model-Family Redundancy Policy

For model-family robustness claims, preserve both raw multiplicity and provenance-clustered multiplicity.

Required fields:
- model instance;
- specification root;
- variant relation;
- verdict;
- root-level verdict consistency;
- provenance completeness status.

Do not:
- count parameter sweeps as independent model confirmations;
- count reparameterizations as independent confirmations by default;
- count nested descendants as independent merely because code differs;
- convert root count into effective statistical N;
- use root-majority voting as a truth rule.

Statuses:
- DISTINCT_DECLARED_ROOT
- SAME_DECLARED_ROOT
- ROOT_VERDICT_CONSISTENT
- ROOT_VERDICT_MIXED
- ROOT_PROVENANCE_UNRESOLVED

## E101
Audit transitive model ancestry.

Two apparently different specification roots may themselves descend from one hidden framework, loss definition, simulator, or mathematical assumption. E101 should compute transitive ancestry before treating roots as distinct provenance families.
