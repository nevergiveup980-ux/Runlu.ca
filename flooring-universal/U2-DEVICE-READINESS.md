# Device Readiness / First-Run Check

The Device Readiness panel is a read-only Local-First preflight, except when the user explicitly requests browser persistent-storage protection.

A device reports **DEVICE READY** only when these required checks pass:

1. Company Workspace exists.
2. Data Adapter is healthy.
3. Workspace schema is initialized and compatible.
4. IndexedDB durable mirror is ready.
5. Service Worker is registered.
6. Offline app-shell cache contains the core navigation and manifest.
7. Backup / Restore contract is available.
8. Browser storage is not near its reported quota.

Online/offline state and installed-app state are displayed as context; being offline is not itself a failure once the offline shell is ready.

Persistent storage is a browser-controlled request, not a guarantee. Downloaded backups remain the independent disaster-recovery mechanism.
