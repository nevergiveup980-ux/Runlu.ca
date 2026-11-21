// AI Director: atomic budget reservation + shot claim on a trusted PG connection.
// This method never calls a paid provider. Provider submission must use a separate outbox.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorBudgetClaim {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async reserveShot({episodeId,shotId,attemptId,estimateCents}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v))||
     !Number.isSafeInteger(estimateCents)||estimateCents<=0)throw Error('Invalid reservation');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   // Serialize all claims for the episode by locking its approved budget row.
   const budget=await client.query(
    'SELECT limit_cents,spending_paused FROM stage_director_budgets WHERE episode_id=$1 FOR UPDATE',[episodeId]);
   if(budget.rows.length!==1)throw Error('User-confirmed budget required');
   if(budget.rows[0].spending_paused===true)throw Error('Episode spending paused pending manual review');
   const limit=Number(budget.rows[0].limit_cents);
   if(!Number.isSafeInteger(limit)||limit<=0)throw Error('Invalid stored budget');
   const totals=await client.query(
    `SELECT COALESCE(SUM(CASE WHEN state='SETTLED' THEN charged_cents ELSE estimated_cents END),0) AS committed_cents
     FROM stage_director_attempts WHERE episode_id=$1`,[episodeId]);
   const committed=Number(totals.rows[0]?.committed_cents??0);
   if(!Number.isSafeInteger(committed)||committed<0||committed+estimateCents>limit)
    throw Error('Budget exhausted');
   const claimed=await client.query(
    `UPDATE stage_director_shot_jobs SET state='RESERVED',attempt_id=$3,updated_at=now()
     WHERE episode_id=$1 AND shot_id=$2 AND state='READY' RETURNING shot_id`,
    [episodeId,shotId,attemptId]);
   if(claimed.rows.length!==1)throw Error('Shot unavailable');
   await client.query(
    `INSERT INTO stage_director_attempts(attempt_id,episode_id,shot_id,estimated_cents,state)
     VALUES($1,$2,$3,$4,'RESERVED')`,[attemptId,episodeId,shotId,estimateCents]);
   // Outbox intent and reservation must commit together; no orphan paid attempt.
   await client.query(
    `INSERT INTO stage_director_submission_outbox(attempt_id,state)
     VALUES($1,'PENDING')`,[attemptId]);
   await client.query('COMMIT');
   return {episodeId,shotId,attemptId,estimateCents,state:'RESERVED'};
  }catch(e){
   try{await client.query('ROLLBACK')}catch{}
   throw e;
  }finally{client.release();}
 }
}
