// Settle actual provider charge atomically and retain an audit reference.
// UNKNOWN submissions must be reconciled before settling; no blind retries.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export class PgDirectorChargeSettlement {
 constructor(pool){if(typeof pool?.connect!=='function')throw Error('PostgreSQL pool required');this.pool=pool;}
 async settle({episodeId,attemptId,chargedCents,providerChargeReference,recordedBy}){
  if(![episodeId,attemptId,providerChargeReference,recordedBy].every(v=>typeof v==='string'&&ID.test(v))||
     !Number.isSafeInteger(chargedCents)||chargedCents<0)
   throw Error('Invalid charge settlement');
  const client=await this.pool.connect();
  try{
   await client.query('BEGIN');
   const budget=await client.query(
    'SELECT limit_cents FROM stage_director_budgets WHERE episode_id=$1 FOR UPDATE',[episodeId]);
   if(budget.rows.length!==1)throw Error('Approved budget missing');
   const attempt=await client.query(
    `SELECT state,estimated_cents FROM stage_director_attempts
     WHERE attempt_id=$1 AND episode_id=$2 FOR UPDATE`,[attemptId,episodeId]);
   if(attempt.rows.length!==1||attempt.rows[0].state!=='SUBMITTED')
    throw Error('Attempt not confirmed submitted; reconcile uncertain provider outcome first');
   const committed=await client.query(
    `SELECT COALESCE(SUM(CASE WHEN state='SETTLED' THEN charged_cents ELSE estimated_cents END),0) AS committed_cents
     FROM stage_director_attempts WHERE episode_id=$1`,[episodeId]);
   const limit=Number(budget.rows[0].limit_cents);
   const used=Number(committed.rows[0]?.committed_cents??0);
   const estimate=Number(attempt.rows[0].estimated_cents);
   if(![limit,used,estimate].every(Number.isSafeInteger)||limit<=0||used<0||estimate<0)
    throw Error('Invalid stored budget amounts');
   const exceedsApprovedBudget=used-estimate+chargedCents>limit;
   await client.query(
    `INSERT INTO stage_director_charge_audit(attempt_id,provider_charge_reference,charged_cents,recorded_by,exceeds_approved_budget,reconciliation_note)
     VALUES($1,$2,$3,$4,$5,$6)`,[attemptId,providerChargeReference,chargedCents,recordedBy,exceedsApprovedBudget,
     exceedsApprovedBudget?'Actual provider charge exceeded user-approved budget; manual review required':null]);
   const updated=await client.query(
    `UPDATE stage_director_attempts SET state='SETTLED',charged_cents=$3
     WHERE attempt_id=$1 AND episode_id=$2 AND state='SUBMITTED' RETURNING attempt_id`,
    [attemptId,episodeId,chargedCents]);
   if(updated.rows.length!==1)throw Error('Attempt settlement conflict');
   if(exceedsApprovedBudget){
    await client.query(
     `UPDATE stage_director_budgets SET spending_paused=true,
       pause_reason='Provider actual charge exceeded approved budget',paused_at=now()
      WHERE episode_id=$1`,[episodeId]);
   }
   await client.query('COMMIT');
   return {episodeId,attemptId,chargedCents,state:'SETTLED',exceedsApprovedBudget,requiresManualReview:exceedsApprovedBudget};
  }catch(e){try{await client.query('ROLLBACK')}catch{}throw e;}
  finally{client.release();}
 }
}
