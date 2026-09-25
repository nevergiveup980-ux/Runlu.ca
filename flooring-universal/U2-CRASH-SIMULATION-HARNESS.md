# Crash Simulation Harness

A non-destructive test bench for Local-First interrupted-write safety.

The harness uses synthetic in-memory fixtures only. It does not call the Data Adapter write/remove APIs and does not mutate Jobs, POs, Receiving, Installation, Invoices, Payments, Supplier Accounting, Crash Journal, Recovery Points, or Audit Trail.

Initial scenarios cover crashes before and after exact PO/payment writes, unrelated payment identity rejection, conservative handling of legacy payment markers, Receiving reconciliation, Installation completion, and Supplier payment.

A passing simulation means the fixture classifier produced the expected conservative verdict. It is an engineering regression test, not proof that a physical browser/OS power-loss test has passed.
