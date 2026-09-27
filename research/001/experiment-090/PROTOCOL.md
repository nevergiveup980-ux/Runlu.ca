# Experiment 090 — Dual Verifier & Shared Specification Risk

## Purpose
E089 versioned verifier logic. E090 tests whether agreement between independently implemented verifiers is sufficient evidence.

## Layers
1. ARTIFACT — object being checked.
2. SPECIFICATION — rule both verifiers are intended to implement.
3. VERIFIER_A / VERIFIER_B — independently implemented checkers.
4. ORACLE_FIXTURE — adversarial case with an externally declared expected result for this synthetic test.

## Outcomes
AGREEMENT_PASS: A and B both pass.
AGREEMENT_FAIL: A and B both fail.
VERIFIER_DISAGREEMENT: A and B differ.
SHARED_SPECIFICATION_RISK: A and B agree with each other but disagree with the independently declared oracle fixture under a shared specification.

Agreement diagnoses implementation consistency. It does not by itself validate the shared specification.
