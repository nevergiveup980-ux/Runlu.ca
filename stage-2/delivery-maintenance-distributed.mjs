// Session-scoped PostgreSQL advisory lock for one maintenance run across replicas.
// A dedicated checked-out client is essential: advisory locks belong to sessions.
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
const LOCK_A=0x53544732,LOCK_B=0x52415445; // STG2 / RATE
export async function runDeliveryMaintenanceDistributed({pool,...options}){
 if(!pool||typeof pool.connect!=="function")throw Error("PostgreSQL connection pool required");
 const client=await pool.connect();
 let acquired=false,uncertain=false,broken=false,connectionLost=false;
 const onConnectionError=()=>{connectionLost=true;broken=true;};
 client.on?.("error",onConnectionError);
 const guardedClient={query:async(...args)=>{
  if(connectionLost)throw Error("Maintenance database connection lost");
  const result=await client.query(...args);
  if(connectionLost)throw Error("Maintenance database connection lost");
  return result;
 }};
 try{
  // If the acquire query fails after reaching PostgreSQL, the session might
  // still own the lock. Discard that session rather than returning it to pool.
  uncertain=true;
  const lock=await client.query("SELECT pg_try_advisory_lock($1,$2) AS acquired",[LOCK_A,LOCK_B]);
  if(lock.rows.length!==1||typeof lock.rows[0].acquired!=="boolean")throw Error("Invalid advisory lock result");
  uncertain=false;
  if(!lock.rows[0].acquired)return Object.freeze({ok:false,skipped:true,reason:"already_running_elsewhere"});
  acquired=true;
  // Maintenance queries use the same checked-out connection as the lock.
  return await runDeliveryRateLimitMaintenanceWithRetry({...options,pool:guardedClient,shouldRetry:error=>!connectionLost&&(options.shouldRetry?.(error)??true)});
 }finally{
  try{
   if(acquired&&!connectionLost){
    // A failed/ambiguous unlock must never return a possibly locked session
    // to the pool. node-postgres release(true) destroys the connection.
    const unlocked=await client.query("SELECT pg_advisory_unlock($1,$2) AS released",[LOCK_A,LOCK_B]);
    if(unlocked.rows.length!==1||unlocked.rows[0].released!==true)throw Error("Failed to release maintenance advisory lock");
   }
  }catch(error){
   broken=true;
   throw error;
  }finally{
   client.removeListener?.("error",onConnectionError);
   client.release(broken||uncertain||connectionLost);
  }
 }
}
