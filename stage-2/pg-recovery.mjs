// Conservative recovery: never resubmit an expired RUNNING task blindly.
// Requires PostgreSQL stage_jobs/stage_attempts migrations. Not deployed.
export class PgRecovery {
 constructor(pool){if(typeof pool?.connect!=="function")throw Error("Pool required");this.pool=pool;}
 async quarantineExpired({limit=50}={}){
  if(!Number.isInteger(limit)||limit<1||limit>500)throw Error("Invalid limit");
  const db=await this.pool.connect();
  try{
   await db.query("BEGIN");
   const r=await db.query(`WITH expired AS (
    SELECT id FROM stage_jobs WHERE status='RUNNING'
    AND lease_until < NOW() ORDER BY lease_until,id LIMIT $1 FOR UPDATE SKIP LOCKED
   )
   UPDATE stage_jobs j SET status='RECONCILIATION_REQUIRED',
    lease_owner=NULL,lease_until=NULL,updated_at=NOW()
   FROM expired WHERE j.id=expired.id RETURNING j.id`,[limit]);
   for(const row of r.rows){
    await db.query(`INSERT INTO stage_job_events(job_id,event_type,details)
     VALUES($1,'LEASE_EXPIRED',jsonb_build_object('action','manual_or_provider_reconciliation'))`,[row.id]);
   }
   await db.query("COMMIT");
   return r.rows.map(x=>x.id);
  }catch(error){try{await db.query("ROLLBACK");}catch{}throw error;}
  finally{db.release();}
 }
 async listUnresolvedAttempts(jobId){
  if(typeof jobId!=="string"||!jobId)throw Error("Invalid job id");
  const db=await this.pool.connect();
  try{
   const r=await db.query(`SELECT id,provider,provider_task_id,status,reserved_cents
    FROM stage_attempts WHERE job_id=$1 AND status<>'SETTLED'
    ORDER BY created_at,id`,[jobId]);
   return r.rows;
  }finally{db.release();}
 }
}
