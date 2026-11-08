// RUNLU MUSIC: isolated job orchestration core. NOT a deployed HTTP endpoint.
// Persistence, auth, credit reservation, provider, and storage are injected by the server.
// A caller must NOT trust a browser-supplied account ID or credits balance.
import {validateCreateRequest,validateIdempotencyKey,nextStatus,publicJobView} from "../music-studio-tools/job-contract.mjs";

export function createMusicService({store,provider,storage}){
  if(!store||!provider||!storage)throw Error("DEPENDENCIES_REQUIRED");
  async function submit({authenticatedUserId,body,idempotencyKey}){
    if(!authenticatedUserId)throw Error("UNAUTHENTICATED");
    const project=validateCreateRequest(body);
    const key=validateIdempotencyKey(idempotencyKey);
    // Must be a single DB transaction: unique (userId,key), reserve one credit,
    // persist project snapshot and queued job, then commit. Never reserve twice.
    return store.reserveAndCreate({userId:authenticatedUserId,key,project,credits:1});
  }
  async function read({authenticatedUserId,id}){
    if(!authenticatedUserId)throw Error("UNAUTHENTICATED");
    const job=await store.get(id);
    return publicJobView(job,authenticatedUserId);
  }
  async function process({id}){
    // Workers are trusted server-side callers only. Atomic claim prevents
    // duplicate provider requests when workers overlap or jobs are retried.
    const job=await store.claimQueued(id);
    if(!job)return {processed:false};
    try{
      const result=await provider.generate(job.project);
      if(!result||!(result.bytes instanceof Uint8Array)||result.bytes.length===0)throw Error("EMPTY_AUDIO");
      const objectKey=await storage.savePrivate({jobId:id,userId:job.userId,bytes:result.bytes,contentType:result.contentType});
      await store.finish({id,status:nextStatus("running","completed"),objectKey});
      return {processed:true,status:"completed"};
    }catch(error){
      // Provider might have accepted and billed a request even if its response
      // timed out. Mark uncertain, never auto-retry or auto-refund.
      await store.finish({id,status:nextStatus("running","needs_review"),errorCode:"PROVIDER_OR_STORAGE_UNCERTAIN"});
      return {processed:true,status:"needs_review"};
    }
  }
  return Object.freeze({submit,read,process});
}
