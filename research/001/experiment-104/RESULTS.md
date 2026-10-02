# E104 — Boundary-Evidence Strength Result

E104 holds the claimed depth-2 boundary fixed and varies the evidence supporting it.

B1 is auditable but merely asserted: WEAK_BOUNDARY_SUPPORT.

B2 and B3 improve the basis through documentation and machine verification: LIMITED_BOUNDARY_SUPPORT in this fixture.

B4 supplies reproducible propagation behavior tied to the boundary: STRONG_BOUNDARY_SUPPORT.

B5 is an empirical-grounding candidate and is also STRONG_BOUNDARY_SUPPORT, but the label deliberately says candidate rather than truth.

Three controls expose orthogonal failure modes:
- B6 has machine verification but is not bound to the artifact actually used: ARTIFACT_BINDING_FAILED.
- B7 has reproducible evidence but it is stale: EVIDENCE_STALE.
- B8 has empirical evidence but its relevance to the modeled failure mechanism is unresolved: MECHANISM_RELEVANCE_UNRESOLVED.

## Core result

Documented Reason != Strong Evidence.

And even:

Strong Evidence Type != Valid Boundary Evidence

unless artifact binding, freshness, and mechanism relevance also hold.

## Scope

Synthetic governance fixture only. The evidence ladder is ordinal for this experiment and must not be interpreted as calibrated probabilities or universal weights.
