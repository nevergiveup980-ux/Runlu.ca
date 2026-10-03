# E017 — Assumption Lattice

## Necessary-property probes

T0 fails identity and freshness by construction.

T1 context-only can reject wrong-task traffic if context is trustworthy, but cannot distinguish replay of a valid message in the same context.

T2 authentication-only can establish origin/integrity under its assumed primitive, but an authentic old message can still be replayed unless freshness is separately represented.

T3 monotonic-state-only can represent ordering but does not establish who supplied the message or which context it belongs to.

T4 challenge-only establishes a notion of recency only if the response is bound to the challenge; without peer/context binding, a fresh response need not be from the intended peer.

T5 combines identity/context and freshness, but ambiguous reset/recovery still needs an explicit fail behavior.

T6 adds fail-closed recovery semantics and is the first candidate in this abstraction that represents all three semantic dimensions: who/where, when, and what-to-do-if-uncertain.

## Important limitation
This is a logical sufficiency study over modeled properties, not proof that T6 is secure in an implementation. Every primitive still has implementation and key/state-management assumptions.
