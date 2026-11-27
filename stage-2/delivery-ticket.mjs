// Stateless, short-lived private delivery tickets. The caller MUST derive
// requesterId from an authenticated server session, never from request JSON.
// The storage adapter must check this ticket and keep the bucket private.
import {createHmac,timingSafeEqual,randomBytes} from "node:crypto";
import {authorizeAssetDelivery} from "./delivery-auth.mjs";
const enc=value=>Buffer.from(JSON.stringify(value)).toString("base64url");
const mac=(payload,secret)=>createHmac("sha256",secret).update(payload).digest();
export function issueDeliveryTicket({asset,job,requesterId,secret,now=Date.now(),ttlSeconds=120}){
 if(typeof secret!=="string"||Buffer.byteLength(secret)<32)throw Error("Strong signing secret required");
 if(!Number.isSafeInteger(now)||now<0)throw Error("Invalid clock");
 if(!Number.isInteger(ttlSeconds)||ttlSeconds<1||ttlSeconds>300)throw Error("Ticket TTL exceeds policy");
 const grant=authorizeAssetDelivery({asset,job,requesterId});
 const body=enc({v:1,assetId:grant.assetId,ownerId:grant.ownerId,storageKey:grant.storageKey,exp:now+ttlSeconds*1000,nonce:randomBytes(16).toString("hex")});
 return body+"."+mac(body,secret).toString("base64url");
}
export function verifyDeliveryTicket({ticket,secret,requesterId,now=Date.now()}){
 if(typeof secret!=="string"||Buffer.byteLength(secret)<32)throw Error("Strong signing secret required");
 if(typeof ticket!=="string"||ticket.length>2048||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(ticket))throw Error("Invalid ticket");
 if(typeof requesterId!=="string"||!requesterId.trim()||!Number.isSafeInteger(now))throw Error("Invalid request identity");
 const [body,sig]=ticket.split(".");
 const expected=mac(body,secret),actual=Buffer.from(sig,"base64url");
 if(actual.toString("base64url")!==sig)throw Error("Noncanonical ticket signature");
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error("Invalid ticket signature");
 let payload;try{const raw=Buffer.from(body,"base64url");if(raw.toString("base64url")!==body)throw Error("Noncanonical ticket payload");payload=JSON.parse(raw.toString("utf8"));}catch{throw Error("Invalid ticket payload");}
 if(payload.v!==1||payload.ownerId!==requesterId||typeof payload.exp!=="number"||now>=payload.exp||payload.exp-now>300000)throw Error("Ticket expired or not authorized");
 if(typeof payload.assetId!=="string"||!/^asset_[A-Za-z0-9_-]{4,80}$/.test(payload.assetId)||typeof payload.storageKey!=="string"||!/^stage\/private\/ST[A-Z0-9-]{1,48}\/[a-f0-9]{64}\.mp4$/.test(payload.storageKey))throw Error("Invalid ticket scope");
 return Object.freeze({assetId:payload.assetId,storageKey:payload.storageKey,ownerId:payload.ownerId});
}
