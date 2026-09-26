# E085 — Transitive Provenance Policy

For replication claims:

- record dependency edges, not only flat labels;
- recursively resolve critical upstream dependencies;
- mark common critical ancestors;
- preserve path evidence showing how experiments reach each ancestor;
- distinguish NO_DECLARED_COMMON_ROOT from proven independence;
- treat incomplete provenance as an uncertainty, not as evidence of independence.

Critical roots should include, where relevant:
data sources, fixture generators, formula modules, parsers, shared libraries, measurement systems, and reference implementations.

## Next drill — E086
Attack provenance completeness.

Transitive closure only finds ancestors that were recorded.

Introduce UNKNOWN dependency nodes and compute a provenance-coverage status:
COMPLETE_DECLARED_PATHS, PARTIAL_PROVENANCE, UNKNOWN_CRITICAL_PATH.

Question: when missing dependency metadata exists, how strongly must replication language be downgraded even when no common ancestor is currently visible?
