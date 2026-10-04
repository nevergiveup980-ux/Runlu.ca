# Experiment 087 — Provenance Evidence Strength

## Purpose
E086 audited whether provenance paths are structurally complete. E087 asks whether the edges in those paths are actually supported by trustworthy evidence.

## Edge evidence grades
VERIFIED_ARTIFACT: directly supported by an inspectable artifact, lockfile, digest, signed record, or reproducible machine output.
MACHINE_DECLARED: emitted by tooling but not independently verified against the underlying artifact.
HUMAN_DECLARED: manually asserted provenance.
INFERRED: reconstructed from indirect clues.

## Path strength
A provenance path is limited by its weakest critical edge.

## Replication language
Strong structural completeness cannot compensate for weak evidence on a critical edge.
