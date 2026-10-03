# E035 — Structural Result

## One-bit threshold pathology
Let E1(Q)=0 for Q<H and 1 for Q>=H.

Then:
- Q=H-1 and Q=H differ by one job but produce different messages.
- Q=H and Q=H+k can differ greatly but produce the same message for every k>=0.

Therefore Hamming/message change is not proportional to operational state change.

A bit flip in the semantic summary can exaggerate a tiny physical change, while an unchanged bit can hide a large physical change.

## Fresh but insufficient
Suppose both sides report HIGH at t=0, but actual queues are H and H+20. The one-bit reports are perfectly fresh and transport-correct, yet they erase the information needed to prefer the much longer queue if the cost model values that difference.

Thus:

**semantic freshness does not imply semantic sufficiency.**

## Old but still sufficient
Conversely, an older ordinal/exact report may still preserve the ordering needed for the decision even after the exact counts have changed.

Thus:

**decision value depends on task-relevant information, not merely exact state equality.**

This refines E032–E034: p(current state != reported state) is sometimes too strict. The better quantity is probability that aging/encoding changes the decision that would be made with current full information.
