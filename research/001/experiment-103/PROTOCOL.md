# Experiment 103 — Depth-Selection Provenance Audit

## Purpose
E102 showed that ancestry-diversity conclusions can change with traversal depth. E103 audits the provenance of the depth choice itself.

A sensitivity analysis can reveal that depth matters. It cannot, by itself, justify which depth should be primary.

## Synthetic fixture
The same ancestry profile from E102 is used:
depth 0 -> 5 families
depth 1 -> 4
depth 2 -> 2
depth 3 -> 1

Candidate depth-selection records:
- D_ARCH: depth 2, selected from a documented architecture boundary before verdict inspection.
- D_CAUSAL: depth 2, selected from a declared failure-transmission mechanism before verdict inspection.
- D_CONVENTION: depth 1, selected by convention only.
- D_AVAILABILITY: depth 1, selected because ancestry above it was unavailable.
- D_POSTHOC: depth 1, selected after observing that it preserves the diversity threshold.
- D_UNKNOWN: depth 2, no auditable selection record.

## Audit dimensions
1. Was the rule recorded before result inspection?
2. Is the rule tied to the failure mechanism or system architecture?
3. Was ancestry truncated by data availability?
4. Would an adjacent justified depth change the conclusion?
5. Is the selection provenance auditable?

The audit classifies justification provenance; it does not declare one universal correct depth.
