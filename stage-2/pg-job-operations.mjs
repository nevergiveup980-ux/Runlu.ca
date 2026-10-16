// PostgreSQL operations draft; requires migrations and authenticated worker identity.
// Do not deploy before integration testing and RLS review.
async function tx(pool,fn){
 const db=await pool.connect();
 try{await db.query("BEGIN");const result=await fn(db);await db.query("COMMIT");return result;}
 catch(e){try{await db.query("ROLLBACK");}catch{}throw e;}
 finally{db.release();}
}
export class PgJobOperations {
 constructor(pool){if(typeof pool?.connect!=="function")throw Error("Pool required");this.pool=pool;}
 async claim(workerId,leaseSeconds=120){
  if(typeof workerId!=="string"||!workerId.trim()||!Number.isInteger(leaseSeconds)||leaseSeconds<30||leaseSeconds>3600)throw Error("Invalid lease");
  return tx(this.pool,async db=>{
   const r=await db.query(`WITH picked AS (
     SELECT id FROM stage_jobs WHERE status='QUEUED'
     ORDER BY created_at,id LIMIT 1 FOR UPDATE SKIP LOCKED
    ) UPDATE stage_jobs AS j SET status='RUNNING',lease_owner=$1,
    lease_until=NOW()+($2 * INTERVAL '1 second'),updated_at=NOW()
    FROM picked WHERE j.id=picked.id
    RETURNING j.id,j.request_json,j.budget_cents`,[workerId,leaseSeconds]);
   return r.rows[0]??null;
  });
 }
 async settle(jobId,attemptId,actualCents){
  if(!Number.isSafeInteger(actualCents)||actualCents<0)throw Error("Invalid settlement amount");
  return tx(this.pool,async db=>{
   const a=await db.query(`SELECT reserved_cents,status FROM stage_attempts
    WHERE id=$1 AND job_id=$2 FOR UPDATE`,[attemptId,jobId]);
   if(a.rows.length!==1||!["RESERVED","SUBMITTED"].includes(a.rows[0].status))throw Error("Attempt not settleable");
   const reserved=Number(a.rows[0].reserved_cents);
   if(!Number.isSafeInteger(reserved)||actualCents>reserved)throw Error("Reconciliation required");
   const j=await db.query(`UPDATE stage_jobs SET reserved_cents=reserved_cents-$2,
    spent_cents=spent_cents+$3,updated_at=NOW()
    WHERE id=$1 AND reserved_cents >= $2
    RETURNING id`,[jobId,reserved,actualCents]);
   if(j.rows.length!==1)throw Error("Budget state mismatch");
   await db.query(`UPDATE stage_attempts SET status='SETTLED',billed_cents=$2,
    updated_at=NOW() WHERE id=$1`,[attemptId,actualCents]);
   await db.query(`INSERT INTO stage_job_events(job_id,event_type,details)
    VALUES($1,'BUDGET_SETTLED',jsonb_build_object('attemptId',$2::text,'cents',$3::bigint))`,
    [jobId,attemptId,actualCents]);
   return {chargedCents:actualCents,releasedCents:reserved-actualCents};
  });
 }
}
