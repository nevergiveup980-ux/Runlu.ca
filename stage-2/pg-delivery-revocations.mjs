// Durable PostgreSQL revocation adapter; requires a configured, trusted pg pool.
import {ticketFingerprint} from "./delivery-revocation.mjs";
export class PgDeliveryRevocations{
 constructor(pool){if(!pool||typeof pool.query!=="function")throw Error("PostgreSQL pool required");this.pool=pool;}
 async revoke(ticket,{ownerId,assetId,untilMs,now=Date.now()}={}){
  if(typeof ownerId!=="string"||!ownerId.trim()||typeof assetId!=="string"||!/^asset_[A-Za-z0-9_-]{4,80}$/.test(assetId))throw Error("Revocation identity required");
  if(!Number.isSafeInteger(untilMs)||!Number.isSafeInteger(now)||untilMs<=now)throw Error("Valid revocation expiry required");
  const fingerprint=ticketFingerprint(ticket);
  await this.pool.query(
   `INSERT INTO stage_delivery_revocations(ticket_fingerprint,owner_id,asset_id,expires_at)
    VALUES($1,$2,$3,to_timestamp($4::double precision/1000))
    ON CONFLICT(ticket_fingerprint) DO NOTHING`,
   [fingerprint,ownerId,assetId,untilMs]
  );
 }
 async isRevoked(ticket,{now=Date.now()}={}){
  if(!Number.isSafeInteger(now))throw Error("Invalid clock");
  const result=await this.pool.query(
   `SELECT 1 FROM stage_delivery_revocations
    WHERE ticket_fingerprint=$1 AND expires_at>to_timestamp($2::double precision/1000) LIMIT 1`,
   [ticketFingerprint(ticket),now]
  );
  return result.rows.length>0;
 }
}
