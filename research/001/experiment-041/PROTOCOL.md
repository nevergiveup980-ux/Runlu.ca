# Experiment 041 — Reconfiguration Under Uncertain Regime Persistence

## Purpose
Remove E040's assumption that the remaining duration of a workload regime is known.

## Model
For a detected regime, suppose each subsequent encounter remains in the regime with probability s, independently conditional on survival. Then the remaining encounter count N has a geometric survival model:

P(N >= n)=s^(n-1), n>=1.

Its expected remaining duration is:

E[N]=1/(1-s).

Let DeltaR be the per-encounter regret saving from switching to the regime-specific codebook and C_switch the trusted reconfiguration cost.

## Expected-value switch rule
Expected future saving:

E[S]=DeltaR/(1-s).

Switch only if:

DeltaR/(1-s) > C_switch + U,

where U is a declared uncertainty/risk margin.

Equivalently, with U=0:

s > 1 - DeltaR/C_switch

when 0<DeltaR<C_switch.

This is a synthetic decision model, not a warehouse traffic forecast.
