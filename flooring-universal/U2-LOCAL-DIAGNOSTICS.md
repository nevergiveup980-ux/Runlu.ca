# Privacy-Safe Local Diagnostics

Diagnostics are designed for customer support without exporting business contents.

The report may include:
- Universal schema compatibility and local data mode,
- online/offline and browser capability flags,
- storage usage/quota estimates,
- IndexedDB mirror status,
- Recovery Point count,
- business dataset **counts only**,
- Device Readiness check results,
- Release Gate test names/results,
- sanitized local subsystem error text.

The report explicitly excludes:
- customer names,
- company identity,
- job / PO / invoice / record IDs,
- prices, payments, addresses, notes, line items, or other business record contents,
- cloud credentials or secrets.

Diagnostics are generated locally and downloaded only when the user presses **Generate Diagnostics**. This module does not upload the report.
