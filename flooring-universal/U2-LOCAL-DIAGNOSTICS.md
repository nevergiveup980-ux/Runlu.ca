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
- aggregate Release Gate passed/failed counts,
- boolean flags indicating whether a local subsystem reports an error.

The report explicitly excludes:
- customer names,
- company identity,
- job / PO / invoice / record IDs or Release Gate test labels that could contain them,
- prices, payments, addresses, notes, line items, or other business record contents,
- cloud credentials or secrets.

Diagnostics are generated locally and downloaded only when the user presses **Generate Diagnostics**. This module does not upload the report.
