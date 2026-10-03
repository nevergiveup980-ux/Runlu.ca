# E103 — Depth-Selection Provenance Policy

Every primary ancestry depth should carry:
- selected depth;
- selection basis;
- whether selected before verdict inspection;
- evidence supporting the boundary;
- ancestry completeness at and above the boundary;
- adjacent-depth sensitivity.

Statuses:
- MECHANISM_JUSTIFIED_BOUNDARY
- CONVENTION_JUSTIFIED_BOUNDARY
- AVAILABILITY_LIMITED_BOUNDARY
- POST_HOC_DEPTH_SELECTION
- DEPTH_SELECTION_UNRESOLVED

Rules:
- Never describe an availability-limited boundary as mechanism-justified.
- Never hide an adjacent-depth conclusion flip.
- Never use sensitivity analysis itself as the justification for selecting the favorable depth.
- A precommitted convention is auditable but not equivalent to a causal rationale.
- A mechanism-based boundary still inherits uncertainty from the mechanism model.

## E104
Boundary-evidence strength audit.

E103 records why a boundary was selected. E104 should grade the evidence supporting that reason: asserted architecture, machine-verifiable architecture, causal derivation, reproducible failure propagation, or empirical validation.

Core:
A documented reason is not necessarily a strong reason.
