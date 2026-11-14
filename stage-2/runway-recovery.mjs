// RUNLU STAGE — recover paid provider tasks without blind retries.
// A not_submitted outcome must be recorded only when the caller can prove no request left the process.
export function decideRunwayRecovery({taskId=null, submissionOutcome, taskStatus=null}={}) {
  const outcomes = new Set(["not_submitted", "confirmed_submitted", "unknown"]);
  if (!outcomes.has(submissionOutcome)) throw new Error("Invalid submission outcome");
  if (submissionOutcome === "unknown") return {action:"HOLD_FOR_RECONCILIATION",reason:"Submission may have been billed"};
  if (submissionOutcome === "not_submitted") {
    if (taskId != null || taskStatus != null) return {action:"HOLD_FOR_RECONCILIATION",reason:"Contradictory unsubmitted task evidence"};
    return {action:"SUBMIT",reason:"Caller confirmed no provider request was sent"};
  }
  if (typeof taskId !== "string" || !taskId.trim()) return {action:"HOLD_FOR_RECONCILIATION",reason:"Missing provider task ID"};
  const states = new Set(["PENDING","RUNNING","THROTTLED","SUCCEEDED","FAILED","CANCELLED"]);
  if (taskStatus == null) return {action:"POLL",reason:"Resolve task status using saved provider task ID"};
  if (!states.has(taskStatus)) return {action:"HOLD_FOR_RECONCILIATION",reason:"Unknown provider task status"};
  if (["PENDING","RUNNING","THROTTLED"].includes(taskStatus)) return {action:"POLL",reason:"Existing provider task is still active"};
  if (taskStatus === "SUCCEEDED") return {action:"INGEST",reason:"Fetch and verify output before delivery"};
  return {action:"RECONCILE",reason:"Review provider charges before any retry"};
}
