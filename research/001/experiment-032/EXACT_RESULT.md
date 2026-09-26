# E032 — Exact Information-Aging Result

Assume stationary uniform independent binary queue states and stale probability p for A's one-bit report.

Condition on whether the report is stale.

### Report remains current (probability 1-p)
The E031 rule has zero queue-choice regret.

### Report has flipped (probability p)
Let current qA = 1-qA_old.

There are two equally likely relationships between qA_old and current qB:

1. qA_old != qB.
   The allocator sees an apparent unequal pair and deterministically selects the reported HIGH side. Because qA has flipped, the current pair is actually equal. Regret = 0.

2. qA_old == qB.
   The allocator sees a tie and uses a fair tie-break. The current pair is actually unequal. The tie-break selects the current LOW side with probability 1/2. Regret = 1/2.

Thus conditional regret given a stale flip is:
(1/2)(0) + (1/2)(1/2) = 1/4.

Therefore:

**Expected queue-choice regret with age-flip probability p = p/4.**

Checks:
- p=0 -> regret 0;
- p=1/2 -> regret 1/8;
- p=1 -> regret 1/4.

The zero-current-information baseline from E031 has regret 1/4.

So under this symmetric model, stale information degrades continuously toward the zero-information baseline. At p=1/2 the old bit still carries decision value; at p=1 it reaches the same regret as the baseline under this particular decision rule.

Important: p is state-change probability, not packet-error probability.
