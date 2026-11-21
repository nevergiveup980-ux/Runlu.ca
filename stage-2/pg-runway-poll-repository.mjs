// PostgreSQL task polling state. Temporary provider output URLs are NOT stored
// in job events or returned to public clients.
export class PgRunwayPollRepository {
 constructor(pool) { if (typeof pool?.query !== 'function') throw Error('Pool required'); this.pool=pool; }
 async recordTaskState(providerTaskId,state,privateOutputUrls=[]) {
  if(typeof providerTaskId!=='string'||!providerTaskId.trim()) throw Error('Task ID required');
  if(!['WAITING','READY_FOR_INGEST','FAILED'].includes(state)) throw Error('Invalid state');
  if(!Array.isArray(privateOutputUrls)) throw Error('Invalid outputs');
  if(state==='READY_FOR_INGEST' && (!privateOutputUrls.length || !privateOutputUrls.every(x=>typeof x==='string'&&x.startsWith('https://')))) throw Error('Missing private outputs');
  const result=await this.pool.query(
   "UPDATE stage_attempts SET provider_poll_state=$2,last_polled_at=NOW(),updated_at=NOW() WHERE provider='runway' AND provider_task_id=$1 AND submission_state='SUBMITTED' AND status='SUBMITTED' RETURNING id",
   [providerTaskId,state]
  );
  if(result.rows.length!==1) throw Error('Task not eligible for polling update');
  return {recorded:true};
 }
}
