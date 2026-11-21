// Durable, idempotent PostgreSQL handoff for Runway video ingestion.
// Store only task identity; worker retrieves temporary signed URLs afresh.
export class PgRunwayIngestQueue {
 constructor(pool) {if(typeof pool?.query!=='function') throw Error('Pool required');this.pool=pool;}
 async enqueue({idempotencyKey,providerTaskId}) {
  if(typeof providerTaskId!=='string'||!providerTaskId.trim()||idempotencyKey!==providerTaskId) throw Error('Invalid ingest identity');
  const result=await this.pool.query(
   "INSERT INTO stage_ingest_jobs(provider,provider_task_id) SELECT 'runway',$1 WHERE EXISTS (SELECT 1 FROM stage_attempts WHERE provider='runway' AND provider_task_id=$1 AND submission_state='SUBMITTED' AND provider_poll_state='READY_FOR_INGEST') ON CONFLICT (provider,provider_task_id) DO NOTHING RETURNING provider_task_id",
   [providerTaskId]
  );
  if(result.rows.length===1)return {accepted:true,alreadyQueued:false};
  const existing=await this.pool.query(
   "SELECT state FROM stage_ingest_jobs WHERE provider='runway' AND provider_task_id=$1",
   [providerTaskId]
  );
  if(existing.rows.length!==1)throw Error('Ingest task not eligible');
  return {accepted:true,alreadyQueued:true};
 }
}
