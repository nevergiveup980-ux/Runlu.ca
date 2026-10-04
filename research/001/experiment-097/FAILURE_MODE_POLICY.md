# E097 — Failure-Mode Dependency Policy

For every independence claim:
- name the failure mode being guarded against;
- declare which provenance layers can transmit that failure;
- compute the conditioned dependency graph;
- retain the global graph as a conservative structural view;
- distinguish NO_RELEVANT_DECLARED_PATH from proven independence.

Use:
FAILURE_MODE_DEPENDENT when a relevant path exists.
NO_RELEVANT_DECLARED_PATH when none is found.
MODEL_UNRESOLVED when the mapping from failure mode to provenance layers is not justified.

Do not use graph disconnection as proof that an unmodeled failure mechanism cannot exist.

## Next drill — E098
Attack the failure-mode mapping itself.

A transform bug may depend on both software and calibration through an interaction, even if neither layer alone explains it.

Model conjunctive and interaction failure mechanisms:
SOFTWARE AND CALIBRATION,
SOFTWARE OR LABEL_SOURCE,
and cross-layer edge interactions.

Question: can a failure pathway exist only when two otherwise harmless dependencies combine?
