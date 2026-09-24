# E061 — Vocabulary Policy

A dependency claim must name the vocabulary version used.

Prefer qualitative conclusions that survive multiple reasonable preregistered vocabularies over precise N_eff values that move when features are split or merged.

Never tune feature granularity after seeing which action benefits.

If a conclusion changes across reasonable vocabularies, label it VOCABULARY_SENSITIVE.

## What survives E061
The three exponential parameter variants remain structurally redundant under all tested vocabularies.

## What does not become universal
The exact effective diversity of partially overlapping models is vocabulary-dependent.

## Next drill — E062
The methodology stack is becoming deep enough that another danger appears: robustness layers can create false comfort merely by accumulating diagnostics.

Build a CLAIM ROBUSTNESS LEDGER that traces one conclusion through:
- parameter robustness;
- model-form robustness;
- admission uncertainty;
- family dependence;
- vocabulary sensitivity.

A claim is only as strong as its weakest unresolved layer. Do not average the layers into one score.
