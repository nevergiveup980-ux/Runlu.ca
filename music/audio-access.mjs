// Server-side audio access guard. This does not mint signed URLs itself.
// The authenticated server must supply its verified user ID and private storage adapter.
export async function getMusicAudioAccess({authenticatedUserId,jobId,store,storage,expiresIn=60}={}){
 if(typeof authenticatedUserId!=="string"||!authenticatedUserId)throw Error("UNAUTHENTICATED");
 if(typeof jobId!=="string"||!jobId)throw Error("INVALID_JOB_ID");
 if(!store||typeof store.get!=="function"||!storage||typeof storage.createSignedReadUrl!=="function")throw Error("DEPENDENCIES_REQUIRED");
 if(!Number.isInteger(expiresIn)||expiresIn<1||expiresIn>120)throw Error("INVALID_EXPIRY");
 const job=await store.get(jobId);
 // Return the same generic error for nonexistent and other-user jobs.
 if(!job||job.userId!==authenticatedUserId)throw Error("NOT_FOUND");
 if(job.status!=="completed"||job.audioStored!==true||typeof job.objectKey!=="string"||!job.objectKey.trim())throw Error("AUDIO_NOT_READY");
 // The object key comes from the trusted job record, never the browser.
 const signed=await storage.createSignedReadUrl({objectKey:job.objectKey,expiresIn});
 if(typeof signed!=="string"||!signed.startsWith("https://"))throw Error("AUDIO_LINK_UNAVAILABLE");
 return Object.freeze({url:signed,expires_in:expiresIn});
}
