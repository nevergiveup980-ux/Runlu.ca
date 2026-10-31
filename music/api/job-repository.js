/**
 * RUNLU MUSIC STUDIO — D1 job repository.
 * Not wired into public HTTP routes. Caller MUST authenticate user and derive ownerId server-side.
 * Database binding must be configured separately.
 */
const validId=v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
export class JobRepositoryError extends Error{
 constructor(code,message){super(message);this.name="JobRepositoryError";this.code=code;}
}
export function createJobRepository(db){
 if(!db||typeof db.prepare!=="function")throw new JobRepositoryError("DB_NOT_CONFIGURED","D1 binding required");
 return Object.freeze({
  async create({id,ownerId,idempotencyKey,prompt,language,durationSeconds,instrumental,now}){
   if(!validId(id)||!validId(ownerId)||!validId(idempotencyKey)||typeof prompt!=="string"||!prompt.trim()||prompt.length>1000||!["zh","en","fr","es"].includes(language)||![30,60].includes(durationSeconds)||typeof instrumental!=="boolean"||!Number.isSafeInteger(now)||now<0)
    throw new JobRepositoryError("INVALID_JOB","Invalid job request");
   // INSERT OR IGNORE supports owner-scoped idempotency without charging twice.
   await db.prepare("INSERT OR IGNORE INTO music_jobs (id,owner_id,idempotency_key,prompt,language,duration_seconds,instrumental,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'queued',?,?)")
    .bind(id,ownerId,idempotencyKey,prompt.trim(),language,durationSeconds,Number(instrumental),now,now).run();
   const job=await db.prepare("SELECT id,owner_id,status,track_id,error_code,error_message,created_at,updated_at FROM music_jobs WHERE owner_id=? AND idempotency_key=?")
    .bind(ownerId,idempotencyKey).first();
   if(!job)throw new JobRepositoryError("PERSISTENCE_FAILED","Job could not be retrieved");
   return job;
  },
  async getForOwner({id,ownerId}){
   if(!validId(id)||!validId(ownerId))throw new JobRepositoryError("INVALID_JOB","Invalid job identifier");
   return await db.prepare("SELECT id,owner_id,status,track_id,error_code,error_message,created_at,updated_at FROM music_jobs WHERE id=? AND owner_id=?")
    .bind(id,ownerId).first();
  },
  async markRunning({id,ownerId,now}){
   if(!validId(id)||!validId(ownerId)||!Number.isSafeInteger(now))throw new JobRepositoryError("INVALID_JOB","Invalid transition");
   const result=await db.prepare("UPDATE music_jobs SET status='running',updated_at=? WHERE id=? AND owner_id=? AND status='queued' AND updated_at<=?")
    .bind(now,id,ownerId,now).run();
   return result.meta?.changes===1;
  }
 });
}
