// End-to-end private delivery authorization with real disposable PostgreSQL.
// Does not contact cloud storage or paid media providers.
import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {PgDeliveryAudit} from "./pg-delivery-audit.mjs";
import {PgDeliveryRevocations} from "./pg-delivery-revocations.mjs";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {authorizeAuditedDownload} from "./download-audit.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL: issue, authorize, audit, revoke, and deny private download",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:3});
 try{
  await pool.query(await readFile(new URL("./003_delivery_revocations.sql",import.meta.url),"utf8"));
  await pool.query(await readFile(new URL("./004_delivery_audit.sql",import.meta.url),"utf8"));
  const now=Date.now(),ownerId="owner-"+randomUUID(),assetId="asset_"+randomUUID().replaceAll("-","");
  const sha256="b".repeat(64),job={id:"STAGE-200",ownerId,status:"COMPLETED"};
  const asset={id:assetId,jobId:job.id,ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-200/"+sha256+".mp4"};
  const secret="integration-only-strong-delivery-signing-secret";
  const ticket=issueDeliveryTicket({asset,job,requesterId:ownerId,secret,now,ttlSeconds:120});
  const revocations=new PgDeliveryRevocations(pool),audit=new PgDeliveryAudit(pool);
  const request={ticket,secret,requesterId:ownerId,now:now+1000,revocations,audit,loadAssetAndJob:async id=>id===assetId?{asset,job}:null};
  const granted=await authorizeAuditedDownload(request);
  assert.equal(granted.assetId,assetId);
  assert.equal(granted.storageKey,asset.storageKey);
  const count=async()=>Number((await pool.query("SELECT count(*)::int AS n FROM stage_delivery_audit WHERE owner_id=$1 AND asset_id=$2",[ownerId,assetId])).rows[0].n);
  assert.equal(await count(),1);
  await assert.rejects(authorizeAuditedDownload({...request,requesterId:"another-owner"}),/not authorized/);
  assert.equal(await count(),1,"unauthorized request must not write success audit");
  await revocations.revoke(ticket,{ownerId,assetId,untilMs:now+120000,now});
  await assert.rejects(authorizeAuditedDownload(request),/revoked/);
  assert.equal(await count(),1,"revoked request must not write success audit");
  await assert.rejects(authorizeAuditedDownload({...request,loadAssetAndJob:async()=>({asset:{...asset,state:"QUARANTINED"},job})}),/revoked/);
 }finally{await pool.end();}
});
