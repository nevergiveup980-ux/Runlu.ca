# E087 — Provenance Evidence Policy

Every critical provenance edge should record:
- evidence grade;
- evidence locator or artifact ID;
- version/digest when available;
- verification time;
- verifier or automated check;
- whether evidence can be reproduced.

Path-level provenance strength is no stronger than its weakest critical edge.

VERIFIED_ARTIFACT is preferred for strong replication claims.
MACHINE_DECLARED requires caveated language unless independently verified.
HUMAN_DECLARED and INFERRED critical edges keep replication independence unresolved.

Do not upgrade an edge because the surrounding graph looks complete.

## Next drill — E088
Attack evidence freshness.

A VERIFIED_ARTIFACT can become stale after dependencies, lockfiles, datasets, or builds change.

Bind provenance evidence to artifact versions/digests and compare verification time/version against the experiment execution.

Question: when does previously verified provenance become STALE_VERIFICATION and require re-verification before replication language can survive?
