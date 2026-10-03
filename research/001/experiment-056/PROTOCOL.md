# Experiment 056 — Three-Model Consensus Depth

## Purpose
Extend E055 from two memory families to three:
1. rolling window W;
2. exponential half-life H;
3. finite linear-to-zero horizon L.

Use the same synthetic history:
- age 50, residual +8;
- age 5, residual -3.

Positive debt prefers B; negative debt prefers A.

## Linear memory
An event of age t has weight:

w(t;L) = max(0, 1 - t/L).

Debt:
D_L(L) = sum d_i w(age_i;L).

## Consensus depth
For a parameter tuple (W,H,L), count how many model families select A, B, or TIE.

Consensus depth is the largest count among those categories:
- 3/3: unanimous model action;
- 2/3: majority agreement;
- otherwise no directional majority.

This is a descriptive model-agreement count, not a probability of correctness.

## Question
Does the two-model consensus from E055 survive a third plausible memory family?
