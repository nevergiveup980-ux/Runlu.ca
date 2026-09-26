# E085 — Transitive Provenance Closure Result

E085 expands experiment provenance recursively.

EXP_A and EXP_B appear to use different implementations, simulators, libraries, generators, and immediate sources.

A direct comparison therefore looks separate.

Transitive closure reveals:

EXP_A -> IMPL_A -> LIB_A -> FORMULA_ROOT

EXP_B -> IMPL_B -> LIB_B -> FORMULA_ROOT

The pair is classified HIDDEN_COMMON_ANCESTOR.

EXP_A and EXP_C have no common critical root in the declared fixture and receive NO_DECLARED_COMMON_ROOT. This remains deliberately weaker than "independent."

EXP_A and EXP_D also converge on FORMULA_ROOT through paths of different lengths, so the hidden dependency is detected despite asymmetric graph depth.

## Core result

Different immediate dependencies do not guarantee independent evidence generation.

Replication provenance must be transitively closed far enough to expose common critical roots.

A hidden common formula, parser, generator, library, or upstream dataset can create correlated failure risk across apparently separate implementations.

## Boundary

This is a synthetic dependency graph. It does not establish hidden dependencies in prior RUNLU experiments.
