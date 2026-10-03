# Experiment 065 — Semantic Scope Review

## Purpose
E064 catches explicit scope-overreach phrases. E065 tests a harder failure mode: wording that implies a broader evidence scope without using an obvious trigger phrase.

## Test triads
Each concept is represented by:
1. EXPLICIT_OVERCLAIM;
2. IMPLIED_OVERCLAIM;
3. BOUNDED_CLAIM.

The declared evidence scope for the primary fixture is SYNTHETIC.

## Semantic review checklist
A sentence requires review if it does any of the following beyond the declared evidence scope:

S1 REALITY_TRANSFER
Moves from model/simulation results to real-world behavior without an evidence bridge.

S2 DEPLOYMENT_READINESS
Implies readiness, suitability, adoption, rollout, or production use.

S3 SAFETY_TRANSFER
Turns a modeled safety property or separated safety architecture into a real safety assurance.

S4 VALIDATION_TRANSFER
Uses language such as demonstrated, validated, confirmed, established, or proven while leaving the validation domain implicit.

S5 CAUSAL_TRANSFER
Turns an association, exact model property, or synthetic comparison into a real operational causal effect.

S6 SCOPE_OMISSION
Drops the model/synthetic qualifier in a context where a reader could reasonably infer a broader scope.

## Output
PASS_BOUNDED or REVIEW_REQUIRED, with checklist reasons.

This is a deterministic fixture/checklist audit, not general natural-language understanding.
