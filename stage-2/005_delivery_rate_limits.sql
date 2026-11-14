-- Shared, atomic fixed-window request limits for private STAGE delivery.
-- Only the trusted server-side PostgreSQL role may access this table.
CREATE TABLE IF NOT EXISTS stage_delivery_rate_limits (
  rate_key TEXT NOT NULL,
  window_start_ms BIGINT NOT NULL,
  request_count INTEGER NOT NULL CHECK(request_count >= 1),
  PRIMARY KEY(rate_key)
);
