// Production configuration wrapper: origin enforcement is mandatory.
// Local development tests can still instantiate the low-level adapter directly.
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
import {enforceDeliveryOrigin} from "./delivery-origin.mjs";
export function createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin,maxBodyBytes=4096}){
 if(typeof allowedOrigin!=="string"||!allowedOrigin)throw Error("Production trusted HTTPS origin required");
 // Validate the deployment origin at startup, before binding any listener.
 enforceDeliveryOrigin({headers:{origin:allowedOrigin}},{allowedOrigin});
 return createDeliveryNodeHandler({handleDelivery,allowedOrigin,maxBodyBytes});
}
