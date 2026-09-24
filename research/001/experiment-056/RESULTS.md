# E056 — Three-Model Consensus Results

For linear-to-zero memory:

D_L(L) = 8 max(0,1-50/L) - 3 max(0,1-5/L).

For 5 < L < 50, only the recent -3 event has positive weight, so the decision is A.

For L >= 50:

D_L(L) = 8(1-50/L) - 3(1-5/L)
       = 5 - 385/L.

The linear flip occurs exactly at:

L* = 77.

Correction note: algebra gives 5L - 385 = 0, hence L*=77. The executable and self-test use 77; any earlier planning value is superseded.

Thus:
- 0 < L <= 5: TIE;
- 5 < L < 77: A;
- L = 77: TIE;
- L > 77: B.

Combined with E055:
- rolling A on 5<=W<50, B on W>=50;
- exponential A below H*≈31.79, B above it.

Examples:
- W=25, H=20, L=60 -> 3/3 A.
- W=25, H=20, L=100 -> 2/3 A, linear B.
- W=75, H=100, L=100 -> 3/3 B.
- W=75, H=20, L=100 -> 2/3 B.

The third model can preserve or break two-model unanimity.

Consensus depth is not a confidence probability and does not rank model validity.
