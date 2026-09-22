# E014 — Semantic Ablation Matrix

The following hypotheses are locked before implementation.

| Remove field/property | Expected newly exposed failure |
|---|---|
| integrity tag | payload/header corruption may become silently accepted |
| sequence/freshness | replay, duplicate, and reorder may be accepted as current |
| context binding | a valid message from the wrong lane/task may be accepted |
| sender binding | a valid message from an unintended peer may be accepted |
| deadline | an old but otherwise valid message may be acted upon too late |
| version/protocol ID | incompatible message semantics may be misinterpreted |
| persistent receiver freshness state | receiver restart can reopen replay window |

The experiment should try to falsify these expectations.

## Important result anticipated from E013
An integrity check alone cannot establish freshness, and freshness alone cannot establish integrity or context. These properties are orthogonal enough that "one checksum solves it" is not an acceptable model.
