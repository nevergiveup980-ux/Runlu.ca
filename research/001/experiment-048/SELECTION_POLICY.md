# E048 — Selection Policy

When real calibration data exists, choose in this order:

1. reject datasets that fail E046 integrity review;
2. inspect E047 uncertainty/stability;
3. compute E048 regret-equivalent candidate set using a declared operational epsilon;
4. only then choose among equivalent candidates using secondary engineering criteria such as:
   - simpler thresholds;
   - better cross-context robustness;
   - lower version churn;
   - easier explanation/audit;
   - lower sensitivity to plausible drift.

Do not report a threshold as uniquely preferred when several alternatives are inside the declared tolerance.

## Next drill — E049
E048 still assumes the regret function itself is correct.

E049 should perform a **loss-function sensitivity audit**:
- absolute queue-difference regret;
- capped regret;
- asymmetric penalty for starving the higher queue;
- optional delay-weighted regret.

If the preferred codebook changes materially across plausible operational loss functions, the unresolved problem is objective specification, not threshold estimation.
