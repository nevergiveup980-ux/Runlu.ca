// AI Director submission outbox: fail closed on uncertain paid-provider outcomes.
// PENDING means not yet claimed. DISPATCHING is uncertain after a crash.
// No automatic provider retries; manual/provider reconciliation is required.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorSubmissionOutbox {
 constructor(pool){if(typeof pool?.query!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async create({attemptId}){
  if(!ID.test(attemptId??''))throw Error('Invalid attempt');
  const r=await this.pool.query(
   `INSERT INTO stage_director_submission_outbox(attempt_id,state)
    SELECT attempt_id,'PENDING' FROM stage_director_attempts
    WHERE attempt_id=$1 AND state='RESERVED'
    ON CONFLICT (attempt_id) DO NOTHING RETURNING attempt_id,state`,[attemptId]);
  if(r.rows.length!==1)throw Error('Outbox already exists or attempt not reserved');
  return r.rows[0];
 }
 async claim({attemptId}){
  if(!ID.test(attemptId??''))throw Error('Invalid attempt');
  if(typeof this.pool.connect!=='function')throw Error('Transactional PostgreSQL pool required');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   // Lock the episode budget first, matching reservation and charge settlement.
   // This serializes a pause with a new dispatch claim.
   const budget=await client.query(
    `SELECT b.episode_id,b.spending_paused
     FROM stage_director_budgets b
     JOIN stage_director_attempts a ON a.episode_id=b.episode_id
     WHERE a.attempt_id=$1 FOR UPDATE OF b`,[attemptId]);
   if(budget.rows.length!==1||budget.rows[0].spending_paused!==false)
    throw Error('Submission blocked: spending paused or budget missing');
   const r=await client.query(
    `UPDATE stage_director_submission_outbox o
     SET state='DISPATCHING',updated_at=now()
     WHERE o.attempt_id=$1 AND o.state='PENDING'
       AND EXISTS (SELECT 1 FROM stage_director_attempts a
                   WHERE a.attempt_id=$1 AND a.state='RESERVED'
                     AND a.episode_id=$2)
     RETURNING o.attempt_id,o.state`,[attemptId,budget.rows[0].episode_id]);
   if(r.rows.length!==1)throw Error('Submission already claimed or uncertain');
   await client.query('COMMIT');
   return r.rows[0];
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e}
  finally{client.release()}
 }
 async markSubmitted({attemptId,providerTaskId}){
  if(!ID.test(attemptId??'')||!ID.test(providerTaskId??''))throw Error('Invalid provider identity');
  const r=await this.pool.query(
   `UPDATE stage_director_submission_outbox SET state='SUBMITTED',provider_task_id=$2,updated_at=now()
    WHERE attempt_id=$1 AND state='DISPATCHING' RETURNING attempt_id,state,provider_task_id`,
   [attemptId,providerTaskId]);
  if(r.rows.length!==1)throw Error('Submission not dispatching');
  return r.rows[0];
 }
 async markUnknown({attemptId}){
  if(!ID.test(attemptId??''))throw Error('Invalid attempt');
  const r=await this.pool.query(
   `UPDATE stage_director_submission_outbox SET state='UNKNOWN',updated_at=now()
    WHERE attempt_id=$1 AND state='DISPATCHING' RETURNING attempt_id,state`,[attemptId]);
  if(r.rows.length!==1)throw Error('Submission not dispatching');
  return r.rows[0];
 }
 async listUncertain({olderThanSeconds=300,limit=50}={}){
  if(!Number.isInteger(olderThanSeconds)||olderThanSeconds<30||
     !Number.isInteger(limit)||limit<1||limit>100)throw Error('Invalid recovery query');
  const r=await this.pool.query(
   `SELECT attempt_id,state,provider_task_id,updated_at
    FROM stage_director_submission_outbox
    WHERE state IN ('DISPATCHING','UNKNOWN') AND updated_at < now()-($1::int * interval '1 second')
    ORDER BY updated_at LIMIT $2`,[olderThanSeconds,limit]);
  return r.rows; // human/provider reconciliation only, NEVER resubmit automatically.
 }
}
