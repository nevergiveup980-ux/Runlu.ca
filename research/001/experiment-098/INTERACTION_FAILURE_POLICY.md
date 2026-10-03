# E098 — Interaction Failure Policy

For a failure-mode dependency audit:

1. Audit justified single-layer mechanisms.
2. Declare justified conjunctive, disjunctive, and cross-layer mechanisms separately.
3. Never promote NO_RELEVANT_DECLARED_PATH under marginal tests to universal independence.
4. Never add arbitrary interactions merely to preserve suspicion.
5. If an interaction is plausible but not justified, classify it INTERACTION_MODEL_UNRESOLVED.

Statuses:
- INTERACTION_DEPENDENT
- NO_RELEVANT_DECLARED_INTERACTION
- INTERACTION_MODEL_UNRESOLVED

## Admission rule

An interaction mechanism requires at least one:
- causal derivation,
- engineering architecture path,
- reproducible failure fixture,
- empirical observation with auditable provenance.

Without one of these, it remains a hypothesis, not an active dependency edge.

## Next drill — E099

Audit interaction-model multiplicity.

If many plausible interaction models exist, selecting only the one that changes the conclusion is model shopping. E099 should preregister/admit interaction families and report conclusion stability across the admitted family.
