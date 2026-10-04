# Experiment 061 — Vocabulary Sensitivity Audit

## Purpose
E060 used declared assumption features to estimate structural redundancy. E061 tests whether that conclusion is an artifact of how the vocabulary is split or merged.

## Rule
Compare several preregistered, reasonable vocabularies. Do not redesign a vocabulary after seeing which action gains effective diversity.

## Vocabularies
V1 COARSE
- MEMORY_SHAPE: smooth vs cutoff
- SUPPORT: finite vs infinite
- SHAPE_FAMILY: exponential vs linear vs cutoff

V2 STRUCTURAL
- RECENCY_WEIGHTED
- FINITE_SUPPORT
- HARD_CUTOFF
- SMOOTH_DECAY
- LINEAR_SHAPE
- EXPONENTIAL_SHAPE

V3 MECHANISTIC
- abrupt forgetting boundary
- gradual forgetting
- nonzero tail
- finite extinction
- constant proportional decay
- constant slope decay

Each vocabulary describes the same five E059/E060 model instances.

## Audit
For each vocabulary compute pairwise Jaccard similarity and action-specific effective diversity.

Qualitative claim under test:
"The three exponential A-voters are structurally redundant relative to their raw count."

If this survives all preregistered vocabularies, label that narrow claim VOCABULARY_ROBUST.
If a reasonable vocabulary makes those variants structurally independent, label VOCABULARY_SENSITIVE and inspect the encoding.
