/**
 * RUNLU MUSIC STUDIO — API scaffold.
 * NOT a music generation engine. No external provider has been configured.
 * Cloudflare Worker entry point. Deploy separately; never point production traffic here until tested.
 */
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const allowedLanguages=new Set(["zh","en","fr","es"]);
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/music/health" && request.method==="GET")
   return json({service:"runlu-music-api",status:"scaffold",generation_available:false});
  if(url.pathname==="/api/music/jobs" && request.method==="POST"){
   const length=Number(request.headers.get("content-length")||0);
   if(length>8192)return json({error:{code:"TOO_LARGE",message:"Request exceeds 8 KB"}},413);
   let body;
   try {body=await request.json()} catch {return json({error:{code:"BAD_JSON",message:"Valid JSON required"}},400)}
   if(!body || typeof body.prompt!=="string" || !body.prompt.trim() || body.prompt.length>1000 ||
      !allowedLanguages.has(body.language) || ![30,60].includes(body.duration_seconds) ||
      typeof body.instrumental!=="boolean" ||
      typeof body.idempotency_key!=="string" || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.idempotency_key))
    return json({error:{code:"INVALID_INPUT",message:"Invalid music job request"}},422);
   // Do not accept real jobs until authentication, quotas, persistent jobs, and provider adapter are installed.
   return json({error:{code:"GENERATION_NOT_CONFIGURED",message:"Music generation is not available yet. No charge or job was created."}},503,{"retry-after":"3600"});
  }
  if(url.pathname.startsWith("/api/music/"))return json({error:{code:"NOT_IMPLEMENTED",message:"Endpoint is not yet implemented"}},501);
  return json({error:{code:"NOT_FOUND",message:"Unknown route"}},404);
 }
};
