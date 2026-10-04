# E055 — Model-Form Robustness Results

Rolling memory selects TIE for 0<=W<5, A for 5<=W<50, and B for W>=50.

Exponential memory flips at H* = 45/log2(8/3), approximately 31.79: A below H*, B above H*.

Therefore two nontrivial model-consensus regions exist:
- CONSENSUS A: 5<=W<50 and 0<H<H*.
- CONSENSUS B: W>=50 and H>H*.

Examples:
- W=25, H=20: both choose A.
- W=25, H=40: rolling chooses A, exponential chooses B.
- W=75, H=100: both choose B.

The middle case is structural model uncertainty: changing a plausible model form changes the action.

Consensus close to a flip boundary is not called strongly robust. Boundary distance is reported as parameter distance only, not probability or confidence.