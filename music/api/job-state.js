/**
 * RUNLU MUSIC STUDIO — pure job state transition helpers.
 * No database or provider integration yet.
 */
export const JOB_STATES=Object.freeze(["queued","running","succeeded","failed"]);
const transitions=Object.freeze({
 queued:new Set(["running","failed"]),
 running:new Set(["succeeded","failed"]),
 succeeded:new Set(),
 failed:new Set()
});
export class MusicJobStateError extends Error {
 constructor(message){super(message);this.name="MusicJobStateError";}
}
export function createQueuedJob({id,ownerId,createdAt}){
 if(typeof id!=="string"||!id.trim()||typeof ownerId!=="string"||!ownerId.trim())throw new MusicJobStateError("Job and owner IDs required");
 if(!Number.isFinite(createdAt)||createdAt<0)throw new MusicJobStateError("Valid timestamp required");
 return Object.freeze({id,ownerId,status:"queued",createdAt,updatedAt:createdAt,trackId:null,error:null});
}
export function transitionJob(job,next,{at,trackId=null,error=null}={}){
 if(!job||!JOB_STATES.includes(job.status)||!JOB_STATES.includes(next))throw new MusicJobStateError("Invalid job state");
 if(!transitions[job.status].has(next))throw new MusicJobStateError("Illegal transition: "+job.status+" -> "+next);
 if(!Number.isFinite(at)||at<job.updatedAt)throw new MusicJobStateError("Transition timestamp cannot go backwards");
 if(next==="succeeded"&&(typeof trackId!=="string"||!trackId.trim()))throw new MusicJobStateError("Successful job requires a persisted track ID");
 if(next==="failed"&&(!error||typeof error.code!=="string"||typeof error.message!=="string"))throw new MusicJobStateError("Failed job requires structured error");
 return Object.freeze({...job,status:next,updatedAt:at,trackId:next==="succeeded"?trackId:null,error:next==="failed"?Object.freeze({code:error.code,message:error.message}):null});
}
