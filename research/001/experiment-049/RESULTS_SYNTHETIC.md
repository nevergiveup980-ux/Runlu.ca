# E049 — Synthetic Audit Results

Two synthetic fixtures are used to test the audit itself.

## Regular 10-row fixture
With cap=4, high-queue threshold=8 and multiplier=2:
- LINEAR_GAP 1-bit optimum: [12]
- CAPPED_GAP 1-bit optimum: [12]
- HIGH_QUEUE_WEIGHTED 1-bit optimum: [12]
- all three tested 2-bit optima: [3,6,12]

This fixture is objective-stable under the tested proxy losses.

## Objective-sensitive 3-row fixture
Rows are deliberately constructed as one large low-range gap and two smaller high-range gaps.

With cap=2, high threshold=10 and multiplier=3:
- LINEAR_GAP prefers a cut in the low range (deterministic tie-break chooses [1]);
- CAPPED_GAP prefers [11];
- HIGH_QUEUE_WEIGHTED prefers [11].

Therefore the runner correctly detects a case where objective choice changes the preferred encoding.

These fixtures demonstrate audit behavior only. They are not warehouse evidence.
