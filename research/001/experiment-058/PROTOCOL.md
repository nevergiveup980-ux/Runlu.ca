# Experiment 058 — Admission Uncertainty Ledger

## Purpose
E057 preregistered a model-admission gate. E058 audits uncertainty in applying that gate.

A gate judgment may be:
- PASS;
- FAIL;
- UNRESOLVED.

Consensus should not silently treat UNRESOLVED as either admitted or excluded.

## Completion audit
Let the core admitted set be models whose mandatory gates are all PASS.

Let U be candidates whose final admission status is UNRESOLVED.

Enumerate every admissible completion of U:
- exclude the unresolved candidate; or
- admit it, if later evidence resolves all mandatory gates to PASS.

For every completion, compute the model-vote outcome.

## Robustness classes
SET_ROBUST:
the same directional consensus survives every admissible completion.

SET_SENSITIVE:
at least two admissible completions produce different consensus conclusions.

NO_DIRECTIONAL_CONSENSUS:
no completion supports a stable directional consensus.

This is set-membership robustness, not a probability over reviewer opinions.
