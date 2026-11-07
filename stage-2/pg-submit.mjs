// Idempotent PostgreSQL submission. Requires authenticated ownerId from server session.
// Not deployed. Request hash uses stable explicit normalized fields.
import {randomUUID,createHash} from "node:crypto";
import {validateRequest} from "./engine.mjs";
export class PgJobSubmitter {
 constructor(pool){if(typeof pool?.connect!=="function")throw Error("Pool required");this.pool=pool;}
 async submit({ownerId,idempotencyKey,brief,budgetCents}){
  if(typeof ownerId!=="string"||!ownerId.trim()||typeof idempotencyKey!=="string"||!idempotencyKey.trim()||idempotencyKey.length>128)throw Error("Invalid identity");
  if(!Number.isSafeInteger(budgetCents)||budgetCents<=0)throw Error("Invalid budget");
  const request=validateRequest(brief);
  const canonical=JSON.stringify([1,request.durationSeconds,request.quality,request.format,budgetCents]);
  const requestHash=createHash("sha256").update(canonical).digest("hex");
  const db=await this.pool.connect();
  try{
   await db.query("BEGIN");
   const id=randomUUID();
   const inserted=await db.query(`INSERT INTO stage_jobs(id,owner_id,idempotency_key,request_json,status,budget_cents)
    VALUES($1,$2,$3,$4::jsonb,'QUEUED',$5)
    ON CONFLICT(owner_id,idempotency_key) DO NOTHING RETURNING id`,
    [id,ownerId,idempotencyKey,JSON.stringify({...request,requestHash}),budgetCents]);
   if(inserted.rows.length){
    await db.query("COMMIT");
    return {id,created:true};
   }
   const prior=await db.query(`SELECT id,request_json,budget_cents FROM stage_jobs
    WHERE owner_id=$1 AND idempotency_key=$2`,[ownerId,idempotencyKey]);
   const row=prior.rows[0];
   if(!row||row.request_json?.requestHash!==requestHash||Number(row.budget_cents)!==budgetCents)throw Error("Idempotency key reused with different request");
   await db.query("COMMIT");
   return {id:row.id,created:false};
  }catch(e){try{await db.query("ROLLBACK");}catch{}throw e;}
  finally{db.release();}
 }
}
