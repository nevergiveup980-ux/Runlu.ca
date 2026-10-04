# E042 — Structural Result

## Memoryless
m(a)=constant.

Regime age carries no additional switching value beyond knowing the regime label.

## Fixed / scheduled window
m(a)=L-a.

As the window ages, less time remains to recover switching cost. A codebook change that is worthwhile near the start can become irrational near the end even though the workload label has not changed.

## Heavy-tailed duration
For duration families with decreasing hazard, survival to a large age can be evidence that the episode belongs to a long-lived tail. Then m(a) can increase with age.

In that case the direction reverses: waiting and observing persistence can make reconfiguration *more* attractive.

## Result
There is no universal monotone rule:
- "older regime => switch" is false in bounded/scheduled windows;
- "older regime => do not switch" is false in suitable heavy-tailed regimes;
- "age does not matter" holds only under memorylessness.

The correct state variable is residual-lifetime distribution conditional on observed regime age/context.
