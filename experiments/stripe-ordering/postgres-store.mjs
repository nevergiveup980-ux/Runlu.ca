export class PostgresStore {
  constructor(query) { this.query = query; }
  async receipt(id) {
    const {rows} = await this.query('SELECT subscription,payload_hash FROM runlu_stripe_lab.receipts WHERE id=$1',[id]);
    return rows[0] ? {subscription:rows[0].subscription,payloadHash:rows[0].payload_hash} : null;
  }
  async read(ref) {
    const {rows} = await this.query('SELECT body,revision FROM runlu_stripe_lab.subscriptions WHERE ref=$1',[ref]);
    return rows[0] ? {...rows[0].body,revision:Number(rows[0].revision)} : null;
  }
  async commit({event,expectedRevision,next}) {
    const {rows} = await this.query('SELECT runlu_stripe_lab.commit_subscription($1::jsonb,$2::bigint,$3::jsonb) AS outcome',
      [JSON.stringify(event),expectedRevision,next ? JSON.stringify(next) : null]);
    return rows[0].outcome;
  }
}
