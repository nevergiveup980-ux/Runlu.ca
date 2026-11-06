// AI Director PostgreSQL job claim: one READY shot can be claimed once.
// The claim only reserves a local job; provider calls require separate budget authorization.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorShotStore {
 constructor(pool){if(typeof pool?.query!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async claim({episodeId,shotId,attemptId}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid shot claim identity');
  const result=await this.pool.query(
   `UPDATE stage_director_shot_jobs SET state='RESERVED',attempt_id=$3,updated_at=now()
    WHERE episode_id=$1 AND shot_id=$2 AND state='READY'
    RETURNING episode_id,shot_id,state,attempt_id`,
   [episodeId,shotId,attemptId]
  );
  if(result.rows.length!==1)throw Error('Shot unavailable or already claimed');
  return result.rows[0];
 }
 async markSubmitted({episodeId,shotId,attemptId}){
  return this.#transition({episodeId,shotId,attemptId,from:'RESERVED',to:'SUBMITTED'});
 }
 async markUnknown({episodeId,shotId,attemptId}){
  return this.#transition({episodeId,shotId,attemptId,from:'SUBMITTED',to:'UNKNOWN'});
 }
 async markFailed({episodeId,shotId,attemptId}){
  return this.#transition({episodeId,shotId,attemptId,from:'SUBMITTED',to:'FAILED'});
 }
 async markSucceeded({episodeId,shotId,attemptId,outputAssetId}){
  if(typeof outputAssetId!=='string'||!ID.test(outputAssetId))throw Error('Verified asset identity required');
  return this.#transition({episodeId,shotId,attemptId,from:'SUBMITTED',to:'SUCCEEDED',outputAssetId});
 }
 async #transition({episodeId,shotId,attemptId,from,to,outputAssetId=null}){
  if(![episodeId,shotId,attemptId].every(v=>typeof v==='string'&&ID.test(v)))
   throw Error('Invalid transition identity');
  const result=await this.pool.query(
   `UPDATE stage_director_shot_jobs SET state=$4,output_asset_id=COALESCE($5,output_asset_id),updated_at=now()
    WHERE episode_id=$1 AND shot_id=$2 AND attempt_id=$3 AND state=$6
    RETURNING episode_id,shot_id,state,attempt_id,output_asset_id`,
   [episodeId,shotId,attemptId,to,outputAssetId,from]
  );
  if(result.rows.length!==1)throw Error('Stale or invalid shot transition');
  return result.rows[0];
 }
}
