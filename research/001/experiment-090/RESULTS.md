# E090 — Dual Verifier & Shared Specification Risk Result

E090 compares two independently implemented verifiers against synthetic oracle fixtures.

VALID: both verifiers PASS and the oracle fixture says PASS.
AGREEMENT_PASS with no shared-spec risk detected.

INVALID: both verifiers FAIL and the oracle says FAIL.
AGREEMENT_FAIL with no shared-spec risk detected.

A_BUG: verifier A says PASS while verifier B says FAIL.
VERIFIER_DISAGREEMENT, triggering implementation investigation.

SHARED_SPEC_BUG is the important case.

Verifier A: PASS.
Verifier B: PASS.
Independent oracle fixture: FAIL.

Both implementations agree because both implement the same defective synthetic specification.

Result:
SHARED_SPECIFICATION_RISK.

## Core result

Independent implementation is valuable for detecting implementation-specific defects.

It is not independent evidence for assumptions inherited from a shared specification.

Agreement answers:
"Did these implementations behave consistently?"

It does not by itself answer:
"Is the shared rule correct?"

## Scope

Synthetic governance fixture only. The oracle here is deliberately constructed test truth, not a claim of real-world ground truth.
