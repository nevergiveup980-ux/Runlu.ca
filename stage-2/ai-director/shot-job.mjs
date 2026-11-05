// AI Director shot lifecycle, offline deterministic state transitions.
// Durable storage, leases and provider callbacks are separate production work.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
const transitions={
 DRAFT:['READY'],
 READY:['RESERVED','DRAFT'],
 RESERVED:['SUBMITTED','READY'],
 SUBMITTED:['SUCCEEDED','FAILED','UNKNOWN'],
 UNKNOWN:['SUCCEEDED','FAILED'],
 FAILED:['READY'],
 SUCCEEDED:[]
};
export function createShotJob({shotId,characterRevisionIds=[]}){
 if(typeof shotId!=='string'||!ID.test(shotId)||
 !Array.isArray(characterRevisionIds)||!characterRevisionIds.every(x=>typeof x==='string'&&ID.test(x)))
  throw Error('Invalid shot job');
 return {shotId,state:'DRAFT',attemptId:null,outputAssetId:null,
  characterRevisionIds:[...characterRevisionIds],failureReason:null,history:[]};
}
export function transitionShotJob(job,{to,attemptId=null,outputAssetId=null,failureReason=null}){
 if(!job||!Array.isArray(job.history)||!transitions[job.state]?.includes(to))
  throw Error('Invalid shot transition');
 if(to==='SUBMITTED'&&(!job.attemptId||!ID.test(job.attemptId)))throw Error('Reserved attempt required');
 if(to==='RESERVED'&&(!attemptId||!ID.test(attemptId)||job.history.some(h=>h.attemptId===attemptId)))throw Error('New attempt identity required');
 if(to==='SUCCEEDED'&&(!outputAssetId||!ID.test(outputAssetId)))throw Error('Verified output identity required');
 if(to==='FAILED'&&(typeof failureReason!=='string'||!failureReason.trim()||failureReason.length>500))
  throw Error('Failure reason required');
 const next={...job,state:to,history:[...job.history,{from:job.state,to,
  attemptId:to==='RESERVED'?attemptId:job.attemptId}]};
 if(to==='RESERVED'){next.attemptId=attemptId;next.failureReason=null;next.outputAssetId=null;}
 if(to==='SUCCEEDED')next.outputAssetId=outputAssetId;
 if(to==='FAILED')next.failureReason=failureReason;
 if(to==='READY'&&job.state==='FAILED')next.attemptId=null;
 return next;
}
export function shotRetryReady(job,{settledAttemptIds=[]}){
 if(job?.state!=='FAILED'||!job.attemptId||!settledAttemptIds.includes(job.attemptId))
  throw Error('Failed attempt must be financially reconciled before retry');
 return transitionShotJob(job,{to:'READY'});
}
