# Experiment 086 — Provenance Completeness Audit

## Purpose
E085 can expose hidden common ancestors only when dependency paths are recorded. E086 distinguishes a clean declared graph from one whose critical paths disappear into unknown metadata.

## Node terminal states
KNOWN_ROOT: upstream lineage terminates at a declared root.
UNKNOWN_CRITICAL: a critical dependency exists but its upstream identity/provenance is unknown.
UNRESOLVED_REFERENCE: an upstream node is referenced but absent from the graph.

## Experiment coverage
COMPLETE_DECLARED_PATHS: every traversed critical path terminates at known declared roots.
PARTIAL_PROVENANCE: at least one noncritical/secondary path is incomplete, but all declared critical paths are resolved.
UNKNOWN_CRITICAL_PATH: at least one critical path terminates in UNKNOWN or an unresolved reference.

## Rule
NO_DECLARED_COMMON_ROOT may support replication language only when paired with adequate provenance coverage. Unknown critical paths force a downgrade.
