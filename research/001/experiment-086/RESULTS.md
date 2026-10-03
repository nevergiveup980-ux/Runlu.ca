# E086 — Provenance Completeness Result

E086 audits whether the dependency graph itself is complete enough to support replication language.

EXP_A resolves all declared critical paths to known roots:
COMPLETE_DECLARED_PATHS.

EXP_B contains an explicitly unknown critical library lineage:
UNKNOWN_CRITICAL_PATH.

EXP_C resolves its critical implementation path but has a missing secondary note source:
PARTIAL_PROVENANCE.

EXP_D references a missing critical implementation:
UNKNOWN_CRITICAL_PATH.

The key pair test assumes no common root is currently visible between EXP_A and EXP_B.

Without E086 that could be mistaken for independence.

Because EXP_B has an unknown critical path, the correct decision is:

REPLICATION_INDEPENDENCE_UNRESOLVED.

## Core result

"No common ancestor found" is meaningful only relative to the completeness of the search space.

Missing critical provenance is not neutral. It limits the strength of replication language.

Unknown is not evidence of independence, and it is not evidence of dependence either.

## Scope

Synthetic governance fixture only. This experiment does not establish provenance completeness for earlier RUNLU experiments.
