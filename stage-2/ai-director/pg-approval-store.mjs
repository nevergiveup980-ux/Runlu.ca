// Transactional approval and initial shot creation. No provider/API calls.
// Caller must use a trusted server-side PostgreSQL pool and apply migration first.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorApprovalStore {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async saveApprovedEpisode({episodeId,approval,plan,bible}){
  if(typeof episodeId!=='string'||!ID.test(episodeId)||
     approval?.reviewStatus!=='APPROVED'||!/^[a-f0-9]{64}$/.test(approval.contentDigest??'')||
     !plan||!bible)throw Error('Invalid approved episode');
  // Revalidate digest at the storage boundary, not just when UI approved.
  const {createApprovedShotJobs}=await import('./episode-review.mjs');
  const jobs=createApprovedShotJobs({approval,plan,bible});
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const result=await client.query(
    'INSERT INTO stage_director_approvals(episode_id,content_digest,reviewer_id,approved_snapshot) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT (episode_id) DO NOTHING RETURNING episode_id',
    [episodeId,approval.contentDigest,approval.reviewerId,JSON.stringify(approval)]
   );
   if(result.rows.length!==1)throw Error('Episode already approved; use a new revision ID');
   for(const job of jobs){
    await client.query(
     'INSERT INTO stage_director_shot_jobs(episode_id,shot_id,state,character_revision_ids) VALUES($1,$2,$3,$4::jsonb)',
     [episodeId,job.shotId,'READY',JSON.stringify(job.characterRevisionIds)]
    );
   }
   await client.query('COMMIT');
   return {episodeId,shotCount:jobs.length,contentDigest:approval.contentDigest};
  }catch(e){
   try{await client.query('ROLLBACK')}catch{}
   throw e;
  }finally{client.release();}
 }
}
