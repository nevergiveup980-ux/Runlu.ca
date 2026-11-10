import test from "node:test";
import assert from "node:assert/strict";
import {authorizeMusicCharge,assertProviderExecutionAllowed} from "./billing-gate.mjs";
const plan={plan_key:"runlu_music_song_credit",product_key:"runlu_music",fulfillment_mode:"consumable_credit"};
test("billing is off by default",()=>{
 assert.throws(()=>authorizeMusicCharge({catalogPlan:plan}),/MUSIC_BILLING_DISABLED/);
 assert.throws(()=>assertProviderExecutionAllowed({billingAuthorization:{units:1},job:{id:"x",status:"running"}}),/MUSIC_PROVIDER_DISABLED/);
});
test("unrelated product credits cannot be consumed for music",()=>{
 assert.throws(()=>authorizeMusicCharge({catalogPlan:{...plan,product_key:"runlu_stage"},serverBillingEnabled:true}),/MUSIC_PLAN_NOT_CONFIGURED/);
 assert.throws(()=>authorizeMusicCharge({catalogPlan:{...plan,plan_key:"runlu_stage_credit"},serverBillingEnabled:true}),/MUSIC_PLAN_NOT_CONFIGURED/);
});
test("music charge is fixed to exactly one unit",()=>{
 assert.throws(()=>authorizeMusicCharge({catalogPlan:plan,serverBillingEnabled:true,units:2}),/INVALID_MUSIC_UNITS/);
 assert.deepEqual(authorizeMusicCharge({catalogPlan:plan,serverBillingEnabled:true}),{planKey:plan.plan_key,units:1});
});
test("provider requires explicit gate and claimed job",()=>{
 const authorization=authorizeMusicCharge({catalogPlan:plan,serverBillingEnabled:true});
 assert.throws(()=>assertProviderExecutionAllowed({billingAuthorization:authorization,providerEnabled:true,job:{id:"x",status:"queued"}}),/MUSIC_JOB_NOT_CLAIMED/);
 assert.equal(assertProviderExecutionAllowed({billingAuthorization:authorization,providerEnabled:true,job:{id:"x",status:"running"}}),true);
});
