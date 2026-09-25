# Interrupted Operation Resolver

The resolver analyzes unfinished Crash Journal entries after an abnormal stop.

It is evidence-based and read-only. It never replays a payment, PO issue, receiving reconciliation, installation completion, invoice issue, or supplier payment.

## Verdicts

- LIKELY_APPLIED: the target business record contains evidence that the intended write reached durable local state.
- LIKELY_NOT_APPLIED: the target record exists and still reflects the pre-operation state.
- UNCERTAIN: available evidence is insufficient. Manual business review is required.

Audit events at or after the journal start time increase confidence but are not treated as the sole source of truth.

A reviewed marker may be acknowledged only when the verdict is not UNCERTAIN. Acknowledgement closes the Crash Journal marker; it does not alter the business record.

This keeps recovery conservative: detect, inspect, explain, then let a human decide what the real-world business action should be.
