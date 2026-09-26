# E016 — Trust Dependency Ledger

| Recovery model | What it adds | What it still must trust |
|---|---|---|
| R0 blind reset | availability | nothing proves freshness; replay window reopens |
| R1 random session ID | session separation | uniqueness/unpredictability plus trustworthy session acceptance |
| R2 persistent epoch | cross-restart ordering | durable monotonic storage on both relevant sides |
| R3 challenge/response | liveness/freshness evidence | trustworthy binding of response to peer/context and fresh challenge state |
| R4 external authority | explicit re-establishment | authority identity, channel, availability, and authority state |

## Structural observation
Recovery cannot create trust from nothing. Every recovery mechanism moves the root of trust somewhere: durable state, fresh randomness, peer identity/context binding, or an external authority.

Therefore the next question is not "which recovery trick is perfect?" but "what is the smallest explicit root of trust the system is willing to assume?"
