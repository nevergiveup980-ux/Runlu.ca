// Session-scoped PostgreSQL advisory lock for one maintenance run across replicas.
// A dedicated checked-out client is essential: advisory locks belong to sessions.
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
const LOCK_A=0x53544732,LOCK_B=0x52415445; // STG2 / RATE
export async function runDeliveryMaintenanceDistributed({pool,...options}){
 if(!pool||typeof pool.connect!=="function")throw Error("PostgreSQL connection pool required");
 const client=await pool.connect();
 let acquired=false;
 try{
  const lock=await client.query("SELECT pg_try_advisory_lock($1,$2) AS acquired",[LOCK_A,LOCK_B]);
  if(lock.rows.length!==1||typeof lock.rows[0].acquired!=="boolean")throw Error("Invalid advisory lock result");
  if(!lock.rows[0].acquired)return Object.freeze({ok:false,skipped:true,reason:"already_running_elsewhere"});
  acquired=true;
  // All maintenance queries use this dedicated connection so the lock remains
  // held until the cleanup and bounded retries have finished.
  return await runDeliveryRateLimitMaintenanceWithRetry({...options,pool:client});
 }finally{
  try{
   if(acquired){
    const unlocked=await client.query("SELECT pg_advisory_unlock($1,$2) AS released",[LOCK_A,LOCK_B]);
    if(unlocked.rows.length!==1||unlocked.rows[0].released!==true)throw Error("Failed to release maintenance advisory lock");
   }
  }finally{client.release();}
 }
}
