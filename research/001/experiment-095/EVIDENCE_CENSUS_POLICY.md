# E095 — Evidence Census Policy

For multi-source evidence, report at least:
- RAW_OBSERVER_COUNT;
- declared critical-root partition;
- UNIQUE_CRITICAL_ROOT_COUNT;
- cluster sizes;
- sensitivity to other scientifically plausible partitions.

Do not mechanically substitute root count for sample size.

Do not turn observer-per-root ratio into confidence or probability.

If conclusions about "many independent confirmations" change materially across plausible provenance partitions, mark the independence claim PROVENANCE_PARTITION_SENSITIVE.

## Next drill — E096
Attack binary root assignment.

Real provenance can overlap: one observer may share calibration with group A, software preprocessing with group B, and training labels with group C.

Build a multi-layer dependency hypergraph and compare root counts with overlap-aware connected components.

Question: when observers belong to several dependency families at once, does simple clustering hide bridges that connect apparently separate evidence groups?
