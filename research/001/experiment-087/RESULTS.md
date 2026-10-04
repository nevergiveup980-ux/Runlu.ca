# E087 — Provenance Evidence Strength Result

E087 keeps provenance paths structurally complete and varies only the evidence supporting their edges.

A path backed entirely by inspectable/reproducible artifacts is VERIFIED_PATH.

A path containing an unverified machine declaration is MACHINE_SUPPORTED_PATH.

A complete path containing a human-only declaration is DECLARED_PATH.

A complete path containing an inferred edge is WEAKLY_INFERRED_PATH.

For replication language, HUMAN_DECLARED and INFERRED critical paths are downgraded to:

REPLICATION_INDEPENDENCE_UNRESOLVED.

## Core result

Graph completeness and graph trustworthiness are separate properties.

A fully populated dependency graph does not justify strong replication language when a critical edge is supported only by assertion or inference.

The weakest critical edge bounds the strength of the path-level provenance claim.

## Boundary

Evidence grades describe support for provenance metadata, not scientific validity of the experiment itself. This is a synthetic governance fixture.
