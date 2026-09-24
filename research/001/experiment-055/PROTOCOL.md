# Experiment 055 — Model-Form Robustness and Consensus Regions

## Purpose
E054 studied parameter uncertainty inside one memory model. E055 asks whether the corrective decision survives a change in memory model itself.

Compare rolling-window memory W with exponential-decay memory H.

Use the E053/E054 synthetic history: age 50 residual +8 and age 5 residual -3. Positive debt prefers B; negative debt prefers A.

A pair (W,H) is CONSENSUS_A or CONSENSUS_B when both models choose the same side; otherwise it is DISAGREE. Consensus near a flip boundary is weaker, so distance to each parameter boundary is also reported descriptively.

This is a structural synthetic audit, not an operationally calibrated fairness controller.