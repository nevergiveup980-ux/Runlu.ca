# Data Version and Migration Registry

Universal local workspaces carry an explicit schema version so future releases can upgrade customer data without silently assuming the newest structure.

## Current baseline
Schema **v1** represents the frozen U1 / early U2 Local-First record contracts. Existing unversioned Universal workspaces are stamped as v1 without rewriting business records.

## Migration rules
- Migrations advance exactly one schema version at a time.
- Every migration has a stable ID and is recorded in migration history.
- A Recovery Point is created before schema initialization or a registered migration when Local Device recovery is available.
- Missing migration steps stop the upgrade.
- Data newer than the running app is not downgraded.
- Migration code must use the Data Adapter and must not touch Deerfoot or other RUNLU namespaces.

Future releases register explicit v1→v2, v2→v3, etc. transformations before increasing the current schema version.
