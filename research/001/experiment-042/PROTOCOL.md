# Experiment 042 — Regime Age and Residual Lifetime

## Purpose
Challenge E041's memoryless persistence assumption.

The switching decision should depend on expected *remaining* regime duration conditional on the regime having already lasted age a.

Let T be total regime duration. At age a, the relevant quantity is:

m(a)=E[T-a | T>a].

If per-encounter saving is DeltaR and switching cost plus uncertainty margin is C, the general expected-value rule is:

**switch iff DeltaR * m(a) > C.**

This replaces E041's geometric constant 1/(1-s) with an age-dependent residual-life function.

## Synthetic duration families
D1 MEMORYLESS: geometric/exponential-like; m(a) constant.
D2 FIXED WINDOW: total duration L known; m(a)=L-a.
D3 SHIFT-LINKED: bounded window with known scheduled endpoint; residual opportunity shrinks with age/time-to-end.
D4 HEAVY-TAILED: surviving to a larger age can increase expected remaining duration for suitable heavy-tailed families.

No warehouse duration parameters are asserted in E042.
