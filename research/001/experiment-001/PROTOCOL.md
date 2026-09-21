# Experiment 001 Protocol

## Question
Can a pre-agreed fallback correlation policy reduce dangerous disagreement during communication loss?

## Design
Synthetic repeated trials with a hidden binary world state (safe / unsafe). Agent A and Agent B receive separate noisy observations. No messages are exchanged during the decision.

## Controls
The same world generator and observation quality are used across policies. A fixed seed makes runs reproducible.

## Interpretation rule
Experiment 001 is a baseline engineering test, not evidence of quantum behavior. Any improvement must later survive matched scenarios, sensitivity tests, stronger baselines, and independent replication.

## Next gate
Do not connect to Warehouse OS production. After the baseline is validated, construct a read-only warehouse-inspired scenario set with synthetic orders, rolls, cuts, transfers and conflicting partial observations.
