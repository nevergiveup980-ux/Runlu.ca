# Local Data Health and Recovery Points

Local-First must remain recoverable without requiring a cloud subscription.

## Health
The health panel checks the active local workspace, Universal JSON readability, approximate Universal data size, rolling Recovery Point count, and browser storage estimates when the browser exposes them.

## Recovery Points
- Up to 12 rolling checkpoints.
- Lifecycle code creates a checkpoint immediately before an audited business event.
- Users can also create a manual checkpoint.
- Restoring a checkpoint first creates a new safety checkpoint of the current state.
- Recovery Points never switch the Data/Cloud provider.
- Only the RUNLU Flooring OS Universal namespace is restored.
- Deerfoot and other RUNLU products remain outside the recovery boundary.

Recovery Points are convenience rollback protection, not a substitute for downloaded external backups.
