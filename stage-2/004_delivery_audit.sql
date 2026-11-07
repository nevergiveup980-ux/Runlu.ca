-- Private STAGE delivery authorization audit.
-- Do not store signed bearer tickets, URLs, or private storage keys.
CREATE TABLE IF NOT EXISTS stage_delivery_audit (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event TEXT NOT NULL CHECK (event = 'STAGE_DELIVERY_AUTHORIZED'),
 asset_id TEXT NOT NULL,
 owner_id TEXT NOT NULL,
 occurred_at TIMESTAMPTZ NOT NULL,
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK (asset_id ~ '^asset_[A-Za-z0-9_-]{4,80}$'),
 CHECK (length(owner_id) BETWEEN 1 AND 256)
);
CREATE INDEX IF NOT EXISTS stage_delivery_audit_owner_time_idx
 ON stage_delivery_audit(owner_id,recorded_at DESC);
