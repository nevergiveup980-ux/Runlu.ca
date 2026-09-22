# Experiment 011 — One-Bit Channel Reliability Test

## Purpose
Stress the perfect E010 one-bit coordination protocol under an imperfect emergency channel.

## Baseline
Use the E010 A->B perfect protocol as the reference. Under an ideal channel it achieves:
conflict=0, deadlock=0, progress=1, urgent-priority=1.

## Fault models
Test separately before combining them:

1. **Bit flip** — transmitted urgency bit is inverted with probability p_flip.
2. **Packet loss** — message is absent with probability p_loss; receiver must use a preregistered fallback.
3. **Stale bit** — receiver obtains the previous-cycle urgency bit with probability p_stale.
4. **Delay/deadline miss** — message arrives after the action deadline with probability p_late and is treated according to the same fallback rule.

## Reliability sweep
Evaluate fault probabilities:
0, 0.00001, 0.0001, 0.001, 0.01, 0.05, 0.10, 0.20, 0.30, 0.50.

## Fallbacks
Compare at least:
- SAFE-HOLD: receiver yields when the bit is unavailable/late;
- FIXED-ROLE: revert to the zero-communication fixed-role convention;
- LOCAL-URGENCY: receiver acts from its own urgency only.

Fallback choice must not be changed after seeing a favorable point.

## Metrics
Conflict, deadlock, progress, urgent-priority satisfaction, plus fault-conditioned versions of each metric.

## Threshold question
Find the channel-fault region where the one-bit protocol ceases to Pareto-improve on the best zero-communication fallback.

## Scope
Synthetic engineering benchmark only. No production control.
