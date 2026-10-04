# Experiment 033 — Queue Dynamics and Useful Information Lifetime

## Purpose
Replace E032's free stale-state probability p with an explicit queue-state process.

## Minimal queue model
Each side exposes only a binary summary:
- LOW = 0
- HIGH = 1

For the first exact dynamic model, the summary evolves as a continuous-time two-state Markov chain:
- LOW -> HIGH at rate alpha
- HIGH -> LOW at rate beta

This is a deliberately coarse abstraction of arrivals and service. It is not yet a calibrated warehouse queue.

A report is observed at time 0 and used after age t.

## Quantities
Let r = alpha + beta.
Stationary probabilities:
pi_LOW = beta/r
pi_HIGH = alpha/r.

Transition probabilities:
P(LOW at t | LOW at 0) = pi_LOW + pi_HIGH exp(-rt)
P(HIGH at t | LOW at 0) = pi_HIGH(1-exp(-rt))
P(LOW at t | HIGH at 0) = pi_LOW(1-exp(-rt))
P(HIGH at t | HIGH at 0) = pi_HIGH + pi_LOW exp(-rt)

The probability that the current binary state differs from the reported state, averaged at stationarity, is derived exactly in RESULTS.md.
