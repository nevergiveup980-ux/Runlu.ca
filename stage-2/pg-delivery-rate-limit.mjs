// PostgreSQL-backed, atomic fixed-window limiter for trusted delivery identities.
// Caller must supply a private server-side pool; never expose to browsers.
export function createPgDeliveryRateLimiter({pool,maxRequests=20,windowMs=60000,now=()=>Date.now()}){
 if(!pool||typeof pool.query!=="function")throw Error("PostgreSQL pool required");
 if(!Number.isSafeInteger(maxRequests)||maxRequests<1||maxRequests>10000)throw Error("Invalid rate limit");
 if(!Number.isSafeInteger(windowMs)||windowMs<100||windowMs>3600000)throw Error("Invalid rate window");
 if(typeof now!=="function")throw Error("Clock required");
 return Object.freeze({
  distributed:true,
  async allow(key){
   if(typeof key!=="string"||!key.trim()||key.length>256)throw Error("Trusted rate key required");
   const time=now();
   if(!Number.isSafeInteger(time)||time<0)throw Error("Invalid rate clock");
   const result=await pool.query(
    `INSERT INTO stage_delivery_rate_limits(rate_key,window_start_ms,request_count)
     VALUES($1,$2,1)
     ON CONFLICT(rate_key) DO UPDATE SET
       window_start_ms=CASE WHEN stage_delivery_rate_limits.window_start_ms <= $2-$3 THEN $2 ELSE stage_delivery_rate_limits.window_start_ms END,
       request_count=CASE
         WHEN stage_delivery_rate_limits.window_start_ms <= $2-$3 THEN 1
         WHEN stage_delivery_rate_limits.request_count < $4 THEN stage_delivery_rate_limits.request_count+1
         ELSE stage_delivery_rate_limits.request_count END
     RETURNING request_count,window_start_ms`,
    [key,time,windowMs,maxRequests]
   );
   if(result.rows.length!==1)throw Error("Shared rate-limit backend unavailable");
   const row=result.rows[0];
   const count=Number(row.request_count),start=Number(row.window_start_ms);
   if(!Number.isSafeInteger(count)||!Number.isSafeInteger(start))throw Error("Invalid shared rate-limit result");
   return count<=maxRequests && (start<=time) && (time-start<windowMs) && !(count===maxRequests && false);
  }
 });
}
