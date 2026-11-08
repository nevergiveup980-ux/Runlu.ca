# RUNLU Life Ledger · Migration Audit & Safety Plan

Status: pre-migration design only. No current private-ledger data has been changed.

## What is verified so far

The current private Life Ledger UI is confirmed from saved screenshots to include:
- Home / Add / Ledger / Trends / Settings;
- Category, Account, Date and optional Note fields;
- frequent / recently used choices rising to the top;
- device-local saving language;
- no bank connection / no background financial-data collection.

The public RUNLU product page also documents:
- Quick Add + Sheet View over one dataset;
- monthly Sheet layout;
- recurring shopping / fuel rows;
- long-term statistics;
- editable item library;
- CSV export;
- privacy-first local copy with optional encrypted backup.

## What is NOT yet verified

The current private app's actual storage implementation is not yet available in the GitHub source tree or saved Library as a code file.

Therefore these items remain unknown and must not be guessed:
- exact localStorage key names;
- whether records are stored as one array or multiple datasets;
- exact transaction field names;
- exact date format;
- how transfer records are represented;
- whether recurring Sheet cells are primary records or derived values;
- item-library schema;
- settings schema;
- encrypted-backup metadata;
- migration/version flags.

Candidate V2 must stay isolated until those facts are inspected.

## Read-only storage audit

File: `life-ledger-storage-audit.js`

Purpose: run on the **same web origin as the current private Life Ledger** and inventory browser storage without changing it.

Default schema report contains only:
- storage key names;
- byte sizes;
- whether values parse as JSON;
- top-level types;
- array lengths;
- object field names and value types.

It intentionally omits actual ledger values.

Optional FULL safety backup is explicit and local-only. It includes raw storage values, may contain private financial data, and should remain private.

### Safety guarantee of the audit helper
The helper does not call:
- `localStorage.setItem`;
- `localStorage.removeItem`;
- `localStorage.clear`;
- network APIs;
- fetch / XMLHttpRequest;
- remote analytics.

It only reads storage and optionally downloads JSON files locally through the browser.

## Migration sequence

### Gate 0 — freeze production changes
Do not redesign the current app and migrate data at the same time.

### Gate 1 — inventory
Run the schema-only audit on the current private app origin.

Required output:
- schema audit JSON;
- key inventory;
- candidate transaction dataset(s);
- candidate item-library dataset(s);
- candidate settings / backup metadata datasets.

### Gate 2 — full safety backup
Before any migration code is allowed to write data:
1. export the app's existing CSV / backup if available;
2. make a raw localStorage safety backup;
3. keep both outside the migration test copy.

### Gate 3 — build a field map
Map the verified current schema to Candidate V2's canonical transaction contract.

Candidate V2 canonical transaction fields:
- `id`
- `date`
- `type` (`Income`, `Expense`, `Transfer`)
- `item`
- `category`
- `account`
- `amount`
- `note`
- optional provenance fields for Sheet adjustments / migration history.

No field mapping is accepted only because names look similar. Totals must prove the mapping.

### Gate 4 — offline migration simulation
Migration runs against a copy / imported backup, never against live browser storage first.

Checks:
- record count before / after;
- Income total by year and month;
- Expense total by year and month;
- category totals;
- recurring Grocery / Fuel totals;
- transfer neutrality;
- first date / last date;
- duplicate IDs / duplicate records;
- invalid or missing amounts;
- invalid dates;
- orphan item / category references.

### Gate 5 — reconciliation
Migration is blocked if any unexplained difference remains.

Required tolerances:
- transaction counts: explain every difference;
- money totals: exact to stored cent precision;
- month totals: exact to stored cent precision;
- category totals: exact unless a documented category rename is intentionally applied;
- transfer handling: net-neutral and separately verified.

### Gate 6 — shadow copy
Create a new Candidate V2 dataset key rather than overwriting the current key.

Example principle:
- current data remains untouched;
- Candidate V2 writes to a new versioned key;
- app can compare old vs new totals;
- rollback means switching back, not reconstructing deleted data.

### Gate 7 — device tests
Before production cutover:
- iPhone Safari / installed web app behavior;
- Mac Safari;
- refresh / reopen persistence;
- offline open;
- Add record;
- edit from Entries;
- edit from Sheet;
- Grocery W1–W5 ↔ running total;
- Trends totals;
- CSV export;
- backup / restore;
- month / year boundary;
- negative correction / Undo.

### Gate 8 — production cutover
Only after Gates 1–7 pass:
1. final full backup;
2. migrate to versioned new key;
3. reconcile totals in-app;
4. preserve old key untouched for a defined rollback period;
5. mark migration complete only after successful reopen.

## Product rule during migration

**Never sacrifice old data to gain the new interface.**

The new dual-view model is valuable only if the existing seven-year record history arrives intact.

## Next evidence needed

The next factual step is not more UI work. It is obtaining the schema-only audit from the actual current Life Ledger origin. Once that report exists, the migration adapter can be written against facts rather than guesses.