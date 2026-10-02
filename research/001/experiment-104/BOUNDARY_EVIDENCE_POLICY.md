# E104 — Boundary-Evidence Strength Policy

Every boundary justification should report separately:
- selection provenance;
- evidence type;
- artifact binding;
- verification freshness;
- failure-mechanism relevance;
- reproducibility status.

Statuses:
- WEAK_BOUNDARY_SUPPORT
- LIMITED_BOUNDARY_SUPPORT
- STRONG_BOUNDARY_SUPPORT
- ARTIFACT_BINDING_FAILED
- EVIDENCE_STALE
- MECHANISM_RELEVANCE_UNRESOLVED
- EVIDENCE_UNRESOLVED

Do not:
- turn an ordinal evidence class into a probability;
- call machine-verifiable architecture empirical validation;
- call an empirical observation ground truth without the E092-style measurement chain;
- allow strong evidence in one dimension to erase a failure in binding, freshness, or relevance.

## E105
Conflicting-boundary-evidence audit.

Different strong evidence channels may support different ancestry boundaries. E105 should test whether architecture, reproducible propagation, and empirical candidates converge or conflict, and prevent evidence-strength labels from hiding boundary disagreement.

Core:
Strong evidence can disagree.
