// Read-only PostgreSQL keyset pagination query plan. Not connected to a live endpoint.
// A server must authenticate, authorize the episode, and decode/verify its own
// tamper-resistant cursor before supplying the trusted after tuple.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export function buildRecoveryPageQuery({episodeId,olderThanSeconds=300,pageSize=50,after=null}={}){
 if(!ID.test(episodeId??'')||!Number.isInteger(olderThanSeconds)||olderThanSeconds<30||
    !Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw Error('Invalid recovery page query');
 if(after!==null&&(!after||!ID.test(after.attemptId??'')||
    typeof after.updatedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(after.updatedAt)||
    !Number.isFinite(Date.parse(after.updatedAt))))throw Error('Invalid recovery keyset');
 const values=[episodeId,olderThanSeconds,pageSize+1];
 let keyset='';
 if(after!==null){
  values.push(after.updatedAt,after.attemptId);
  keyset=' AND (o.updated_at,o.attempt_id) > ($4::timestamptz,$5::text)';
 }
 return Object.freeze({
  text:`SELECT o.attempt_id,o.state,o.provider_task_id,o.updated_at,
       a.shot_id,a.state AS attempt_state,s.state AS shot_state
 FROM stage_director_submission_outbox o
 JOIN stage_director_attempts a ON a.attempt_id=o.attempt_id
 JOIN stage_director_shot_jobs s ON s.episode_id=a.episode_id
   AND s.shot_id=a.shot_id AND s.attempt_id=a.attempt_id
 WHERE a.episode_id=$1 AND o.state IN ('DISPATCHING','UNKNOWN')
   AND o.updated_at < now()-($2::int * interval '1 second')${keyset}
 ORDER BY o.updated_at,o.attempt_id LIMIT $3`,
  values:Object.freeze(values)
 });
}
export function sliceRecoveryPage(rows,pageSize){
 if(!Array.isArray(rows)||!Number.isInteger(pageSize)||pageSize<1||pageSize>100||
    rows.length>pageSize+1)throw Error('Invalid recovery page rows');
 return Object.freeze({rows:rows.slice(0,pageSize),hasMore:rows.length>pageSize});
}
