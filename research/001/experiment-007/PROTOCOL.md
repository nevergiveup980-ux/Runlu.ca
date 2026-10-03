# Experiment 007 — Warehouse-Style CHSH Bridge Test

## Research question
Can a warehouse-flavoured two-agent coordination task be defined with the same information structure as CHSH, without quietly adding communication, a coordinator, or extra shared state?

## Scenario semantics
Two autonomous warehouse agents, A and B, are separated during a communications outage. Each receives one private binary condition:

- x for A: whether A's local route is NORMAL (0) or CONSTRAINED (1)
- y for B: whether B's local route is NORMAL (0) or CONSTRAINED (1)

The conditions are sampled independently and uniformly. A sees only x; B sees only y.

Each must choose one binary fallback action without communication:
- 0 = HOLD/YIELD
- 1 = COMMIT/GO

For this synthetic bridge benchmark, the joint action is considered coordinated when:

a XOR b = x AND y.

Operational reading:
- For 00, 01, 10: agents should take matching fallback roles.
- For 11: agents should take complementary fallback roles.

This payoff rule is deliberately synthetic. It is not claimed to be an existing Warehouse OS safety rule.

## Controls
1. No messages after x,y are issued.
2. No central coordinator may observe both inputs.
3. Classical agents may pre-agree on deterministic rules or shared randomness.
4. Classical local strategies are bounded by CHSH win probability 0.75.
5. Ideal Bell-pair simulation target is cos²(pi/8) ≈ 0.853553.

## Falsification / bridge criteria
The bridge is NOT operationally justified merely because the mathematical game reproduces CHSH.

To advance, a later warehouse-domain review must establish that:
- the four input combinations correspond to plausible independent local conditions;
- the XOR payoff corresponds to a defensible safety/throughput objective;
- binary actions are meaningful;
- no ordinary communication or centralized observation would be preferable;
- the task genuinely requires the CHSH information constraints.

If these conditions fail, record the bridge as a mathematical analogy only.

## Claim boundary
Experiment 007 tests mapping validity. It does not claim quantum advantage in Warehouse OS and does not touch production data or production control.
