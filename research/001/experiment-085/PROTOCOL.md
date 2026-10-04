# Experiment 085 — Transitive Provenance Closure

## Purpose
E084 compared declared experiment-level provenance. E085 tests for hidden common ancestors reachable only through transitive dependency chains.

## Graph
Nodes may be EXPERIMENT, IMPLEMENTATION, SIMULATOR, LIBRARY, FIXTURE_GENERATOR, DATASET, FORMULA_MODULE, or ROOT_SOURCE.

For experiment x, provenance closure C(x) is every upstream node reachable from x.

For pair x,y:
shared roots = C(x) intersect C(y), restricted to critical upstream roots.

## Classification
DIRECT_SHARED: a critical dependency is directly shared.
HIDDEN_COMMON_ANCESTOR: no critical direct dependency is shared, but transitive closure reaches a common critical ancestor.
NO_DECLARED_COMMON_ROOT: no common critical root is found in the declared graph.

The last status is not proof of independence.
