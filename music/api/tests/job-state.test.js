import test from "node:test";
import assert from "node:assert/strict";
import {createQueuedJob,transitionJob} from "../job-state.js";
const base=()=>createQueuedJob({id:"job_1",ownerId:"user_1",createdAt:100});
test("queued to running to succeeded requires persisted track",()=>{
 const running=transitionJob(base(),"running",{at:101});
 const success=transitionJob(running,"succeeded",{at:102,trackId:"track_1"});
 assert.equal(success.status,"succeeded");assert.equal(success.trackId,"track_1");
 assert.throws(()=>transitionJob(success,"running",{at:103}),/Illegal transition/);
});
test("failed jobs have structured errors",()=>{
 const failure=transitionJob(base(),"failed",{at:101,error:{code:"PROVIDER_TIMEOUT",message:"Provider did not respond"}});
 assert.equal(failure.status,"failed");assert.equal(failure.error.code,"PROVIDER_TIMEOUT");
 assert.throws(()=>transitionJob(failure,"running",{at:102}),/Illegal transition/);
});
test("invalid transitions and timestamps rejected",()=>{
 assert.throws(()=>transitionJob(base(),"succeeded",{at:101,trackId:"x"}),/Illegal transition/);
 assert.throws(()=>transitionJob(base(),"running",{at:99}),/timestamp/);
 assert.throws(()=>transitionJob(base(),"failed",{at:101}),/structured error/);
 assert.throws(()=>transitionJob(transitionJob(base(),"running",{at:101}),"succeeded",{at:102}),/persisted track/);
});
test("initial job validates IDs",()=>assert.throws(()=>createQueuedJob({id:"",ownerId:"u",createdAt:100}),/required/));
