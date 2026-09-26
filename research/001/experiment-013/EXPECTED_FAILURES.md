# E013 Expected Failure Modes

These are preregistered qualitative checks before interpreting output.

- M1 duplicate detects a single unequal-bit fault but **does not detect common-mode inversion**: 00 can become 11 and remain internally consistent.
- M2 complement pair likewise **does not detect inversion of both bits**: 01 becomes 10 and still looks valid.
- Neither M1 nor M2 provides freshness; a replayed old but internally valid message is accepted.
- M3's epoch bit can reject a stale frame from the opposite epoch and parity can detect any odd number of flipped frame bits.
- M3 still has weaknesses: a two-bit corruption can preserve parity, a one-bit epoch wraps every two epochs, and coordinated corruption can forge a valid frame.

Therefore E013 is expected to falsify any claim that the E012 two-bit detector is sufficient for real safety messaging.
