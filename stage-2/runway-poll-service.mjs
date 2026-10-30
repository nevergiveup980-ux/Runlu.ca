import {normalizeRunwayTask} from './runway-task.mjs';

// Server-side task polling; never returns provider output URLs to public callers.
export async function pollRunwayTask({providerTaskId, provider, repository}) {
  if (typeof providerTaskId !== 'string' || !providerTaskId.trim()) throw new Error('Provider task ID required');
  if (typeof provider?.getTask !== 'function' || typeof repository?.recordTaskState !== 'function') throw new Error('Dependencies required');
  const raw = await provider.getTask(providerTaskId);
  const task = normalizeRunwayTask(raw);
  if (task.providerTaskId !== providerTaskId) throw new Error('Provider task ID mismatch');
  // Persist state before returning any result; never expose temporary output URLs.
  await repository.recordTaskState(providerTaskId, task.state, task.privateOutputUrls);
  return {providerTaskId, state:task.state, requiresIngest:task.requiresIngest};
}
