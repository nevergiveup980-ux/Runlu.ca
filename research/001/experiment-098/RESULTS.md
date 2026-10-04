# E098 — Interaction Failure Mechanisms Result

The synthetic fixtures expose three ways E097-style marginal checks can be incomplete.

AB shares SOFTWARE but not CALIBRATION. Its ordinary conjunction SOFTWARE_AND_CALIBRATION is false. Yet AB carries a declared cross-layer bridge K9 from A's software side to B's calibration side, so CROSS_LAYER_INTERACTION is true.

EF shares both SOFTWARE S4 and CALIBRATION C4. Neither fact alone defines the modeled conjunctive failure; together they satisfy SOFTWARE_AND_CALIBRATION.

CD does not share software, but shares LABEL L3, so SOFTWARE_OR_LABEL is true through the alternate pathway.

## Core result

Marginal independence does not imply interaction independence.

Formally, for failure event F,

P(F | S,C) cannot in general be reconstructed from separate audits of S and C.

A pair can have:
- no relevant single-layer path under the tested marginal rule,
- yet a relevant path under an explicitly modeled interaction.

## Caution

This does not mean every imaginable interaction should be added. Unbounded interaction hunting makes independence unfalsifiable. Interaction mechanisms need an explicit causal or engineering rationale before admission.

Synthetic governance fixture only.
