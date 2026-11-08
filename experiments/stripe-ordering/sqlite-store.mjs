import { DatabaseSync } from 'node:sqlite';

// Actual local transactions; this is an executable reference adapter, NOT a
// substitute for the production Postgres RPC, RLS, or fulfillment implementation.
export class SqliteStore {
  constructor(path = ':memory:') {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions(ref TEXT PRIMARY KEY, revision INTEGER NOT NULL, body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS receipts(id TEXT PRIMARY KEY, subscription TEXT NOT NULL, payload_hash TEXT NOT NULL, disposition TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS entitlements(ref TEXT PRIMARY KEY, status TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS effects(event_id TEXT PRIMARY KEY, ref TEXT NOT NULL);
    `);
  }
  read(ref) {
    const row = this.db.prepare('SELECT revision, body FROM subscriptions WHERE ref=?').get(ref);
    return row ? { ...JSON.parse(row.body), revision: row.revision } : null;
  }
  receipt(id) {
    const row = this.db.prepare('SELECT * FROM receipts WHERE id=?').get(id);
    return row ? { subscription: row.subscription, payloadHash: row.payload_hash } : null;
  }
  access(ref, now) {
    const row = this.db.prepare('SELECT * FROM entitlements WHERE ref=?').get(ref);
    return !!row && row.status === 'active' && now < row.expires;
  }
  commit({ event, expectedRevision, next }) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const receipt = this.receipt(event.id);
      if (receipt) {
        if (receipt.payloadHash !== event.payloadHash || receipt.subscription !== event.subscription)
          throw new Error('event_identity_conflict');
        this.db.exec('COMMIT');
        return 'duplicate';
      }
      const current = this.read(event.subscription);
      if ((current?.revision ?? 0) !== expectedRevision) {
        this.db.exec('ROLLBACK');
        return 'conflict';
      }
      const disposition = next ? 'applied' : 'stale';
      if (next) {
        const body = { ...next, clock: { id: event.id, created: event.created } };
        this.db.prepare(`INSERT INTO subscriptions VALUES(?,?,?) ON CONFLICT(ref)
          DO UPDATE SET revision=excluded.revision, body=excluded.body`)
          .run(event.subscription, expectedRevision + 1, JSON.stringify(body));
        const active = ['active', 'trialing'].includes(next.status);
        this.db.prepare(`INSERT INTO entitlements VALUES(?,?,?) ON CONFLICT(ref)
          DO UPDATE SET status=excluded.status, expires=excluded.expires`)
          .run(event.subscription, active ? 'active' : 'inactive', next.periodEnd);
        this.db.prepare('INSERT INTO effects VALUES(?,?)').run(event.id, event.subscription);
      }
      // Fault injection after all state writes proves rollback and retry safety.
      this.beforeComplete?.();
      this.db.prepare('INSERT INTO receipts VALUES(?,?,?,?)')
        .run(event.id, event.subscription, event.payloadHash, disposition);
      this.db.exec('COMMIT');
      return disposition;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  close() { this.db.close(); }
}
