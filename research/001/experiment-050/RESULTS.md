# E050 — Structural Results

## Result 1 — Count + oldest is not enough for cumulative waiting burden

Two queues can have the same:
- count = 4;
- oldest wait = 1200 seconds;

while hiding very different age distributions:

A = [1200, 0, 0, 0]
B = [1200, 1100, 1100, 1100]

Their cumulative waiting burdens are:
- A: 1200 seconds;
- B: 4500 seconds.

Swapping these hidden age vectors between side A and side B leaves all T1 observations unchanged while reversing the J_sum preferred side.

Therefore T1 cannot identify J_sum.

## Result 2 — Count + oldest + total wait is still not enough for every temporal objective

At tau = 600 seconds:

X = [1200, 600, 0, 0]
Y = [1200, 300, 300, 0]

Both have:
- count = 4;
- oldest = 1200 seconds;
- total wait = 1800 seconds.

But overdue counts differ:
- X: 2;
- Y: 1.

Swapping X and Y reverses the J_tau preferred side without changing the T2 summary.

Therefore T2 cannot identify J_tau.

## Result 3 — Minimum telemetry depends on the declared objective

For the snapshot objectives tested:
- J_max needs oldest_wait_seconds;
- J_sum needs queue_wait_sum_seconds;
- J_tau needs overdue_count at the declared tau.

There is no single objective-independent "minimal temporal telemetry" discovered by E050.
