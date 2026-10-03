# E030 — Next Program

## Working title
RUNLU Research 001B — Minimal Information for Safe Efficient Coordination

## Core decomposition
1. **Safety envelope** — actions admitted only while certified local stopping/control constraints hold.
2. **Decision information** — identify the smallest private-state summary needed to choose efficiently.
3. **Channel semantics** — distinguish loss, delay, corruption, replay and stale information.
4. **Trust envelope** — bind identity, context, freshness and recovery.
5. **Fallback policy** — when required information/trust is absent, fail closed to a predefined safe behavior.
6. **Efficiency recovery** — quantify how quickly useful coordination returns as trustworthy information becomes available.

## First target
Use the E029 queue-pressure task and measure the value of:
- zero bits;
- one directional bit;
- one bit each direction;
- stale/delayed bits;
- integrity-protected but delayed information.

The objective is not to maximize message count. It is to find the minimum information that materially improves queue-weighted delay while preserving the safety invariant.

## Quantum lane
Remain separate and dormant. A nonclassical analysis should resume only if a native operational task passes the previously defined G1–G6 gates. No such task has yet passed them.
