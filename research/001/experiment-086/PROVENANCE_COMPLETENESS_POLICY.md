# E086 — Provenance Completeness Policy

Before using NO_DECLARED_COMMON_ROOT to support replication language:

- audit every critical upstream path;
- distinguish explicit UNKNOWN nodes from unresolved references;
- distinguish critical missing paths from secondary metadata gaps;
- retain path evidence for known roots and gaps;
- downgrade replication language when either experiment has UNKNOWN_CRITICAL_PATH.

Allowed language:
- COMPLETE_DECLARED_PATHS + no common root -> INDEPENDENCE_CANDIDATE;
- PARTIAL_PROVENANCE + no common root -> INDEPENDENCE_CANDIDATE_WITH_PROVENANCE_CAVEAT;
- UNKNOWN_CRITICAL_PATH -> REPLICATION_INDEPENDENCE_UNRESOLVED.

Never convert missing metadata into evidence of independence.

## Next drill — E087
Attack provenance trustworthiness.

A graph can be complete but wrong: stale manifests, incorrect package declarations, copied metadata, or unverified self-report can create false completeness.

Add evidence grades to every provenance edge:
VERIFIED_ARTIFACT, MACHINE_DECLARED, HUMAN_DECLARED, INFERRED.

Question: how should replication language change when the graph is structurally complete but critical edges have weak evidence?
