// Local single-process limiter for STAGE private delivery endpoints.
// Production multi-instance deployments require a shared durable limiter.
export function createDeliveryRateLimiter({maxRequests=20,windowMs=60000,now=()=>Date.now()}={}){
 if(!Number.isSafeInteger(maxRequests)||maxRequests<1||maxRequests>10000)throw Error("Invalid rate limit");
 if(!Number.isSafeInteger(windowMs)||windowMs<100||windowMs>3600000)throw Error("Invalid rate window");
 if(typeof now!=="function")throw Error("Clock required");
 const buckets=new Map();
 return Object.freeze({
  allow(key){
   if(typeof key!=="string"||!key.trim()||key.length>256)throw Error("Trusted rate key required");
   const time=now();
   if(!Number.isSafeInteger(time)||time<0)throw Error("Invalid rate clock");
   const current=buckets.get(key);
   if(!current||time>=current.start+windowMs||time<current.start){
    buckets.set(key,{start:time,count:1});return true;
   }
   if(current.count>=maxRequests)return false;
   current.count++;return true;
  },
  clear(){buckets.clear();}
 });
}
