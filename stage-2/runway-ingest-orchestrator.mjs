import {normalizeRunwayTask} from './runway-task.mjs';

// Internal worker orchestration. The injected services must provide secure
// downloading, actual media inspection and private object storage.
export async function processRunwayIngest({queue,provider,media,storage,workerId}) {
 if(!workerId || typeof queue?.claim!=='function' || typeof queue?.complete!=='function' ||
    typeof queue?.flagForReview!=='function' || typeof provider?.getTask!=='function' ||
    typeof media?.fetchAndVerify!=='function' || typeof storage?.savePrivate!=='function')
   throw Error('Missing worker dependencies');
 const job=await queue.claim(workerId);
 if(!job)return {state:'IDLE'};
 try {
  const task=normalizeRunwayTask(await provider.getTask(job.providerTaskId));
  if(task.providerTaskId!==job.providerTaskId || !task.requiresIngest || task.privateOutputUrls.length!==1)
   throw Error('Provider output not ready');
  const verified=await media.fetchAndVerify(task.privateOutputUrls[0]);
  if(!verified || verified.format!=='mp4' || verified.valid!==true)
   throw Error('Media verification failed');
  const asset=await storage.savePrivate({taskId:job.providerTaskId,verified});
  if(typeof asset?.storageKey!=='string' || !asset.storageKey)throw Error('Storage confirmation missing');
  await queue.complete(job.providerTaskId,workerId,asset.storageKey);
  return {state:'VERIFIED',providerTaskId:job.providerTaskId};
 }catch(error){
  // Never silently retry uncertain completed uploads.
  await queue.flagForReview(job.providerTaskId,workerId);
  return {state:'REVIEW_REQUIRED',providerTaskId:job.providerTaskId};
 }
}
