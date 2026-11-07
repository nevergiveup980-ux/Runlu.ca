// Server-side private download decision. No public URL or file bytes exposed.
// Authentication middleware must provide requesterId; never trust client-supplied ownerId.
import {verifyRevocableDeliveryTicketAsync} from "./delivery-revocation.mjs";
import {authorizeAssetDelivery} from "./delivery-auth.mjs";
export async function authorizePrivateDownload({ticket,secret,requesterId,now=Date.now(),revocations,loadAssetAndJob}){
 if(typeof loadAssetAndJob!=="function")throw Error("Trusted asset loader required");
 const scope=await verifyRevocableDeliveryTicketAsync({ticket,secret,requesterId,now,revocations});
 const record=await loadAssetAndJob(scope.assetId);
 if(!record||!record.asset||!record.job)throw Error("Asset unavailable");
 const grant=authorizeAssetDelivery({asset:record.asset,job:record.job,requesterId});
 if(grant.storageKey!==scope.storageKey||grant.assetId!==scope.assetId)throw Error("Ticket scope no longer matches asset");
 // Return private storage key only to a trusted backend adapter.
 return Object.freeze({assetId:scope.assetId,storageKey:grant.storageKey,ownerId:requesterId});
}
