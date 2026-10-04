# E031 — Exact Result

## R0: zero current information exchange
Any always-valid zero-communication allocation that guarantees exactly one selected side for every private state pair must reduce to a fixed complementary role for the encounter.

Under uniform independent queue bits:
- unequal states occur with probability 1/2;
- a fixed role selects HIGH in one of the two unequal cases and LOW in the other;
- conditional HIGH-selection accuracy on unequal states = 1/2;
- unconditional expected queue-choice regret = 1/4.

A pre-agreed alternating schedule improves long-run role fairness but does not change this per-encounter expected regret when current queue states are independent of the schedule.

## R1A: one timely bit A→B
A sends qA. B already knows qB. Therefore B knows the complete two-bit state pair and can apply:
- if qA>qB, allocate A;
- if qB>qA, allocate B;
- if equal, use a fixed or alternating tie-break.

Result:
- conditional HIGH-selection accuracy = 1;
- expected queue-choice regret = 0.

R1B is symmetric and has the same result.

## R2
For this binary two-agent model, R2 cannot improve the queue-choice objective beyond zero regret already achieved by one timely directional bit.

## Exact information threshold in this model
**One timely, truthful directional bit is sufficient to eliminate queue-choice regret.**
Zero current information leaves expected regret 1/4 under the preregistered uniform independent distribution.

This is a model result, not a claim that one physical network bit is sufficient for a production protocol. Framing, identity, freshness, integrity and recovery overhead are separate concerns established in E011–E017.
