# Experiment 017 — Minimum Root of Trust

## Question
What is the smallest explicit set of assumptions required for two autonomous agents to re-establish trustworthy coordination after communication/state disruption?

## Candidate roots
T0 None: accept syntactically valid traffic.
T1 Shared context only: pre-agreed lane/task/protocol identity.
T2 Shared secret/authentication capability only.
T3 Durable local monotonic state only.
T4 Fresh challenge only.
T5 Identity/context binding + freshness mechanism.
T6 Identity/context binding + freshness + explicit fail-closed recovery state.

These are abstract models. No cryptographic construction is claimed.

## Adversarial tests
- replay of a previously valid message;
- valid message from wrong context;
- forged/new-session claim;
- sender reset;
- receiver reset;
- state rollback;
- delayed old challenge response;
- duplicate/reordered recovery traffic;
- loss during recovery;
- compromised/incorrect durable state.

## Success conditions
A candidate must separately demonstrate:
1. peer/context discrimination;
2. freshness discrimination;
3. defined behavior under ambiguous state;
4. recovery without silently accepting stale traffic.

No weighted score and no claim that a software simulation establishes physical or cryptographic security.
