# E105 — Conflicting Boundary Evidence Result

The conflict fixture contains three strong, current, bound, mechanism-relevant evidence channels:

ARCHITECTURE -> depth 2  
REPRODUCIBLE_PROPAGATION -> depth 3  
EMPIRICAL_CANDIDATE -> depth 1

The result is BOUNDARY_CONFLICT.

A control fixture in which all three channels support depth 2 returns BOUNDARY_CONVERGENT.

A third fixture contains a strong empirical candidate that is not bound to the artifact actually used. That set is BOUNDARY_EVIDENCE_INCOMPLETE rather than a legitimate two-channel disagreement.

## Core result

Strong Evidence Can Disagree.

Agreement strength and evidence strength are separate dimensions.

No mean depth is reported. The arithmetic average of 1, 2, and 3 would be 2, but that number has no demonstrated causal meaning.

No majority rule is used either. Evidence channels are not votes.

## Scope

Synthetic governance fixture only. A boundary conflict can arise because channels observe different mechanisms, timescales, scopes, or because one model is wrong. E105 detects conflict; it does not resolve it.
