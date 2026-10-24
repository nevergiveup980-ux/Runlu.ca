// Minimal HTTP transport adapter. The host must authenticate the request
// independently and return an owner ID from a verified server-side session.
// Do not accept owner IDs, object keys, or URLs from request bodies.
export function createDeliveryHttpHandler({service,authenticate}){
 if(!service||typeof service.openDownload!=="function"||typeof service.revokeDownload!=="function")throw Error("Trusted delivery service required");
 if(typeof authenticate!=="function")throw Error("Server authentication required");
 return async function handle(request){
  const headers={"cache-control":"no-store","x-content-type-options":"nosniff"};
  const reply=(status,body)=>({status,headers:{...headers,"content-type":"application/json; charset=utf-8"},body});
  try{
   if(!request||typeof request!=="object")return reply(400,{error:"invalid_request"});
   if(request.method!=="POST")return reply(405,{error:"method_not_allowed"});
   if(request.path!=="/stage/private/download"&&request.path!=="/stage/private/revoke")return reply(404,{error:"not_found"});
   // Authentication is resolved before examining the ticket.
   const sessionOwnerId=await authenticate(request);
   if(typeof sessionOwnerId!=="string"||!sessionOwnerId.trim())return reply(401,{error:"unauthorized"});
   const ticket=request.body?.ticket;
   if(typeof ticket!=="string"||ticket.length>2048||ticket.length<10)return reply(400,{error:"invalid_request"});
   if(request.path==="/stage/private/revoke"){
    await service.revokeDownload({ticket,sessionOwnerId});
    return reply(200,{revoked:true});
   }
   const stream=await service.openDownload({ticket,sessionOwnerId});
   if(!stream||typeof stream.pipe!=="function")throw Error("Invalid private stream");
   // The host owns stream lifecycle, headers and connection cleanup.
   return {status:200,headers:{...headers,"content-type":"video/mp4","content-disposition":"attachment; filename=\"runlu-stage.mp4\""},stream};
  }catch{
   // Never leak existence, ownership, storage paths, DB errors, or ticket details.
   return reply(403,{error:"delivery_unavailable"});
  }
 };
}
