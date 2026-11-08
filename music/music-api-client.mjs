// RUNLU MUSIC API client: no provider credentials or GitHub Actions in the browser.
// This module deliberately requires a separately deployed authenticated backend.
const ROOT="/api/music";
async function request(path,options={}){
  const response=await fetch(ROOT+path,{credentials:"same-origin",cache:"no-store",...options,headers:{"Accept":"application/json",...(options.headers||{})}});
  let body;try{body=await response.json()}catch{throw new Error("INVALID_SERVER_RESPONSE")}
  if(!response.ok)throw new Error(body?.error_code||"REQUEST_FAILED");
  return body;
}
export async function getCredits(){return request("/credits")}
export async function createSongJob(project,idempotencyKey){
  if(!/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey))throw new Error("INVALID_IDEMPOTENCY_KEY");
  return request("/jobs",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":idempotencyKey},body:JSON.stringify(project)});
}
export async function getSongJob(id){
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw new Error("INVALID_JOB_ID");
  return request("/jobs/"+encodeURIComponent(id));
}
export function songDownloadUrl(id){
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(id))throw new Error("INVALID_JOB_ID");
  return ROOT+"/jobs/"+encodeURIComponent(id)+"/audio";
}
