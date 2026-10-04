# E090 — Dual Verifier Policy

For critical verification:
- record verifier implementation provenance separately;
- record shared specification provenance;
- include adversarial fixtures with declared expected outcomes where justified;
- treat verifier disagreement as an implementation investigation trigger;
- treat agreement against an independent fixture as stronger implementation evidence;
- never count two implementations of one specification as two independent validations of that specification.

If both verifiers agree but fail a justified oracle fixture, block spec-dependent acceptance and review the shared specification.

Oracle provenance must itself be auditable. A weak oracle merely moves the trust problem upstream.

## Next drill — E091
Attack the oracle.

An oracle fixture can be wrong, circular, or derived from the same specification it is supposed to test.

Build oracle provenance classes:
DERIVED_FROM_SPEC, INDEPENDENT_ANALYTIC, EXTERNAL_REFERENCE, EMPIRICAL_GROUND_TRUTH_CANDIDATE.

Detect circular validation:
SPEC -> ORACLE -> VERIFIER -> claim about SPEC.

Question: when is an "independent expected answer" actually just the original rule wearing another hat?
