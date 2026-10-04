# E084 — Evidence Independence Policy

Before calling a result replicated, compare at least:
- evidence/data origin;
- scenario generation;
- simulator or measurement system;
- preprocessing;
- randomness/enumeration;
- implementation;
- core modeling assumptions.

Do not infer independence merely from different experiment numbers, files, seeds, metrics, or authorship labels.

Use INDEPENDENT_REPLICATION_CANDIDATE conservatively. Hidden shared dependencies may remain.

For the current RUNLU Research 001B synthetic chain, repeated methodological fixtures should normally be described as audits, stress tests, or reanalyses unless their evidence provenance genuinely changes.

## Next drill — E085
Attack hidden shared infrastructure.

Two experiments may declare different simulators and implementations while both depend on the same library, parser, formula module, fixture generator, or upstream source.

Build transitive provenance closure:
experiment -> artifact -> dependency -> upstream root.

Question: do apparently independent experiments converge on a hidden common ancestor that creates correlated failure risk?
