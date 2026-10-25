// One scheduled invocation, with a bounded number of retry attempts.
// Caller owns the external schedule; no timers or background loops here.
import {runDeliveryRateLimitMaintenance} from "./delivery-rate-limit-maintenance.mjs";
export async function runDeliveryRateLimitMaintenanceWithRetry({maxAttempts=2,onAttempt,...options}){
 if(!Number.isSafeInteger(maxAttempts)||maxAttempts<1||maxAttempts>3)throw Error("Invalid maintenance retry limit");
 if(onAttempt!==undefined&&typeof onAttempt!=="function")throw Error("Invalid maintenance attempt observer");
 let lastError;
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  try{
   const result=await runDeliveryRateLimitMaintenance(options);
   onAttempt?.({attempt,ok:true});
   return Object.freeze({...result,attempts:attempt});
  }catch(error){
   lastError=error;
   onAttempt?.({attempt,ok:false});
  }
 }
 throw lastError;
}
