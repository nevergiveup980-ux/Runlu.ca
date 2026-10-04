# E103 — Depth-Selection Provenance Result

E103 keeps the E102 ancestry graph fixed and changes only the reason for choosing the reporting depth.

Two records choose depth 2 before verdict inspection because of architecture or a declared causal mechanism. They are classified MECHANISM_JUSTIFIED_BOUNDARY.

A convention-based depth 1 is auditable, but its scientific force is weaker: CONVENTION_JUSTIFIED_BOUNDARY.

A depth 1 boundary caused by missing deeper ancestry is AVAILABILITY_LIMITED_BOUNDARY. It must not be presented as though depth 1 were causally preferred.

A depth 1 selected after seeing that it preserves the diversity threshold is POST_HOC_DEPTH_SELECTION.

An undocumented depth 2 is DEPTH_SELECTION_UNRESOLVED.

Because the E102 threshold flips between depths 1 and 2, the post-hoc example demonstrates how boundary selection can preserve a preferred conclusion without changing the underlying graph.

## Core result

Sensitivity Reveals Dependence; Provenance Justifies the Boundary.

A result can be honestly labeled DEPTH_SENSITIVE while still using a primary depth, provided the reason for that primary boundary is independently auditable.

## Scope

Synthetic governance fixture only. Architecture- or mechanism-based selection is not automatically correct; it is simply a stronger provenance basis than result-driven selection.
