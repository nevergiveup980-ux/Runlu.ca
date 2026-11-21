// Trusted revocation entrypoint. Never accept ownerId, assetId, or expiry
// from an untrusted request body: derive all three from a verified ticket.
// requesterId must come from server-side authentication middleware.
import {verifyDeliveryTicket} from "./delivery-ticket.mjs";
export async function revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId,now=Date.now(),revocations}){
 if(!revocations||typeof revocations.revoke!=="function")throw Error("Durable revocation store required");
 const grant=verifyDeliveryTicket({ticket,secret,requesterId,now});
 const body=ticket.split(".")[0];
 const payload=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
 if(!Number.isSafeInteger(payload.exp)||payload.exp<=now||payload.exp-now>300000)throw Error("Invalid signed ticket expiry");
 await revocations.revoke(ticket,{ownerId:grant.ownerId,assetId:grant.assetId,untilMs:payload.exp,now});
 return Object.freeze({revoked:true,assetId:grant.assetId});
}
