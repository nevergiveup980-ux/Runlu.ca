import {normalizeRunwayTask} from './runway-task.mjs';

// Internal-only polling. Signed provider URLs must never reach public responses.
// A successful task MUST be handed to an authenticated private ingest queue.
export async function pollRunwayTask({providerTaskId, provider, repository, ingestQueue}) {
  if (typeof providerTaskId !== 'string' || !providerTaskId.trim()) throw new Error('Provider task ID required');
  if (typeof provider?.getTask !== 'function' || typeof repository?.recordTaskState !== 'function') throw new Error('Dependencies required');
  // Fail before querying a paid provider when ingest is not configured.
  if (typeof ingestQueue?.enqueue !== 'function') throw new Error('Private ingest queue required');
  const raw = await provider.getTask(providerTaskId);
  const task = normalizeRunwayTask(raw);
  if (task.providerTaskId !== providerTaskId) throw new Error('Provider task ID mismatch');
  await repository.recordTaskState(providerTaskId, task.state, task.privateOutputUrls);
  if (task.requiresIngest) {
    // Enqueue must durably accept the work or throw. Idempotency key is task ID.
    // The queue must keep provider URLs private, encrypted/short-lived as appropriate.
    await ingestQueue.enqueue({idempotencyKey:providerTaskId,providerTaskId,privateOutputUrls:task.privateOutputUrls});
  }
  return {providerTaskId, state:task.state, requiresIngest:task.requiresIngest};
}
