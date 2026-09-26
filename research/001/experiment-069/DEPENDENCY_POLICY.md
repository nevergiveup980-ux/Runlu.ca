# E069 — Dependency Completeness Policy

Dependency declarations remain authoritative only after completeness review.

When text-derived candidates exceed declared dependencies:
- mark DEPENDENCY_REVIEW;
- preserve both declared and candidate sets;
- ask whether the candidate is genuinely inherited from the source;
- if yes, update the dependency graph and rerun E068 impact propagation;
- if no, record why it is independent/coincidental.

Never silently mutate provenance from a phrase match.

## Next drill — E070
Attack numerical lineage.

A descendant can round, normalize, convert to percentage, or quote a difference rather than the source value. Exact token matching then fails.

Build numeric transformation provenance:
source value -> declared transform -> displayed value,
with tolerance and reproducible arithmetic.

Question: can every published research number be traced to a source number plus an explicit transformation?
