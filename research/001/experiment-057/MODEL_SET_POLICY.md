# E057 — Model Set Policy

## Version the voter set
Consensus reports must include a model_set_version.

Example:
E057-MSET-v1 = {ROLLING_WINDOW, EXPONENTIAL_DECAY, LINEAR_TO_ZERO}.

If a fourth admitted family is later added, the report becomes a new model-set version. Old 3/3 and new 3/4 results must not be compared as though their denominators were identical.

## Failed models
FAIL means "not eligible to vote under this gate", not "mathematically invalid".

Sensitivity probes remain useful when clearly labeled NON_VOTING.

## Pre-registration discipline
Admission should be recorded before the candidate's consensus action is inspected whenever practicable.

## Next drill — E058
Attack admission-gate subjectivity itself.

Two reviewers may disagree on whether G1, G4, or G5 passes. Build an admission-decision ledger that separates:
- objective checks;
- judgment calls;
- evidence required;
- unresolved status.

Then compute consensus under every unresolved admissible model-set completion.

Question: does the conclusion survive uncertainty about who gets a vote?
