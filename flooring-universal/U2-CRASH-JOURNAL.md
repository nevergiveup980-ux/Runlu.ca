# Crash Journal / Write-Ahead Safety

Crash Journal records a small intent marker before important Local-First business mutations and marks that intent committed only after the business write succeeds.

It stores operation metadata, not copies of customer records.

## Contract

`begin(type, action, meta)` creates an active journal entry. The caller then performs the business mutation and persists the business store. `commit(id)` closes the active entry only after persistence succeeds. `abort(id, reason)` closes a mutation that was deliberately cancelled before persistence.

If the browser or operating system stops between begin and commit/abort, the active entry survives. Startup Recovery Guard can then pause normal workspace boot and identify the interrupted operation category.

## Important behavior

Crash Journal does not automatically replay an operation. Payments, PO issue, receiving reconciliation, installation completion, and supplier payment can have external meaning, so recovery requires explicit review instead of guessing.

The journal is Local-First runtime safety metadata. It is excluded from portable backup, Recovery Point payloads, and the IndexedDB business mirror so stale transaction state is not transported or restored.
