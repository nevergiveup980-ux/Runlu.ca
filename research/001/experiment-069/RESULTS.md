# E069 — Dependency Completeness Result

The fixture compares declared proposition dependencies with conservative text-derived candidates.

COMPLETE declares numeric value, direction, scope, comparator, and method definition. Its sentence visibly uses those elements.
Result: NO_UNDECLARED_CANDIDATE.

HIDDEN_NUMBER declares direction and scope but contains the exact source-linked value 0.096184.
Result: DEPENDENCY_REVIEW with undeclared NUMERIC_VALUE.

HIDDEN_COMPARATOR declares direction and scope but explicitly names "robust static".
Result: DEPENDENCY_REVIEW with undeclared COMPARATOR.

HIDDEN_SCOPE declares only direction but says "warehouse operations".
Result: DEPENDENCY_REVIEW with undeclared SCOPE.

## Core result

A provenance graph is only as good as its dependency declarations.

Exact values, named comparators, and scope-bearing phrases can provide conservative evidence that a descendant may rely on a proposition it failed to register.

## Boundary

Candidate extraction is deliberately narrow and lexical. A candidate is not automatically inserted into the graph. Human review decides whether the dependency is real.
