// Crash recovery inventory: observation only. Never submit or retry provider jobs.
// DISPATCHING may mean the provider charged before a process died.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorRecoveryInventory {
 constructor(pool){if(typeof pool?.query!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async inspect({episodeId,olderThanSeconds=300,limit=50}){
  if(!ID.test(episodeId??'')||!Number.isInteger(olderThanSeconds)||olderThanSeconds<30||
     !Number.isInteger(limit)||limit<1||limit>100)throw Error('Invalid recovery inventory request');
  const result=await this.pool.query(
   `SELECT o.attempt_id,o.state,o.provider_task_id,o.updated_at,
           a.shot_id,a.state AS attempt_state,s.state AS shot_state
    FROM stage_director_submission_outbox o
    JOIN stage_director_attempts a ON a.attempt_id=o.attempt_id
    JOIN stage_director_shot_jobs s ON s.episode_id=a.episode_id
       AND s.shot_id=a.shot_id AND s.attempt_id=a.attempt_id
    WHERE a.episode_id=$1 AND o.state IN ('DISPATCHING','UNKNOWN')
      AND o.updated_at < now()-($2::int * interval '1 second')
    ORDER BY o.updated_at,o.attempt_id LIMIT $3`,[episodeId,olderThanSeconds,limit]);
  if(!Array.isArray(result.rows))throw Error('Invalid recovery result');
  return result.rows.map(row=>{
   if(!ID.test(row.attempt_id??'')||!ID.test(row.shot_id??'')||
      !['DISPATCHING','UNKNOWN'].includes(row.state))
    throw Error('Invalid recovery record');
   return Object.freeze({
    attemptId:row.attempt_id,shotId:row.shot_id,state:row.state,
    providerTaskId:row.provider_task_id??null,updatedAt:row.updated_at,
    attemptState:row.attempt_state,shotState:row.shot_state,
    retryAllowed:false,requiresManualReconciliation:true
   });
  });
 }
}
