import test from "node:test";
import assert from "node:assert/strict";
import {scoreSample,compareSamples} from "./benchmark.mjs";
const sample={provider:"Mock A",durationSeconds:10,totalBilledCad:2,attempts:1,deliverableVerified:true,scores:{visual:4,motion:4,consistency:4,audio:4,promptAdherence:4}};
test("quality scoring accepts verified strong output",()=>assert.equal(scoreSample(sample).pass,true));
test("unverified artifact cannot pass",()=>assert.equal(scoreSample({...sample,deliverableVerified:false}).pass,false));
test("bad score rejected",()=>assert.throws(()=>scoreSample({...sample,scores:{...sample.scores,visual:9}})));
test("actual billed failures count in cost per accepted minute",()=>{
 const result=compareSamples([sample,{...sample,totalBilledCad:3,deliverableVerified:false}])[0];
 assert.equal(result.passRate,.5);
 assert.equal(result.costPerAcceptedMinuteCad,30);
});
test("no accepted clips gives null unit cost",()=>assert.equal(compareSamples([{...sample,deliverableVerified:false}])[0].costPerAcceptedMinuteCad,null));
