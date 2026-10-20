// Server-side revocation interface for delivery tickets.
// Production must implement this against a durable shared store (e.g. Redis/SQL).
// This in-memory implementation is suitable only for local tests.
import {createHash} from "node:crypto";
import {verifyDeliveryTicket} from "./delivery-ticket.mjs";
export function ticketFingerprint(ticket){
 if(typeof ticket!=="string"||!ticket)throw Error("Ticket required");
 return createHash("sha256").update(ticket).digest("hex");
}
export class InMemoryDeliveryRevocations{
 #revoked=new Map();
 revoke(ticket,{untilMs,now=Date.now()}={}){
  if(!Number.isSafeInteger(untilMs)||untilMs<=now)throw Error("Valid revocation expiry required");
  this.#revoked.set(ticketFingerprint(ticket),untilMs);
 }
 isRevoked(ticket,{now=Date.now()}={}){
  const key=ticketFingerprint(ticket),until=this.#revoked.get(key);
  if(until===undefined)return false;
  if(now>=until){this.#revoked.delete(key);return false;}
  return true;
 }
}
export function verifyRevocableDeliveryTicket({ticket,secret,requesterId,now=Date.now(),revocations}){
 if(!revocations||typeof revocations.isRevoked!=="function")throw Error("Revocation store required");
 const result=verifyDeliveryTicket({ticket,secret,requesterId,now});
 if(revocations.isRevoked(ticket,{now}))throw Error("Delivery ticket revoked");
 return result;
}
