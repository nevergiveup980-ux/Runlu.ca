# Experiment 074 — Standardization Target Sensitivity

## Purpose
E073 showed raw pooling can reverse subgroup comparisons when group composition differs. E074 asks how standardized summaries depend on the chosen target population.

## Fixed subgroup rates
EASY:
A = 0.90
B = 0.80

HARD:
A = 0.30
B = 0.20

Thus A exceeds B by 0.10 in both strata.

## Target mixes
A_OBSERVED = 10/110 EASY, 100/110 HARD.
B_OBSERVED = 100/110 EASY, 10/110 HARD.
BALANCED = 0.50 EASY, 0.50 HARD.
OPERATIONAL_EXAMPLE = 0.30 EASY, 0.70 HARD.

For target weights w, standardized rate is:
R_m(w) = sum_s w_s R_m,s.

## Question
Do standardized absolute rates change with target population, and can the A-vs-B direction change in this fixture?
