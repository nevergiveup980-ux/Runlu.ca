// Production configuration wrapper: origin enforcement is mandatory.
// Local development tests can still instantiate the low-level adapter directly.
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
import {enforceDeliveryOrigin} from "./delivery-origin.mjs";
export function createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin,maxBodyBytes=4096,bodyTimeoutMs=5000,rateLimiter,getTrustedRateKey}){
 if(typeof allowedOrigin!=="string"||!allowedOrigin)throw Error("Production trusted HTTPS origin required");
 // Validate the deployment origin at startup, before binding any listener.
 enforceDeliveryOrigin({headers:{origin:allowedOrigin}},{allowedOrigin});
 if(!rateLimiter||rateLimiter.distributed!==true||typeof rateLimiter.allow!=="function"||typeof getTrustedRateKey!=="function")throw Error("Production shared trusted rate limiter required");
 return createDeliveryNodeHandler({handleDelivery,allowedOrigin,maxBodyBytes,bodyTimeoutMs,rateLimiter,getTrustedRateKey});
}
