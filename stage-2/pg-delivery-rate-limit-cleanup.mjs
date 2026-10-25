// Bounded cleanup of expired PostgreSQL delivery rate-limit windows.
// Run from a trusted server-side scheduled worker, never in a browser.
export async function prunePgDeliveryRateLimits({pool,windowMs=60000,now=Date.now(),batchSize=500}){
 if(!pool||typeof pool.query!=="function")throw Error("PostgreSQL pool required");
 if(!Number.isSafeInteger(windowMs)||windowMs<100||windowMs>3600000)throw Error("Invalid rate window");
 if(!Number.isSafeInteger(now)||now<0)throw Error("Invalid rate clock");
 if(!Number.isSafeInteger(batchSize)||batchSize<1||batchSize>5000)throw Error("Invalid cleanup batch size");
 // A generous two-window grace period prevents deleting counters still
 // relevant to another app instance with minor clock skew.
 const cutoff=now-2*windowMs;
 const result=await pool.query(
  `DELETE FROM stage_delivery_rate_limits WHERE ctid IN (
     SELECT ctid FROM stage_delivery_rate_limits
     WHERE window_start_ms < $1
     LIMIT $2
   ) RETURNING rate_key`,
  [cutoff,batchSize]
 );
 if(!Array.isArray(result.rows))throw Error("Invalid cleanup result");
 return result.rows.length;
}
