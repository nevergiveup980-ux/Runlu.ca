import {enforceDeliveryOrigin} from "./delivery-origin.mjs";
// Node.js HTTP integration: bounded request -> authenticated service -> stream.
// The host MUST add CSRF, rate limiting, TLS and a trusted authentication adapter.
import {readDeliveryJsonBody} from "./delivery-request-body.mjs";
import {writeDeliveryHttpResponse} from "./delivery-node-http.mjs";
export function createDeliveryNodeHandler({handleDelivery,maxBodyBytes=4096,bodyTimeoutMs=5000,allowedOrigin,rateLimiter,getTrustedRateKey}){
 if(typeof handleDelivery!=="function")throw Error("Trusted delivery handler required");
 if(!Number.isSafeInteger(maxBodyBytes)||maxBodyBytes<1||maxBodyBytes>65536)throw Error("Invalid body limit");
 if(!Number.isSafeInteger(bodyTimeoutMs)||bodyTimeoutMs<1||bodyTimeoutMs>30000)throw Error("Invalid body timeout");
 if(rateLimiter!==undefined&&(typeof rateLimiter.allow!=="function"||typeof getTrustedRateKey!=="function"))throw Error("Trusted rate limiter and key resolver required");
 return async function nodeHandler(req,res){
  const base={"cache-control":"no-store","x-content-type-options":"nosniff"};
  const json=(status,error)=>({status,headers:{...base,"content-type":"application/json; charset=utf-8"},body:{error}});
  let descriptor;
  try{
   const path=new URL(req.url??"/","http://localhost").pathname;
   if(req.method!=="POST")descriptor=json(405,"method_not_allowed");
   else if(path!=="/stage/private/download"&&path!=="/stage/private/revoke")descriptor=json(404,"not_found");
   else if(allowedOrigin!==undefined&&!enforceDeliveryOrigin(req,{allowedOrigin}))descriptor=json(403,"forbidden_origin");
   else if(rateLimiter&&!(await rateLimiter.allow(await getTrustedRateKey(req))))descriptor=json(429,"rate_limited");
   else{
    const body=await readDeliveryJsonBody(req,{maxBytes:maxBodyBytes,timeoutMs:bodyTimeoutMs});
    descriptor=await handleDelivery({method:req.method,path,body,headers:req.headers});
   }
  }catch{
   descriptor=json(400,"invalid_request");
  }
  await writeDeliveryHttpResponse(res,descriptor);
 };
}
