-- STAGE 2.0 short-lived delivery ticket revocations.
-- Store only the SHA256 fingerprint of a ticket, never the bearer token itself.
CREATE TABLE IF NOT EXISTS stage_delivery_revocations (
 ticket_fingerprint CHAR(64) PRIMARY KEY,
 owner_id TEXT NOT NULL,
 asset_id TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL,
 revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CONSTRAINT stage_delivery_revocations_hash CHECK (ticket_fingerprint ~ '^[a-f0-9]{64}$')
);
CREATE INDEX IF NOT EXISTS stage_delivery_revocations_expiry_idx
 ON stage_delivery_revocations (expires_at);
-- Periodic cleanup is safe only after ticket expiry.
