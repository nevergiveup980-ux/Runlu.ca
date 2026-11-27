// RUNLU STAGE — PostgreSQL provider submission journal.
// The caller must commit markSubmitting BEFORE making any external API call.
// Only a confirmed provider response may call markSubmitted.
export class PgProviderTaskRepository {
  constructor(pool) {
    if (typeof pool?.query !== "function") throw new Error("Pool with query required");
    this.pool = pool;
  }
  async markSubmitting(attemptId) {
    const r = await this.pool.query(
      "UPDATE stage_attempts SET submission_state='SUBMITTING', status='SUBMITTING', updated_at=NOW() WHERE id=$1 AND submission_state='NOT_SENT' AND status='RESERVED' RETURNING id",
      [attemptId]
    );
    if (r.rows.length !== 1) throw new Error("Attempt not eligible for submission");
    return {attemptId, submissionState:"SUBMITTING"};
  }
  async markSubmitted(attemptId, providerTaskId) {
    if (typeof providerTaskId !== "string" || !providerTaskId.trim()) throw new Error("Provider task ID required");
    const r = await this.pool.query(
      "UPDATE stage_attempts SET provider_task_id=$2, submission_state='SUBMITTED', status='SUBMITTED', submitted_at=NOW(), updated_at=NOW() WHERE id=$1 AND submission_state='SUBMITTING' AND provider_task_id IS NULL RETURNING id",
      [attemptId,providerTaskId]
    );
    if (r.rows.length !== 1) throw new Error("Submission needs reconciliation");
    return {attemptId,providerTaskId,submissionState:"SUBMITTED"};
  }
  async markUnknown(attemptId) {
    const r = await this.pool.query(
      "UPDATE stage_attempts SET submission_state='UNKNOWN', status='RECONCILIATION_REQUIRED', updated_at=NOW() WHERE id=$1 AND submission_state='SUBMITTING' RETURNING id",
      [attemptId]
    );
    return {updated:r.rows.length===1};
  }
  async listUnresolved(limit=100) {
    if (!Number.isInteger(limit)||limit<1||limit>500) throw new Error("Invalid limit");
    const r = await this.pool.query(
      "SELECT id,job_id,provider,provider_task_id,submission_state,status,created_at,submitted_at FROM stage_attempts WHERE submission_state IN ('SUBMITTING','UNKNOWN','SUBMITTED') ORDER BY created_at ASC LIMIT $1",
      [limit]
    );
    return r.rows;
  }
}
