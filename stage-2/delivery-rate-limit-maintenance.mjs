// Single-pass maintenance worker for shared STAGE delivery rate limits.
// Invoke from an authenticated scheduler with a private database connection.
// The caller controls frequency; this module never starts its own timer.
import {prunePgDeliveryRateLimits} from "./pg-delivery-rate-limit-cleanup.mjs";
export async function runDeliveryRateLimitMaintenance({pool,windowMs=60000,batchSize=500,now=Date.now(),logger}){
 if(logger!==undefined&&typeof logger!=="function")throw Error("Maintenance logger must be a function");
 const started=Date.now();
 try{
  const deleted=await prunePgDeliveryRateLimits({pool,windowMs,batchSize,now});
  const result=Object.freeze({ok:true,deleted,moreMayRemain:deleted===batchSize,durationMs:Math.max(0,Date.now()-started)});
  logger?.({event:"stage_delivery_rate_limit_cleanup",...result});
  return result;
 }catch(error){
  logger?.({event:"stage_delivery_rate_limit_cleanup",ok:false,deleted:0,durationMs:Math.max(0,Date.now()-started)});
  throw error;
 }
}
