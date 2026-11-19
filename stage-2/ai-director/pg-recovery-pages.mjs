// Server-side, read-only keyset query. Caller must authorize episode before invoking.
// Cursor is a validated server-side tuple, never a client-provided SQL fragment.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorRecoveryPages {
 constructor(pool){if(typeof pool?.query!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async inspectPage({episodeId,pageSize=50,olderThanSeconds=300,after=null}={}){
  if(!ID.test(episodeId??'')||!Number.isInteger(pageSize)||pageSize<1||pageSize>100||
    !Number.isInteger(olderThanSeconds)||olderThanSeconds<30||
    (after!==null&&(!after||!ID.test(after.attemptId??'')||
      typeof after.updatedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z$/.test(after.updatedAt)||
      !Number.isFinite(Date.parse(after.updatedAt)))))throw Error('Invalid recovery page query');
  const result=await this.pool.query(
   `SELECT o.attempt_id,o.state,o.provider_task_id,o.updated_at,
           a.shot_id,a.state AS attempt_state,s.state AS shot_state
    FROM stage_director_submission_outbox o
    JOIN stage_director_attempts a ON a.attempt_id=o.attempt_id
    JOIN stage_director_shot_jobs s ON s.episode_id=a.episode_id
       AND s.shot_id=a.shot_id AND s.attempt_id=a.attempt_id
    WHERE a.episode_id=$1 AND o.state IN ('DISPATCHING','UNKNOWN')
      AND o.updated_at < now()-($2::int * interval '1 second')
      AND ($3::timestamptz IS NULL OR (o.updated_at,o.attempt_id)>($3::timestamptz,$4::text))
    ORDER BY o.updated_at,o.attempt_id LIMIT $5`,
   [episodeId,olderThanSeconds,after?.updatedAt??null,after?.attemptId??null,pageSize+1]);
  if(!Array.isArray(result.rows))throw Error('Invalid recovery page result');
  const rows=result.rows;
  if(rows.length>pageSize+1)throw Error('Oversized recovery page result');
  const visible=rows.slice(0,pageSize);
  const items=visible.map(row=>{
   if(!ID.test(row.attempt_id??'')||!ID.test(row.shot_id??'')||
     !['DISPATCHING','UNKNOWN'].includes(row.state))throw Error('Invalid recovery row');
   return Object.freeze({attemptId:row.attempt_id,shotId:row.shot_id,state:row.state,
     providerTaskId:row.provider_task_id??null,retryAllowed:false,requiresManualReconciliation:true});
  });
  const last=visible.at(-1);
  const updatedAt=last?.updated_at instanceof Date?last.updated_at.toISOString():last?.updated_at;
  if(rows.length>pageSize&&(!last||typeof updatedAt!=='string'||!Number.isFinite(Date.parse(updatedAt))))
   throw Error('Invalid recovery cursor source');
  return Object.freeze({items,hasMore:rows.length>pageSize,
    nextKey:rows.length>pageSize?Object.freeze({updatedAt,attemptId:last.attempt_id}):null});
 }
}
