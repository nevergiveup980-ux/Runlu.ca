# E097 — Failure-Mode-Conditioned Dependency Result

E097 reuses the cross-layer chain:
A --software-- B --calibration-- C --labels-- D.

Under GLOBAL connectivity, A and D are connected.

But conditioning on specific failure mechanisms changes the graph.

A and B:
SCALE_BIAS -> separated.
TRANSFORM_BUG -> connected through shared software S1.

B and C:
SCALE_BIAS -> connected through calibration C2.

C and D:
LABEL_LEAKAGE -> connected through label source L3.

A and D:
GLOBAL -> connected through the multi-layer chain.
TRANSFORM_BUG -> separated because there is no all-software pathway between them.

## Core result

Global dependency is not universal failure dependence.

The relevant question is not merely whether two evidence sources are connected, but whether they are connected through a mechanism capable of producing the failure under audit.

## Scope

Synthetic governance fixture only. Failure-mode mappings are explicit modeling assumptions, not empirical claims about warehouse systems.
