# E038 — Codebook Version Safety

A 2-bit payload has no stable meaning without its codebook.

Required logical envelope:
- protocol/version ID;
- codebook version ID;
- encoded queue symbol;
- context/sender binding;
- freshness/integrity fields inherited from E014–E017.

## Failure mode
If sender uses codebook v2 while receiver decodes with v1, the transport can be:
- intact;
- authenticated;
- timely;
- replay-free;

and still produce the wrong operational meaning.

This is **semantic version skew**.

## Fail-closed rule
Unknown, mismatched, or not-yet-activated codebook version => do not reinterpret the symbol heuristically. Use the defined safe fallback allocation behavior until version agreement is restored.

## Next drill
E039 should compare:
1. always re-optimize after detected drift;
2. robust static codebook minimizing worst-case regret across admitted workloads;
3. hysteretic reconfiguration that changes versions only when the expected regret reduction exceeds switching/coordination cost.

This turns encoding design into a control problem rather than a one-shot compression problem.
