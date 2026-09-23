# Local Backup / Restore

RUNLU Flooring OS Universal can operate without a cloud subscription. Local mode therefore includes a portable JSON backup contract.

## Scope
Only keys in the `runlu_flooring_universal_*` namespace are exported. The active Data/Cloud backend selector is deliberately excluded so a restore cannot silently switch providers.

## Restore rules
- Validate product format and backup version first.
- Reject foreign/non-Universal keys.
- Restore only while Local Device mode is active.
- Replace only Universal-owned local records.
- Do not read, export, overwrite, or delete Deerfoot or other RUNLU product data.
- Reload after a successful restore so all modules rebuild from the restored records.

The backup file is customer-controlled and can be copied to another device for future import. Cloud sync remains optional.
