# Experiment 001 — Baseline & Sensitivity Results

Run specification: 100,000 paired synthetic trials per observation-accuracy setting; seed 20260920; safe-state prevalence 0.65; classical shared gate probability 0.70.

These are synthetic simulation results, not Warehouse OS production observations and not evidence of quantum advantage.

## Baseline: observation accuracy 0.72

| Policy | Disagreement | Unsafe | Success | Deadlock |
|---|---:|---:|---:|---:|
| Independent | 0.40448 | 0.16937 | 0.33665 | 0.04998 |
| Conservative shared rule | 0.00000 | 0.00000 | 0.00000 | 0.64975 |
| Classical correlation | 0.28140 | 0.11777 | 0.23523 | 0.23136 |

At this baseline, the correlation policy reduces disagreement and unsafe action relative to independent decisions, but also reduces successful joint action and increases deadlock. The conservative STOP rule is safest by the selected unsafe metric but performs no successful joint actions. Therefore Experiment 001 does not support a one-dimensional "better" claim; it exposes a safety-throughput trade-off.

## Sensitivity summary

| Accuracy | Independent unsafe | Correlation unsafe | Independent success | Correlation success |
|---:|---:|---:|---:|---:|
| .55 | .24484 | .17059 | .19653 | .13726 |
| .60 | .22448 | .15608 | .23372 | .16327 |
| .65 | .20258 | .14072 | .27407 | .19131 |
| .70 | .17926 | .12456 | .31803 | .22220 |
| .72 | .16937 | .11777 | .33665 | .23523 |
| .75 | .15316 | .10686 | .36525 | .25519 |
| .80 | .12589 | .08770 | .41697 | .29135 |
| .85 | .09788 | .06848 | .47031 | .32831 |
| .90 | .06644 | .04626 | .52679 | .36755 |
| .95 | .03401 | .02393 | .58609 | .40934 |

The direction of the trade-off persists across this accuracy sweep. That is useful, but it is partly expected from the correlation policy's explicit GO gate. The next experiment must therefore compare against stronger classical baselines with matched action/throughput budgets; otherwise lower risk could simply be an artifact of acting less often.

## Decision
Proceed to Experiment 002 only as a stronger-control test. Do not claim validation of the headline hypothesis yet.
