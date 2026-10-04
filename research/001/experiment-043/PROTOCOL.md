# Experiment 043 — Net Value of Adaptation

## Purpose
Audit whether adaptive codebook switching is worth its own complexity.

E039–E042 showed when adaptation *could* help. E043 charges adaptation for realistic logical overhead instead of comparing only against an oracle.

## Comparators
S0 ROBUST STATIC: keep [3,7,12].
S1 ORACLE ADAPTIVE: instantly knows the active synthetic workload and uses its workload-specific optimum. This is an unattainable upper bound, not an engineering design.
S2 REALISTIC ADAPTIVE: may suffer detection delay, regime misclassification, trusted version-switch cost, and a safe-fallback transition interval.

## Accounting identity
For an episode of N encounters in workload w:

GrossOracleGain = N [R(w,robust)-R(w,oracle_w)].

NetAdaptiveGain =
GrossOracleGain
- DelayPenalty
- ClassificationPenalty
- SwitchCost
- TransitionPenalty.

Adaptation is justified only if NetAdaptiveGain > 0 after uncertainty/risk margin.

No numerical warehouse overheads are invented.
