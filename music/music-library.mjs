// RUNLU MUSIC: server-side "My Music Library" read model.
// Store methods must enforce owner filtering at the database layer as well.
// Do not return private object keys, lyrics, prompts or provider credentials.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LIMIT=50;
function user(id){if(typeof id!=="string"||!UUID.test(id))throw Error("UNAUTHENTICATED");return id}
function jobId(id){if(typeof id!=="string"||!UUID.test(id))throw Error("INVALID_JOB_ID");return id}
function cleanJob(job,owner){
 if(!job||job.userId!==owner)throw Error("NOT_FOUND");
 return Object.freeze({
   id:job.id,
   title:typeof job.project?.title==="string"?job.project.title.slice(0,120):"Untitled",
   language:typeof job.project?.language==="string"?job.project.language:"zh",
   voice:typeof job.project?.voice==="string"?job.project.voice:"instrumental",
   status:job.status,
   audio_available:job.status==="completed"&&!!job.objectKey,
   version:job.project?.version === "V2" ? "V2" : "V1",
   duration: Number.isFinite(job.duration) ? job.duration : null,
   download_status:job.status==="completed"&&job.objectKey?"available":"unavailable",
   created_at:job.createdAt
 });
}
export function createMusicLibrary({store,storage}){
 if(typeof store?.listOwned!=="function"||typeof store?.getOwned!=="function"||
    typeof storage?.createDownload!=="function")throw Error("LIBRARY_DEPENDENCIES_REQUIRED");
 return Object.freeze({
   async list({authenticatedUserId,limit=20,before=null}){
     const owner=user(authenticatedUserId);
     if(!Number.isInteger(limit)||limit<1||limit>MAX_LIMIT)throw Error("INVALID_LIMIT");
     // Cursor is a server-validated ISO timestamp + UUID tuple; never accept SQL fragments.
     if(before!==null&&(typeof before!=="string"||before.length>128))throw Error("INVALID_CURSOR");
     const rows=await store.listOwned({userId:owner,limit:limit+1,before});
     if(!Array.isArray(rows))throw Error("INVALID_STORE_RESPONSE");
     const page=rows.slice(0,limit).map(j=>cleanJob(j,owner));
     const hasMore=rows.length>limit;
     return {items:page,has_more:hasMore,next_cursor:hasMore&&page.length?store.cursorFor(page[page.length-1]):null};
   },
   async download({authenticatedUserId,id}){
     const owner=user(authenticatedUserId),safeId=jobId(id);
     // Always fetch using owner-scoped query, not by ID alone.
     const job=await store.getOwned({userId:owner,id:safeId});
     if(!job||job.userId!==owner)throw Error("NOT_FOUND");
     if(job.status!=="completed"||!job.objectKey)throw Error("AUDIO_NOT_READY");
     return storage.createDownload({userId:owner,jobId:safeId,storedPath:job.objectKey,expiresIn:120,title:cleanJob(job,owner).title,version:cleanJob(job,owner).version});
   }
 });
}
