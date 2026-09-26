# Experiment 059 — Model-Family Dependence

## Purpose
E058 made uncertainty about model admission explicit. E059 attacks a different failure mode: pseudo-replication.

Counting every admitted mathematical variant as an independent vote can manufacture apparent consensus when several models share the same core assumption.

## Independence unit
For this audit, models are grouped by a preregistered ASSUMPTION_FAMILY, not by filename or parameterization.

Declared families:
- HARD_CUTOFF: finite rolling-window memory;
- SMOOTH_RECENCY: continuously decaying recency weights;
- PIECEWISE_RECENCY: finite piecewise-linear forgetting.

Multiple variants inside one family do not automatically create multiple independent votes.

## Two reports
MODEL_COUNT:
raw action counts across admitted model instances.

FAMILY_COUNT:
each assumption family contributes one directional vote only when its admitted members are internally unanimous. If family members disagree, that family reports SPLIT and contributes no directional vote in the strict audit.

## Question
Can raw model majority and assumption-family consensus disagree?

If yes, consensus depth must disclose dependence structure.
