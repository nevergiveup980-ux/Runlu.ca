# IndexedDB Durable Local Layer

U2 introduces IndexedDB in a conservative first phase.

## Architecture
The existing synchronous Local Adapter remains the operational cache so the frozen U1 business modules do not need a risky all-at-once asynchronous rewrite. Every Universal Data Adapter mutation is mirrored asynchronously into IndexedDB.

**Business modules → Data Adapter → local working cache**
**                             ↘ IndexedDB durable mirror**

## Recovery
The durable mirror can:
- resync all current Universal local records,
- restore only keys missing from the working cache, or
- rebuild the Universal working cache from the mirror.

A full rebuild creates a Recovery Point first. The Data/Cloud backend selector is excluded from the mirror.

## Next phase
Once this mirror has been exercised through regression and real-device testing, a later migration can promote IndexedDB from durable mirror to primary local database behind the same Data Adapter contract. That promotion must not require business modules to know which storage engine is active.
