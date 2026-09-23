# Business Data Exchange

This layer is separate from full Backup / Restore.

- **CSV Export** is for Excel, accounting, archive, and human-readable downstream work.
- **Business Package** preserves linked Universal business records in JSON.
- **Package Import** is additive-only. Existing IDs are skipped and never overwritten.
- Imports must match the current organization and every imported record must carry that organization ID.
- Workspace configuration and Data/Cloud provider settings are not imported.
- Deerfoot and other RUNLU namespaces are never touched.

This gives Local-First customers practical data portability without requiring Supabase or another cloud subscription.
