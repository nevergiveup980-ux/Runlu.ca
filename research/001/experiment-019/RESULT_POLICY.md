# E019 — Result Provenance Policy

A numerical result may be called "verified" only when its provenance is recoverable from:
- committed source code;
- committed protocol/parameters;
- deterministic seed or exact-enumeration definition;
- machine-generated output;
- execution record from CI or another auditable runner.

Until that chain exists, earlier E001–E004 numerical values are historical/unverified and must not be used as headline evidence.

Analytical identities may be reported separately when their derivation is explicit and independently checkable.
