# Experiment 034 — Bursty / Nonstationary Queue Challenge

## Purpose
Stress-test E033's stationary memoryless queue model.

E033 assumes fixed LOW->HIGH and HIGH->LOW rates. Warehouse demand can instead arrive in waves: receiving bursts, installer pickup windows, truck arrivals, shift boundaries, or batches released by upstream work.

## Regime-switching model
Introduce a hidden traffic regime Z(t):
- QUIET
- SURGE

Conditional queue-summary transition rates:
QUIET: alpha_Q, beta_Q
SURGE: alpha_S, beta_S

with alpha_S expected to exceed alpha_Q in a surge.

The regime itself switches:
QUIET -> SURGE at rate gamma_QS
SURGE -> QUIET at rate gamma_SQ.

The transmitted one-bit queue summary contains no regime label.

## Question
Can message age alone determine decision value when the state-transition law itself changes over time?

## Audit plan
1. Compare same-age reports generated in QUIET and SURGE.
2. Compare a stationary-average TTL against regime-conditioned TTLs.
3. Examine reports that cross a regime boundary after transmission.
4. Do not assign numerical rates until data or an explicitly synthetic scenario supplies them.
