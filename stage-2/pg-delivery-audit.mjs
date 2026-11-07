// Durable audit adapter; caller supplies authenticated owner identity.
// Use only with private PostgreSQL connection, never a browser client.
export class PgDeliveryAudit{
 constructor(pool){if(!pool||typeof pool.query!=="function")throw Error("PostgreSQL pool required");this.pool=pool;}
 async record(event){
  if(!event||event.event!=="STAGE_DELIVERY_AUTHORIZED"||typeof event.ownerId!=="string"||!event.ownerId.trim()||event.ownerId.length>256||typeof event.assetId!=="string"||!/^asset_[A-Za-z0-9_-]{4,80}$/.test(event.assetId))throw Error("Invalid delivery audit event");
  const occurred=new Date(event.occurredAt);
  if(!Number.isFinite(occurred.getTime()))throw Error("Invalid audit timestamp");
  const result=await this.pool.query(
   `INSERT INTO stage_delivery_audit(event,asset_id,owner_id,occurred_at)
    VALUES($1,$2,$3,$4) RETURNING id`,
   [event.event,event.assetId,event.ownerId,occurred.toISOString()]
  );
  return result.rows.length===1 && result.rows[0].id!=null;
 }
}
