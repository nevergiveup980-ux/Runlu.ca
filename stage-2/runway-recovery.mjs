// RUNLU STAGE — conservative retry decision for external video tasks.
// Never submit a second paid generation merely because a request timed out.
export function decideRunwayRecovery({taskId=null, submissionOutcome, taskStatus=null}={}) {
  const validOutcomes = new Set(["not_submitted", "confirmed_submitted", "unknown"]);
  if (!validOutcomes.has(submissionOutcome)) throw new Error("Invalid submission outcome");
  if (submissionOutcome === "not_submitted") return {action:"SUBMIT",reason:"No provider request was sent"};
  if (submissionOutcome === "unknown") return {action:"HOLD_FOR_RECONCILIATION",reason:"Submission may have been billed"};
  if (typeof taskId !== "string" || !taskId.trim()) return {action:"HOLD_FOR_RECONCILIATION",reason:"Missing provider task ID"};
  const states = new Set(["PENDING","RUNNING","THROTTLED","SUCCEEDED","FAILED","CANCELLED"]);
  if (!states.has(taskStatus)) return {action:"POLL",reason:"Resolve task status using saved provider task ID"};
  if (["PENDING","RUNNING","THROTTLED"].includes(taskStatus)) return {action:"POLL",reason:"Existing provider task is still active"};
  if (taskStatus === "SUCCEEDED") return {action:"INGEST",reason:"Fetch and verify output before delivery"};
  return {action:"RECONCILE",reason:"Review provider charges before any retry"};
}
