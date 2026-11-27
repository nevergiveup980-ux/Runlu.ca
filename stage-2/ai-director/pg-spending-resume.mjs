// Trusted server-side operation only. Caller must authenticate and authorize reviewer.
// Never expose this directly to a public client.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorSpendingResume {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async resume({episodeId,decisionId,reviewerId,reason}){
  if(![episodeId,decisionId,reviewerId].every(v=>typeof v==='string'&&ID.test(v))||
     typeof reason!=='string'||reason.trim().length<10||reason.length>2000)
   throw Error('Invalid spending resume request');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const budget=await client.query(
    'SELECT limit_cents,spending_paused FROM stage_director_budgets WHERE episode_id=$1 FOR UPDATE',
    [episodeId]);
   if(budget.rows.length!==1||budget.rows[0].spending_paused!==true)
    throw Error('Episode not paused');
   const totals=await client.query(
    `SELECT COALESCE(SUM(CASE WHEN state='SETTLED' THEN charged_cents ELSE estimated_cents END),0) AS committed_cents
     FROM stage_director_attempts WHERE episode_id=$1`,[episodeId]);
   const committed=Number(totals.rows[0]?.committed_cents??0);
   const limit=Number(budget.rows[0].limit_cents);
   if(!Number.isSafeInteger(committed)||!Number.isSafeInteger(limit)||committed<0||limit<=0||committed>limit)
    throw Error('Budget remains over limit; cannot resume without separately approved budget change');
   const uncertain=await client.query(
    `SELECT count(*)::int AS count FROM stage_director_attempts
     WHERE episode_id=$1 AND state='UNKNOWN'`,[episodeId]);
   if(Number(uncertain.rows[0]?.count??0)>0)
    throw Error('Unknown provider charges require reconciliation before resume');
   await client.query(
    `INSERT INTO stage_director_spending_decisions(decision_id,episode_id,action,reviewer_id,reason)
     VALUES($1,$2,'RESUME',$3,$4)`,[decisionId,episodeId,reviewerId,reason.trim()]);
   const updated=await client.query(
    `UPDATE stage_director_budgets SET spending_paused=false,pause_reason=NULL,paused_at=NULL
     WHERE episode_id=$1 AND spending_paused=true RETURNING episode_id`,[episodeId]);
   if(updated.rows.length!==1)throw Error('Concurrent spending decision conflict');
   await client.query('COMMIT');
   return {episodeId,state:'ACTIVE',decisionId};
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e}
  finally{client.release()}
 }
}
