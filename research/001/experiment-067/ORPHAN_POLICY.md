# E067 — Orphan Claim Policy

Public research claims should be blocked from "approved" status when they are:
- ORPHAN;
- MISSING_PARENT;
- STALE_PARENT;
- UNREVIEWED_MUTATION.

A repaired claim must resolve its source, bind to the current evidence-bearing parent version, and review the exact text to be published.

## Hash use
A text hash detects mutation; it does not judge whether the new wording is scientifically acceptable.

After a hash mismatch, run scope/semantic review again.

## Next drill — E068
Attack source evolution.

Sometimes a parent result changes legitimately: corrected arithmetic, narrower boundary, new data, or retracted conclusion.

Build downstream impact propagation:
- parent corrected;
- identify every descendant claim;
- classify descendants as UNAFFECTED, RE-REVIEW, or RETRACT/BLOCK.

Question: when one source claim changes, can we find every public sentence that may now be stale?
