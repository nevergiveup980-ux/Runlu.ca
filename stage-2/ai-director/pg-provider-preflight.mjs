// Final read-only gate before a future paid provider invocation.
// This does NOT make an external API call atomic with PostgreSQL. Callers must
// recheck immediately before dispatch; a pause after this check remains possible.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorProviderPreflight {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('Transactional PostgreSQL pool required');this.pool=pool;}
 async authorize({episodeId,shotId,attemptId}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid provider preflight identity');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const budget=await client.query(
    `SELECT spending_paused FROM stage_director_budgets
     WHERE episode_id=$1 FOR UPDATE`,[episodeId]);
   if(budget.rows.length!==1||budget.rows[0].spending_paused!==false)
    throw Error('Provider dispatch blocked: spending paused or budget missing');
   const result=await client.query(
    `SELECT o.attempt_id FROM stage_director_submission_outbox o
     JOIN stage_director_attempts a ON a.attempt_id=o.attempt_id
     JOIN stage_director_shot_jobs s ON s.episode_id=a.episode_id AND s.shot_id=a.shot_id
     WHERE a.attempt_id=$1 AND a.episode_id=$2 AND a.shot_id=$3
       AND a.state='RESERVED' AND s.state='RESERVED'
       AND s.attempt_id=$1 AND o.state='DISPATCHING'`,[attemptId,episodeId,shotId]);
   if(result.rows.length!==1)throw Error('Provider dispatch blocked: attempt not dispatchable');
   await client.query('COMMIT');
   return {episodeId,shotId,attemptId,authorized:true};
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e}
  finally{client.release()}
 }
}
