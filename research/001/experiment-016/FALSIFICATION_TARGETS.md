# E016 — Falsification Targets

1. Try to falsify the claim that a random session ID alone solves replay.
2. Try to falsify the claim that persistent counters alone solve rollback.
3. Try to falsify the claim that challenge/response alone proves peer identity.
4. Try to falsify the claim that an external authority removes state problems rather than relocating them.
5. Treat recovery availability separately from recovery safety.

Expected hard boundary: freshness evidence without source/context binding is insufficient; source binding without freshness evidence is also insufficient.
