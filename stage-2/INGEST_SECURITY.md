# RUNLU STAGE output ingestion — implementation gates

Official reference: https://docs.dev.runwayml.com/assets/outputs/

Runway task output URLs expire within 24–48 hours. Download promptly into RUNLU-controlled private object storage; never expose original signed provider URLs to end users.

## Required worker implementation (not yet built)
1. Authenticate job ownership and verify provider task association.
2. Obtain URLs only from authenticated provider API, not client-supplied links.
3. Prevent SSRF: HTTPS-only, explicit trusted host policy, DNS resolution to public IPs, reject internal/reserved addresses, disable redirects or revalidate each redirect and actual connection target.
4. Stream with hard response byte and time limits. Verify Content-Length and actual bytes; reject decompression bombs.
5. Probe media with ffprobe in an isolated worker and validate codec, dimensions, duration, tracks, frame rate, decodability. MIME headers are insufficient.
6. Hash content; put in private object storage under a non-public key. Record object version, SHA-256 and retention policy.
7. Only transition to VERIFIED after durable storage, technical validation, content/rights review and quality acceptance.
8. Release short-lived authenticated signed URLs only after owner authorization; log access.
9. Never trust `verified` flags from third parties. Do not leak internal storage keys or provider URLs to clients.

`ingest-policy.mjs` is a pure validation/serialization module. It does not download, inspect, persist, or deliver real video. No cloud credentials are used.
