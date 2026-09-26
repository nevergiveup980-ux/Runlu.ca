# E022-N2 — Blind-Corner Merge: Native Specification Draft

## Physical story
Two autonomous movers approach a shared blind-corner/merge region from different aisles. During a short communication outage each has only local sensing and a pre-agreed fallback policy.

## Private observations
Each mover receives a local binary observation indicating whether its own approach appears CLEAR or CONSTRAINED. The observations are not assumed to reveal the other mover's state.

## Actions
WAIT or ENTER.

## Native outcomes
- ENTER/ENTER: conflict exposure.
- WAIT/WAIT: deadlock/delay.
- exactly one ENTER: progress.
Additional priority/efficiency terms may be admitted only if justified by a physical variable defined before policy comparison.

## Required baselines
- both WAIT;
- fixed right-of-way;
- deterministic local observation policies;
- randomized local policies;
- pre-shared classical randomness.

## Critical falsification question
Does any proposed correlated fallback improve a preregistered safety-throughput frontier beyond the full randomized-classical attainable set?

If not, close N2 as another classical negative result.

## Prohibited shortcut
Do not assign artificial input pairs or rewards solely to create the XOR structure of CHSH.
