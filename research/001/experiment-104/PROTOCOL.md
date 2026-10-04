# Experiment 104 — Boundary-Evidence Strength Audit

## Purpose
E103 audited why an ancestry boundary was selected. E104 audits how strong the evidence is for that reason.

A documented boundary rationale can be perfectly traceable and still weakly supported.

## Synthetic evidence ladder
Five records all claim that depth 2 is the relevant architecture/causal boundary:

- B1 ASSERTED: human statement only.
- B2 DOCUMENTED: architecture document identifies the boundary.
- B3 MACHINE_VERIFIED: dependency artifact is machine-checked against the declared boundary.
- B4 REPRODUCIBLE_PROPAGATION: a reproducible synthetic failure fixture crosses dependencies up to depth 2 but not beyond.
- B5 EMPIRICAL_CANDIDATE: observational evidence is linked to the same boundary with provenance recorded.

These levels are ordered for this fixture's audit purpose only. They are not universal probabilities or evidence weights.

## Separate dimensions
- provenance/auditability;
- evidence strength;
- freshness/binding;
- mechanism relevance.

A high-strength item can still be stale or bound to the wrong artifact.
