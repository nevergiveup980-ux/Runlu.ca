// Framework-neutral trusted service boundary for STAGE private delivery.
// sessionOwnerId MUST come from verified server authentication middleware.
// This module never reads identity from request JSON or returns storage keys.
import {authorizeAuditedDownload} from "./download-audit.mjs";
import {revokeAuthenticatedDeliveryTicket} from "./revoke-delivery.mjs";
export function createPrivateDeliveryService({secret,revocations,audit,loadAssetAndJob,openPrivateObject}){
 if(typeof secret!=="string"||Buffer.byteLength(secret)<32)throw Error("Strong signing secret required");
 if(!revocations||typeof revocations.isRevoked!=="function"||typeof revocations.revoke!=="function")throw Error("Durable revocations required");
 if(!audit||typeof audit.record!=="function")throw Error("Durable audit required");
 if(typeof loadAssetAndJob!=="function"||typeof openPrivateObject!=="function")throw Error("Trusted storage adapters required");
 const identity=value=>{if(typeof value!=="string"||!value.trim())throw Error("Authenticated session required");return value;};
 const clock=now=>{if(!Number.isSafeInteger(now)||now<0)throw Error("Invalid clock");return now;};
 return Object.freeze({
  async openDownload({ticket,sessionOwnerId,now=Date.now()}){
   const requesterId=identity(sessionOwnerId);clock(now);
   const grant=await authorizeAuditedDownload({ticket,secret,requesterId,now,revocations,audit,loadAssetAndJob});
   // Only a trusted storage adapter receives the private key. No public URL.
   return openPrivateObject({storageKey:grant.storageKey,assetId:grant.assetId,ownerId:grant.ownerId});
  },
  async revokeDownload({ticket,sessionOwnerId,now=Date.now()}){
   return revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:identity(sessionOwnerId),now:clock(now),revocations});
  }
 });
}
