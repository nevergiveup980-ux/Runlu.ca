# Experiment 031 — Minimum Information for Queue-Efficient Safe Allocation

## Purpose
Start Research 001B by measuring how much timely information is required to improve the E029 queue-pressure allocation task while safety remains outside the optimization tradeoff.

## State and action
Each side has a private queue bit qA,qB in {LOW(0), HIGH(1)}.
The pair is uniform and independent for this first exact audit.

The allocation layer must select exactly one side for the next safe opportunity. Safety controllers remain authoritative and may veto motion; E031 studies allocation efficiency only.

## Resource classes
R0 — zero communication: fixed/pre-agreed role or schedule, independent of current remote queue state.

R1A — one current bit A→B: A transmits qA; B knows qB and qA and selects which side receives the opportunity according to a pre-agreed allocation rule.

R1B — symmetric one current bit B→A.

R2 — both current bits available to a coordinator/decision rule. For this binary model this provides no additional queue-state information beyond R1A to B (or R1B to A), because the receiver already knows its own bit.

## Native objective
When qA != qB, allocate to the HIGH side.
When qA == qB, either side is efficient.

Define queue-choice regret:
- 0 if HIGH is selected when states differ;
- 0 on ties;
- 1 if LOW is selected when states differ.

This is an ordinal first audit, not yet a calibrated delay-cost model.
