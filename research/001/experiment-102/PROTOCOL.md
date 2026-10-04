# Experiment 102 — Ancestry Depth Sensitivity Audit

## Purpose
E101 showed that distinct immediate specification roots can merge through transitive ancestry. E102 asks whether a provenance-diversity conclusion depends on how far upward the ancestry graph is traversed.

## Synthetic graph
Five leaves:
A -> FA -> RA -> META
B -> FA -> RA -> META
C -> FC -> RA -> META
D -> FD -> RD -> META
E -> FE -> RD -> META

At depth 0, the five leaves are distinct.
At depth 1, A/B merge while C, D, E remain separate.
At depth 2, A/B/C merge and D/E merge.
At depth 3, all five reach META.

## Rule
Report diversity as a depth-indexed profile rather than a single count.

Depth is a modeling boundary. A deeper common ancestor does not automatically imply a relevant shared failure mechanism; relevance must still be conditioned on the failure under study.
