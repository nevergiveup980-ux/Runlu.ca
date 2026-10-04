# E102 — Ancestry Depth Policy

For ancestry-based diversity claims:

1. Publish the ancestry-depth profile.
2. State the traversal boundary used for the primary conclusion.
3. Test reasonable adjacent depths.
4. Mark a conclusion DEPTH_SENSITIVE if it changes across justified depths.
5. Do not choose depth after seeing which depth gives the preferred conclusion.
6. Do not assume maximum depth is automatically most valid.
7. Condition deep common ancestry on failure-mechanism relevance.

Statuses:
- DEPTH_ROBUST
- DEPTH_SENSITIVE
- DEPTH_BOUNDARY_UNRESOLVED

## E103
Depth-selection provenance audit.

If a particular ancestry depth is selected, E103 should ask where that boundary came from: architecture, causal mechanism, convention, data availability, or post-hoc choice.

Core:
A sensitivity analysis can reveal depth dependence, but it cannot justify the chosen depth.
