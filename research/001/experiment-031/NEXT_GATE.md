# E031 — Next Gate

E031 deliberately assumes the transmitted queue bit is timely and truthful.

That assumption is the next thing to attack.

E032 should introduce:
- bit flips;
- detectable loss;
- delay;
- stale queue state;
- queue changes during outage.

The key quantity is no longer merely message reliability. It is **decision value as information ages**.

A perfectly authenticated but stale queue bit can be semantically wrong for the current allocation even when the message itself is intact.

Therefore E032 should separate:
1. transport correctness;
2. freshness;
3. state volatility;
4. resulting queue-choice regret.
