# Experiment 012 — Exact Integrity Findings

Under the preregistered independent physical-bit-flip model, E012 is algebraically solvable.

## Operational mapping
- correct decode -> perfect E010 action;
- detected INVALID -> SAFE-HOLD;
- silent wrong decode -> E011 flipped-message behavior.

Therefore:
- conflict = silent_wrong / 2;
- detected faults trade availability for safety;
- silent corruption is the principal safety-sensitive quantity in this model.

## Selected exact results

| physical BER e | code | bits | silent wrong | detected invalid | conflict | progress |
|---:|---|---:|---:|---:|---:|---:|
| 0.001 | C0 raw | 1 | 0.001 | 0 | 0.0005 | 0.999 |
| 0.001 | C1/C3 detect | 2 | 0.000001 | 0.001998 | 0.0000005 | 0.999 |
| 0.001 | C2 triple majority | 3 | 0.000002998 | 0 | 0.000001499 | 0.999997002 |
| 0.01 | C0 raw | 1 | 0.01 | 0 | 0.005 | 0.99 |
| 0.01 | C1/C3 detect | 2 | 0.0001 | 0.0198 | 0.00005 | 0.99 |
| 0.01 | C2 triple majority | 3 | 0.000298 | 0 | 0.000149 | 0.999702 |
| 0.05 | C0 raw | 1 | 0.05 | 0 | 0.025 | 0.95 |
| 0.05 | C1/C3 detect | 2 | 0.0025 | 0.095 | 0.00125 | 0.95 |
| 0.05 | C2 triple majority | 3 | 0.00725 | 0 | 0.003625 | 0.99275 |
| 0.10 | C0 raw | 1 | 0.10 | 0 | 0.05 | 0.90 |
| 0.10 | C1/C3 detect | 2 | 0.01 | 0.18 | 0.005 | 0.90 |
| 0.10 | C2 triple majority | 3 | 0.028 | 0 | 0.014 | 0.972 |

## Main findings

### 1. Two-bit detection changes the error order
C1/C3 reduce silent corruption from O(e) to O(e²). At e=0.001 this lowers modeled conflict from 5e-4 to 5e-7: a factor of 1000. At e=0.01 the factor is 100.

### 2. Detection and correction optimize different objectives
C1/C3 convert most single-bit faults into detectable erasures and SAFE-HOLD. They strongly suppress conflict but do not improve progress relative to raw transmission under this particular fallback mapping.

C2 triple repetition spends one additional bit and maintains much higher progress, but its silent-error probability is approximately 3e² for small e, three times the leading C1/C3 silent-error term.

### 3. There is no universal winner
If conflict avoidance is dominant, C1/C3 are preferable within this simplified independent-error model.
If availability/throughput is valued more and the residual silent-error risk is acceptable, C2 offers a different trade-off.

No weighted score is introduced to force a winner.

## Important limitation

The apparent strength of C1/C3 depends on independent bit flips. A common-mode fault that changes both duplicated bits consistently can evade this detector. Real safety messaging requires stronger integrity mechanisms, sequence/age protection, fault containment, and system-level hazard analysis.

These results are synthetic-model findings, not production safety certification.
