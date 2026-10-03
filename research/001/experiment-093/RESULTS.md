# E093 — Measurement Reliability vs Validity Result

E093 uses synthetic repeated measurements around a declared reference value of 100.

GOOD = [100,100,100,100,100]
Perfect repeatability and zero bias:
RELIABLE_AND_VALID.

PRECISE_WRONG = [99,99,99,99,99]
Perfect repeatability but bias = -1:
RELIABLE_BUT_BIASED.

NOISY_CENTERED = [98,99,100,101,102]
Substantial spread but mean = 100:
NOISY_BUT_UNBIASED.

NOISY_BIASED = [95,97,99,101,103]
Spread plus mean below the reference:
UNRELIABLE_AND_BIASED.

## Core result

Reliability and validity answer different questions.

A perfectly repeatable instrument can be systematically wrong.

Conversely, an unbiased process can be individually noisy.

Therefore inter-observer agreement, repeated identical readings, or low variance cannot by themselves establish empirical ground truth.

## Boundary

The reference value is synthetic and declared for the fixture. E093 does not claim that real warehouse measurements have these properties.
