# E055 — Model Consensus Policy

PARAMETER ROBUST means a plausible parameter interval stays inside one decision region of one declared model.

MODEL ROBUST means multiple plausible model forms select the same action over their declared plausible parameter regions.

If plausible regions include both consensus and disagreement, report structural model sensitivity.

Do not average W and H: they have different semantics. E055 does not rank rolling versus exponential memory.

## Next drill — E056
Add finite linear-to-zero decay as a third plausible memory family. Test whether two-model consensus survives and report descriptive consensus depth: how many plausible model families agree on the action. Do not reinterpret consensus depth as a confidence probability.