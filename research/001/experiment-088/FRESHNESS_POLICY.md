# E088 — Provenance Freshness Policy

For every critical VERIFIED_ARTIFACT provenance edge, retain:
- immutable artifact digest;
- artifact/version identifier;
- verification timestamp;
- experiment execution timestamp;
- execution-time artifact digest/version.

Require re-verification or immutable execution evidence when:
- version changed;
- digest changed;
- binding metadata is missing;
- verification postdates execution without a trustworthy execution-time artifact record.

Do not use arbitrary "verified within N days" as a substitute for identity binding.

## Next drill — E089
Attack reproducibility of the verification itself.

A digest comparison says the artifact is the same, but not that the verifier/check was correct.

Version the verifier, its rules, and expected output. Re-run old provenance evidence under a newer verifier.

Question: can a previously CURRENT_VERIFICATION become VERIFIER_OBSOLETE when the checking logic itself is corrected?
