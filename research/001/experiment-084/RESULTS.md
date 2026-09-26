# E084 — Evidence Independence Graph Result

E084 constructs experiment-level provenance rather than counting experiment labels.

Synthetic fixture A and B share every audited evidence dimension. They are REANALYSIS, not two replications.

A and C change scenario set, randomness, and data origin but retain the simulator, preprocessing, assumptions, and implementation. They are PARTIAL_REPLICATION.

D and E share none of the declared critical dimensions and are therefore labeled INDEPENDENT_REPLICATION_CANDIDATE.

The word CANDIDATE is deliberate: absence of a declared dependency is not proof that no hidden dependency exists.

## Core result

Experiment multiplicity is not replication multiplicity.

Changing a metric, seed, or scenario while retaining the same evidence-generating machinery can add sensitivity information without constituting independent replication.

Replication claims require provenance at experiment level.

## Scope

The graph is a synthetic governance fixture. It does not retroactively certify earlier RUNLU experiments as independent replications.
