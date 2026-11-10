// Browser-side playback link lifecycle. No provider generation or billing calls.
// Caller injects a server endpoint that authenticates the current user.
export function createMusicPlaybackController({fetchAccess,clock=()=>Date.now(),safetyMs=5000}={}){
 if(typeof fetchAccess!=="function")throw Error("FETCH_ACCESS_REQUIRED");
 let current=null,inflight=null,generation=0,selectedJobId=null;
 function clear(){generation++;selectedJobId=null;current=null;inflight=null;}
 function getLinkExpiry(jobId){return current?.jobId===jobId?current.expiresAt:0;}
 async function getLink(jobId,{force=false}={}){
  if(typeof jobId!=="string"||!jobId)throw Error("INVALID_JOB_ID");
  if(selectedJobId!==jobId){generation++;selectedJobId=jobId;current=null;inflight=null;}
  if(!force&&current?.jobId===jobId&&clock()<current.validUntil)return current.url;
  if(inflight?.jobId===jobId)return inflight.promise;
  const requestGeneration=generation;
  const promise=(async()=>{
   const data=await fetchAccess(jobId);
   if(typeof data?.url!=="string"||!/^https:\/\//.test(data.url))throw Error("AUDIO_LINK_UNAVAILABLE");
   if(!Number.isInteger(data.expires_in)||data.expires_in<30||data.expires_in>120)throw Error("INVALID_EXPIRY");
   if(requestGeneration!==generation||selectedJobId!==jobId)throw Error("PLAYBACK_SESSION_CHANGED");
   current={jobId,url:data.url,expiresAt:clock()+data.expires_in*1000,validUntil:clock()+data.expires_in*1000-safetyMs};
   return data.url;
  })();
  inflight={jobId,promise};
  try{return await promise}finally{if(inflight?.promise===promise)inflight=null;}
 }
 return Object.freeze({getLink,getLinkExpiry,clear});
}
