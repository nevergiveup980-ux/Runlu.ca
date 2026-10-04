# Experiment 001 Protocol

## Question
Can a pre-agreed classical fallback correlation policy reduce dangerous disagreement during communication loss, and what safety/throughput trade-off does it create?

## Design
Synthetic repeated trials with a hidden binary world state (safe / unsafe). Agent A and Agent B receive separate noisy observations. No messages are exchanged during the decision.

## Policies
- Independent: each agent follows its own observation.
- Shared rule: both agents STOP during communication loss (conservative control).
- Correlation: GO requires both positive local evidence and a pre-shared classical gate.

## Fair comparison
All policies are evaluated on the exact same generated scenarios (paired design), using one fixed seed. This removes the confound in the initial scaffold where each policy consumed a different random stream.

## Metrics
Dangerous disagreement, unsafe joint action, successful joint action, and safe-state deadlock/unnecessary stop.

## Interpretation rule
Experiment 001 is a classical baseline engineering test. It is not evidence of entanglement or quantum advantage. A lower disagreement or unsafe rate is not automatically a better system because it may be purchased by lower task completion. Results must be interpreted as a multi-metric trade-off.

## Next gate
Do not connect to Warehouse OS production. After baseline validation, construct a read-only warehouse-inspired scenario set with synthetic orders, rolls, cuts, transfers and conflicting partial observations.
