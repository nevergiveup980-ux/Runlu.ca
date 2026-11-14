// Production rate limiting adapter. A shared backend must perform an atomic
// increment/check across all application instances (e.g. Redis or PostgreSQL).
// Never derive keys from untrusted client headers.
export function createSharedDeliveryRateLimiter({consume}){
 if(typeof consume!=="function")throw Error("Atomic shared rate-limit operation required");
 return Object.freeze({
  distributed:true,
  async allow(key){
   if(typeof key!=="string"||!key.trim()||key.length>256)throw Error("Trusted rate key required");
   const allowed=await consume(key);
   if(typeof allowed!=="boolean")throw Error("Shared rate-limit result must be boolean");
   return allowed;
  }
 });
}
