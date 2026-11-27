# RUNLU STAGE — supplier evaluation protocol (draft)

## Fair comparison
Use the same source material, prompt intent, aspect ratio, output length, and reference image across suppliers. Log differences in supported controls and licensing. Run at least 5 independent generations per supplier per use case before treating the ranking as decision-grade.

## Use cases
1. Dreamy flowers / landscape: camera movement, natural motion, clean typography added in post.
2. Human subject: face and hand consistency, consent and identity safeguards.
3. Product advertising: object fidelity, text accuracy, brand rights.
4. Narrative: character and scene consistency across multiple shots.

## Record per attempt
Provider and model version; UTC time; prompt hash; requested vs delivered duration; resolution; generation time; success/failure; actual billed CAD including failed attempts; audio inclusion; rights/terms; reviewer scores 0–5 (visual, motion, consistency, audio, prompt adherence); media technical validation; reviewer notes.

## Scoring
Visual 30%, motion 25%, consistency 20%, audio 10%, prompt adherence 15%.
Passing threshold: >=3.8/5 overall, minimum 3/5 on visual, motion and consistency, and verified media output.
Compute **total billed cost / total accepted seconds**. Failed attempts remain in numerator.

## Decision gates
- No production integration without verified API access and permission for commercial use.
- Verify current provider pricing and Canadian tax/FX/payment fees separately.
- Do not claim competitive prices until comparable competitor offerings are verified.
- Do not use personal/brand assets in external provider tests without appropriate consent.
- Longform formats require separate evaluations for script quality, voice, pacing and multi-shot consistency.
