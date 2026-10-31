// Prevent overlapping maintenance calls within one Node.js process.
// Multi-instance schedulers must additionally enforce a distributed lock.
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
export function createDeliveryMaintenanceRunner(defaultOptions={}){
 let inFlight=false;
 return Object.freeze({
  async run(options={}){
   if(inFlight)return Object.freeze({ok:false,skipped:true,reason:"already_running"});
   inFlight=true;
   try{return await runDeliveryRateLimitMaintenanceWithRetry({...defaultOptions,...options});}
   finally{inFlight=false;}
  }
 });
}
