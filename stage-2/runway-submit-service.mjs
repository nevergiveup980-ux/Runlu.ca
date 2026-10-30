// RUNLU STAGE — internal orchestration only. No network client or credentials here.
// Callers must use a durable PostgreSQL repository and a server-side provider client.
export async function submitRunwayAttempt({attemptId, repository, provider, request}) {
  if (typeof attemptId !== 'string' || !attemptId.trim()) throw new Error('Attempt ID required');
  if (typeof repository?.markSubmitting !== 'function' ||
      typeof repository?.markSubmitted !== 'function' ||
      typeof repository?.markUnknown !== 'function' ||
      typeof provider?.createTask !== 'function') throw new Error('Dependencies required');

  // The database write must finish before the first external request is attempted.
  await repository.markSubmitting(attemptId);
  let task;
  try {
    task = await provider.createTask(request);
  } catch (error) {
    // A timeout or transport failure cannot prove the provider did not bill us.
    try { await repository.markUnknown(attemptId); }
    catch (journalError) {
      throw new AggregateError([error, journalError], 'Provider outcome and journal state uncertain');
    }
    return {state:'RECONCILIATION_REQUIRED',attemptId};
  }
  if (!task || typeof task.id !== 'string' || !task.id.trim()) {
    await repository.markUnknown(attemptId);
    return {state:'RECONCILIATION_REQUIRED',attemptId};
  }
  // If this write fails, the persisted SUBMITTING state prevents blind retry.
  await repository.markSubmitted(attemptId,task.id);
  return {state:'SUBMITTED',attemptId,providerTaskId:task.id};
}
