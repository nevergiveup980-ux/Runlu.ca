# Universal Data Adapter Contract

U2 keeps RUNLU Flooring OS Universal **local-first** while reserving a clean cloud boundary.

## Supported product modes

- **Local Device** — default. No cloud subscription required.
- **RUNLU Managed Cloud** — future optional paid service.
- **Bring Your Own Cloud** — future customer-controlled cloud account/provider.

## Rule

Business modules read and write through `RUNLUUniversalData`, not directly through a cloud SDK. The default adapter remains local and preserves the existing U1 behavior.

A future cloud provider must provide tenant isolation, authenticated actor identity, server authorization, and backup/recovery. Browser code must never contain a service-role key or other privileged secret.

## Customer ownership

Cloud configuration is optional. A customer may remain local-only, subscribe to a RUNLU-managed cloud plan, or connect a supported customer-owned cloud environment. Provider-specific credentials must live in a secure configuration path, not hard-coded in the Flooring OS source.

## Current status

Only the Local Device adapter is active. Supabase design files remain dormant and are not required for the product to run.
