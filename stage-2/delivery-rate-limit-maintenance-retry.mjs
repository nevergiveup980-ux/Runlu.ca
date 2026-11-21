// One scheduled invocation, with a bounded number of retry attempts.
// Caller owns the external schedule; no timers or background loops here.
import {runDeliveryRateLimitMaintenance} from "./delivery-rate-limit-maintenance.mjs";
export async function runDeliveryRateLimitMaintenanceWithRetry({maxAttempts=2,onAttempt,shouldRetry=()=>true,...options}){
 if(!Number.isSafeInteger(maxAttempts)||maxAttempts<1||maxAttempts>3)throw Error("Invalid maintenance retry limit");
 if(onAttempt!==undefined&&typeof onAttempt!=="function")throw Error("Invalid maintenance attempt observer");
 if(shouldRetry!==undefined&&typeof shouldRetry!=="function")throw Error("Invalid maintenance retry predicate");
 if(typeof shouldRetry!=="function")throw Error("Invalid maintenance retry predicate");
 let lastError;
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  try{
   const result=await runDeliveryRateLimitMaintenance(options);
   onAttempt?.({attempt,ok:true});
   return Object.freeze({...result,attempts:attempt});
  }catch(error){
   lastError=error;
   onAttempt?.({attempt,ok:false});
   if(shouldRetry && !shouldRetry(error,attempt))throw error;
   if(!shouldRetry(error))throw error;
  }
 }
 throw lastError;
}
