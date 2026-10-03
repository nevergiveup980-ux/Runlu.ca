# E096 — Multi-Layer Dependency Hypergraph Result

E096 gives six synthetic observers three simultaneous provenance dimensions: calibration, software, and label source.

Within each individual layer, dependency looks sparse.

But combining the critical layers reveals a bridge chain:

A --SW:S1-- B --CAL:C2-- C --LABEL:L3-- D

Thus A, B, C, and D become one connected provenance component even though no single root is shared by all four.

E and F remain separate singleton components.

Combined critical-layer components:
[A,B,C,D]
[E]
[F]

## Core result

Single-root clustering can understate dependency.

Shared dependence can be transitive and cross-layer:
software links one pair, calibration links the next, and labels link another.

However, connected-component membership is not a claim that every correlated error necessarily propagates through the entire component. It identifies a possible dependency pathway that deserves failure-mode-specific analysis.

## Scope

Synthetic governance fixture only. No real RUNLU or warehouse observer dependency is asserted.
