# E096 — Multi-Layer Provenance Policy

For evidence-independence audits:
- model all declared critical provenance dimensions, not one preferred root;
- retain observer-to-root many-to-many relationships;
- compute layer-specific clusters;
- compute combined cross-layer connectivity;
- identify bridge observers and bridge roots;
- do not interpret graph connectivity as automatic equality of failure modes.

If a claim of independent confirmation relies on sources that become connected only after combining critical layers, mark:
CROSS_LAYER_DEPENDENCY_PRESENT.

Independence should be assessed against the failure mode of interest, not from raw graph separation alone.

## Next drill — E097
Attack unweighted connectivity.

Not every dependency edge has equal relevance to every failure mode. Calibration sharing matters for scale bias; shared software may matter for transformation bugs; common labels may matter for classification leakage.

Create failure-mode-conditioned dependency graphs.

Question: can two observers be connected globally yet independent with respect to one specific failure mode, while strongly dependent for another?
