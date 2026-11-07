// AI Director submission acknowledgement: atomically synchronize outbox,
// attempt ledger and shot job. Never treat a missing acknowledgement as failure.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorSubmissionCoordinator {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async acknowledge({episodeId,shotId,attemptId,providerTaskId}){
  if(![episodeId,shotId,attemptId,providerTaskId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid acknowledgement identity');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const outbox=await client.query(
    `UPDATE stage_director_submission_outbox SET state='SUBMITTED',provider_task_id=$2,updated_at=now()
     WHERE attempt_id=$1 AND state='DISPATCHING'
     RETURNING attempt_id`,[attemptId,providerTaskId]);
   if(outbox.rows.length!==1)throw Error('Outbox not dispatching');
   const attempt=await client.query(
    `UPDATE stage_director_attempts SET state='SUBMITTED'
     WHERE attempt_id=$1 AND episode_id=$2 AND shot_id=$3 AND state='RESERVED'
     RETURNING attempt_id`,[attemptId,episodeId,shotId]);
   if(attempt.rows.length!==1)throw Error('Attempt not reserved');
   const shot=await client.query(
    `UPDATE stage_director_shot_jobs SET state='SUBMITTED',updated_at=now()
     WHERE episode_id=$1 AND shot_id=$2 AND attempt_id=$3 AND state='RESERVED'
     RETURNING shot_id`,[episodeId,shotId,attemptId]);
   if(shot.rows.length!==1)throw Error('Shot not reserved');
   await client.query('COMMIT');
   return {episodeId,shotId,attemptId,providerTaskId,state:'SUBMITTED'};
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e;}
  finally{client.release();}
 }
 async flagUnknown({episodeId,shotId,attemptId}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid uncertain submission');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const outbox=await client.query(
    `UPDATE stage_director_submission_outbox SET state='UNKNOWN',updated_at=now()
     WHERE attempt_id=$1 AND state='DISPATCHING' RETURNING attempt_id`,[attemptId]);
   if(outbox.rows.length!==1)throw Error('Outbox not dispatching');
   const attempt=await client.query(
    `UPDATE stage_director_attempts SET state='UNKNOWN'
     WHERE attempt_id=$1 AND episode_id=$2 AND shot_id=$3 AND state='RESERVED'
     RETURNING attempt_id`,[attemptId,episodeId,shotId]);
   if(attempt.rows.length!==1)throw Error('Attempt not reserved');
   const shot=await client.query(
    `UPDATE stage_director_shot_jobs SET state='UNKNOWN',updated_at=now()
     WHERE episode_id=$1 AND shot_id=$2 AND attempt_id=$3 AND state='RESERVED'
     RETURNING shot_id`,[episodeId,shotId,attemptId]);
   if(shot.rows.length!==1)throw Error('Shot not reserved');
   await client.query('COMMIT');
   return {episodeId,shotId,attemptId,state:'UNKNOWN',retryAllowed:false};
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e;}
  finally{client.release();}
 }
}
