// Real PostgreSQL delivery revocation integration: disposable CI database only.
import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {PgDeliveryRevocations} from "./pg-delivery-revocations.mjs";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {verifyRevocableDeliveryTicketAsync} from "./delivery-revocation.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL: private delivery ticket revocation survives adapter instances",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:3});
 try{
  await pool.query(await readFile(new URL("./003_delivery_revocations.sql",import.meta.url),"utf8"));
  const secret="test-only-postgres-signing-secret-strong",sha256="a".repeat(64);
  const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
  const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
  const now=Date.now(),ticket=issueDeliveryTicket({asset,job,requesterId:job.ownerId,secret,now,ttlSeconds:120});
  const first=new PgDeliveryRevocations(pool),second=new PgDeliveryRevocations(pool);
  const request={ticket,secret,requesterId:job.ownerId,now:now+1000};
  assert.equal((await verifyRevocableDeliveryTicketAsync({...request,revocations:first})).assetId,asset.id);
  await first.revoke(ticket,{ownerId:job.ownerId,assetId:asset.id,now,untilMs:now+120000});
  assert.equal(await second.isRevoked(ticket,{now:now+1000}),true);
  await assert.rejects(verifyRevocableDeliveryTicketAsync({...request,revocations:second}),/revoked/);
  await first.revoke(ticket,{ownerId:job.ownerId,assetId:asset.id,now,untilMs:now+120000});
  const {rows}=await pool.query("SELECT count(*)::int AS n FROM stage_delivery_revocations WHERE owner_id=$1 AND asset_id=$2",[job.ownerId,asset.id]);
  assert.ok(rows[0].n>=1);
 }finally{await pool.end();}
});
