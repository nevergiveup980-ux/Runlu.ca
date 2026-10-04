# E026 — Replacement Native Variable

Instead of assigning priority from an ambiguous TIGHT bit, define a physically directional local quantity:

**required stopping distance versus available stopping distance before the conflict boundary.**

Let margin m = available_distance - required_stopping_distance.

Conceptually:
- m >= reserve threshold: controlled stop before boundary is feasible;
- m < reserve threshold: safe behavior cannot be inferred from this scalar alone; the system may already be in an abnormal/emergency regime.

Crucially, negative margin does **not** imply "ENTER." It signals that the nominal fallback coordination problem may have already failed and should transition to a separate hazard/emergency-control regime.

## Consequence
A normal fallback game should be posed only while both agents remain inside a certified controllable envelope where STOP is physically feasible.

Inside that envelope, the research question becomes efficiency/deadlock coordination under a safety invariant, not permission to trade collision risk for priority.

This separates:
1. safety envelope / emergency control;
2. no-communication fallback coordination;
3. throughput optimization.
