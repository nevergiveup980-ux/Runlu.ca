# E011 Guardrails

The first implementation intentionally does **not** fabricate a stale-state result. Staleness depends on temporal correlation between consecutive urgency states, which E008–E010 did not model.

Packet loss and deadline miss can share the same unavailable-message branch. Bit flips are modeled separately because corrupted information can be more dangerous than missing information.

Before adding stale-state simulation, preregister a temporal process (for example, a two-state Markov urgency model) and sweep its persistence parameter.

The perfect E010 policy is frozen before fault testing. Do not retune it separately at each reliability level.
