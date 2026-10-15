// PostgreSQL repository draft; not connected to a production database.
export class PgBudgetRepository {
 constructor(pool){ if(typeof pool?.connect!=="function") throw Error("Pool required"); this.pool=pool; }
 async reserve(jobId,workerId,attemptId,provider,cents){
  if(!Number.isSafeInteger(cents)||cents<=0)throw Error("Invalid amount");
  const db=await this.pool.connect();
  try {
   await db.query("BEGIN");
   const updated=await db.query(
    "UPDATE stage_jobs SET reserved_cents=reserved_cents+$3 WHERE id=$1 AND lease_owner=$2 AND status='RUNNING' AND lease_until>NOW() AND budget_cents-spent_cents-reserved_cents >= $3 RETURNING id",
    [jobId,workerId,cents]);
   if(updated.rows.length!==1)throw Error("Budget or lease unavailable");
   await db.query("INSERT INTO stage_attempts(id,job_id,provider,status,reserved_cents) VALUES($1,$2,$3,'RESERVED',$4)",[attemptId,jobId,provider,cents]);
   await db.query("COMMIT");
   return {attemptId,reservedCents:cents};
  } catch(error){await db.query("ROLLBACK");throw error;} finally{db.release();}
 }
}
