# E105 — Boundary Conflict Policy

When strong admissible evidence supports different boundaries:

1. Preserve each channel and its supported boundary.
2. Do not average boundary depths.
3. Do not majority-vote across evidence channels.
4. Do not automatically privilege empirical, machine, or architecture evidence solely by label.
5. Test whether the conflict disappears after conditioning on failure mode, timescale, operating regime, or scope.
6. If it does not, retain BOUNDARY_CONFLICT.

Statuses:
- BOUNDARY_CONVERGENT
- BOUNDARY_CONFLICT
- BOUNDARY_EVIDENCE_INCOMPLETE

## E106
Conflict decomposition audit.

E105 detects disagreement but does not explain it. E106 should test whether apparent conflict is actually caused by evidence channels referring to different failure modes, timescales, or operating regimes.

Core:
Disagreement may be contradiction, or it may be unconditioned heterogeneity.
