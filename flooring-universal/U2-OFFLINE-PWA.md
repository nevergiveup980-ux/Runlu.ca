# Offline / PWA Foundation

RUNLU Flooring OS Universal is Local-First and can cache its application shell with a Service Worker after the first successful online load.

## Phase 1
- Web App Manifest enables standalone installation metadata.
- Service Worker pre-caches the Universal application shell.
- Navigation uses network-first with cached `index.html` fallback.
- Static app assets use cache-first with network fill.
- Old RUNLU Flooring Universal shell caches are removed on activation.
- Business data remains in the Data Adapter / local working cache with the IndexedDB durable mirror.
- Cloud remains optional.

## Boundaries
The Service Worker caches application files, not customer cloud credentials. Offline capability does not imply multi-user synchronization. Browser/PWA storage still requires downloaded backups for independent disaster recovery.

## Install behavior
Install prompts vary by browser. Where `beforeinstallprompt` is supported, Universal can expose an Install App action. On iPhone/iPad, users may install from the browser Share menu using Add to Home Screen.
