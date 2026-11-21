// Trusted-server read model for an episode's AI Director control center.
// No paid API calls and no mutations. Authorize episode access before calling.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorDashboard {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async getEpisode({episodeId}){
  if(typeof episodeId!=='string'||!ID.test(episodeId))throw Error('Invalid episode ID');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
   const budget=await client.query(
    `SELECT b.episode_id,b.limit_cents,b.spending_paused,b.pause_reason,b.confirmed_by,
            a.reviewer_id,a.created_at AS approved_at
     FROM stage_director_budgets b JOIN stage_director_approvals a ON a.episode_id=b.episode_id
     WHERE b.episode_id=$1`,[episodeId]);
   if(budget.rows.length!==1)throw Error('Episode not found or budget not approved');
   const shots=await client.query(
    `SELECT shot_id,state,attempt_id,output_asset_id,updated_at
     FROM stage_director_shot_jobs WHERE episode_id=$1 ORDER BY shot_id`,[episodeId]);
   const attempts=await client.query(
    `SELECT a.attempt_id,a.shot_id,a.state,a.estimated_cents,a.charged_cents,
            o.state AS submission_state,o.provider_task_id,
            c.exceeds_approved_budget
     FROM stage_director_attempts a
     LEFT JOIN stage_director_submission_outbox o ON o.attempt_id=a.attempt_id
     LEFT JOIN stage_director_charge_audit c ON c.attempt_id=a.attempt_id
     WHERE a.episode_id=$1 ORDER BY a.created_at,a.attempt_id`,[episodeId]);
   const b=budget.rows[0];
   const limit=Number(b.limit_cents);
   const shotIds=new Set();
   for(const shot of shots.rows){
    if(typeof shot.shot_id!=='string'||!ID.test(shot.shot_id)||shotIds.has(shot.shot_id))
     throw Error('Invalid stored shot identity');
    shotIds.add(shot.shot_id);
   }
   const attemptIds=new Set();
   let committed=0;
   for(const attempt of attempts.rows){
    if(typeof attempt.attempt_id!=='string'||!ID.test(attempt.attempt_id)||
       attemptIds.has(attempt.attempt_id)||!shotIds.has(attempt.shot_id))
     throw Error('Invalid stored attempt identity');
    attemptIds.add(attempt.attempt_id);
    const estimate=Number(attempt.estimated_cents);
    const charge=attempt.charged_cents===null?null:Number(attempt.charged_cents);
    if(!Number.isSafeInteger(estimate)||estimate<0||
       (charge!==null&&(!Number.isSafeInteger(charge)||charge<0))||
       (attempt.state==='SETTLED'&&charge===null))
     throw Error('Invalid stored financial amounts');
    committed+=attempt.state==='SETTLED'?charge:estimate;
    if(!Number.isSafeInteger(committed))throw Error('Invalid stored financial amounts');
   }
   if(!Number.isSafeInteger(limit)||limit<0||!Number.isSafeInteger(committed)||committed<0)
    throw Error('Invalid stored financial amounts');
   const hasUnknown=attempts.rows.some(a=>a.state==='UNKNOWN'||a.submission_state==='UNKNOWN');
   const hasOvercharge=attempts.rows.some(a=>a.exceeds_approved_budget===true);
   const snapshot={
    episodeId,approvedBy:b.reviewer_id,budgetConfirmedBy:b.confirmed_by,
    budget:{limitCents:limit,committedCents:committed,remainingCents:limit-committed,
      paused:b.spending_paused===true,pauseReason:b.pause_reason??null},
    alerts:{unknownProviderOutcome:hasUnknown,overBudgetCharge:hasOvercharge,
      requiresAttention:hasUnknown||hasOvercharge||b.spending_paused===true},
    shots:shots.rows.map(s=>({shotId:s.shot_id,state:s.state,attemptId:s.attempt_id??null,
      outputAssetId:s.output_asset_id??null,updatedAt:s.updated_at})),
    attempts:attempts.rows.map(a=>({attemptId:a.attempt_id,shotId:a.shot_id,state:a.state,
      estimateCents:Number(a.estimated_cents),chargedCents:a.charged_cents===null?null:Number(a.charged_cents),
      submissionState:a.submission_state??null,providerTaskId:a.provider_task_id??null,
      overBudget:a.exceeds_approved_budget===true}))
   };
   await client.query('COMMIT');
   return snapshot;
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e}
  finally{client.release()}
 }
}
