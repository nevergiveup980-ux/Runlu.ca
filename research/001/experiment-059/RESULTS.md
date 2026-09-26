# E059 — Structural Result

Constructed admitted model set:

- three exponential-decay parameterizations in SMOOTH_RECENCY, all vote A;
- one rolling-window model in HARD_CUTOFF, votes B;
- one linear-to-zero model in PIECEWISE_RECENCY, votes B.

Raw model count:

A = 3
B = 2

So naive model counting reports A.

But the three A votes share one assumption family.

Family-level count:

SMOOTH_RECENCY -> A
HARD_CUTOFF -> B
PIECEWISE_RECENCY -> B

So family counting reports:

A = 1 family
B = 2 families

and the directional conclusion reverses to B.

## Core result

MODEL MULTIPLICITY IS NOT INDEPENDENT EVIDENCE.

A researcher can manufacture apparent consensus merely by adding many parameterizations of one model family.

Therefore consensus reports must disclose both model-instance count and assumption-family structure.

## Strict family rule

If admitted variants inside one family disagree, that family is SPLIT and receives no directional vote in the strict family audit.

This rule is conservative and is itself a declared analysis choice, not a universal theorem.
