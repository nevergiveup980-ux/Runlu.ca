// RUNLU MUSIC server-side job contract (pure logic, no provider calls).
// Intended for authenticated API routes; never trust a client-supplied userId or price.
export const STATES=Object.freeze(["queued","running","completed","failed","needs_review"]);
const TRANSITIONS=Object.freeze({
  queued:["running","failed"],
  running:["completed","failed","needs_review"],
  completed:[],failed:[],needs_review:[]
});
export function validateCreateRequest(body){
  if(!body||typeof body!=="object"||Array.isArray(body))throw new Error("INVALID_REQUEST");
  const {title,lyrics,voice,style,language}=body;
  if(typeof title!=="string"||!title.trim()||title.length>120)throw new Error("INVALID_TITLE");
  if(typeof lyrics!=="string"||lyrics.length>10000)throw new Error("INVALID_LYRICS");
  if(!["female","male","instrumental"].includes(voice))throw new Error("INVALID_VOICE");
  if(voice!=="instrumental"&&!lyrics.trim())throw new Error("LYRICS_REQUIRED");
  if(!["nostalgic","folk","piano","cinematic"].includes(style))throw new Error("INVALID_STYLE");
  if(!["zh","en","fr","es"].includes(language))throw new Error("INVALID_LANGUAGE");
  return Object.freeze({title:title.trim(),lyrics,voice,style,language});
}
export function validateIdempotencyKey(key){
  if(typeof key!=="string"||!/^[A-Za-z0-9_-]{16,128}$/.test(key))throw new Error("INVALID_IDEMPOTENCY_KEY");
  return key;
}
export function nextStatus(current,next){
  if(!STATES.includes(current)||!TRANSITIONS[current].includes(next))throw new Error("INVALID_TRANSITION");
  return next;
}
export function publicJobView(job,authenticatedUserId){
  if(!job||!authenticatedUserId||job.userId!==authenticatedUserId)throw new Error("NOT_FOUND");
  return Object.freeze({
    id:job.id,status:job.status,audio_available:job.status==="completed"&&job.audioStored===true,
    error_code:job.errorCode||null
  });
}
