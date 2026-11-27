// Audited private download authorization. The trusted caller must supply
// authenticated requesterId and a durable audit sink. Never log bearer tickets.
import {authorizePrivateDownload} from "./private-download.mjs";
export async function authorizeAuditedDownload({audit, ...request}){
 if(!audit||typeof audit.record!=="function")throw Error("Durable download audit sink required");
 const grant=await authorizePrivateDownload(request);
 const result=await audit.record({
  event:"STAGE_DELIVERY_AUTHORIZED",
  assetId:grant.assetId,
  ownerId:grant.ownerId,
  occurredAt:new Date(request.now??Date.now()).toISOString()
 });
 if(result!==true)throw Error("Download audit not confirmed");
 return grant;
}
