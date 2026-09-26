# E014 — Reset Problem

Sequence numbers create a hidden state problem.

A receiver that remembers last_sequence can reject replay/reorder. But after receiver state loss, an old captured frame may again appear fresh. A sender restart can also roll its sequence backward and cause either rejection of legitimate messages or unsafe resynchronization.

Therefore a trustworthy design must explicitly define restart behavior. Candidate approaches for later study include:
- persistent monotonic counters;
- boot/session nonce or epoch;
- authenticated resynchronization handshake;
- fail-closed manual/central reinitialization.

No approach is selected in E014. The point is to expose reset/recovery as part of the safety problem rather than hide it behind a sequence field.
