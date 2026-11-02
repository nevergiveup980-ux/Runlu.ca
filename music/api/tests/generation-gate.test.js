import test from "node:test";
import assert from "node:assert/strict";
import {generateWithApproval} from "../generation-gate.js";
const request={prompt:"故乡、父母、岁月",language:"zh",instrumental:false,duration_seconds:30};
test("generation is disabled by default and never invokes provider",async()=>{
 let called=false;
 await assert.rejects(()=>generateWithApproval({env:{GEMINI_API_KEY:"test"},request,fetchImpl:async()=>{called=true;}}),{code:"GENERATION_DISABLED"});
 assert.equal(called,false);
});
test("explicit approval is required before any paid request",async()=>{
 let called=false;
 await assert.rejects(()=>generateWithApproval({env:{MUSIC_GENERATION_ENABLED:"true",GEMINI_API_KEY:"test"},request,fetchImpl:async()=>{called=true;}}),{code:"APPROVAL_REQUIRED"});
 assert.equal(called,false);
});
test("secret key required before provider request",async()=>{
 await assert.rejects(()=>generateWithApproval({env:{MUSIC_GENERATION_ENABLED:"true",MUSIC_TEST_APPROVED:"true"},request}),{code:"PROVIDER_NOT_CONFIGURED"});
});
test("approved request uses Chinese prompt and clip model",async()=>{
 let payload;
 const result=await generateWithApproval({env:{MUSIC_GENERATION_ENABLED:"true",MUSIC_TEST_APPROVED:"true",GEMINI_API_KEY:"fake-key"},request,
  fetchImpl:async(_url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({steps:[{type:"model_output",content:[{type:"audio",data:"SUQz",mime_type:"audio/mpeg"}]}]})};}});
 assert.equal(result.model,"lyria-3-clip-preview");assert.match(payload.input,/简体中文/);assert.match(payload.input,/故乡、父母、岁月/);
});
test("full mode selects full model, not preview",async()=>{
 let payload;
 await generateWithApproval({env:{MUSIC_GENERATION_ENABLED:"true",MUSIC_TEST_APPROVED:"true",GEMINI_API_KEY:"fake-key"},
  request:{...request,duration_seconds:60},fetchImpl:async(_url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({steps:[{type:"model_output",content:[{type:"audio",data:"SUQz"}]}]})};}});
 assert.equal(payload.model,"lyria-3.5");
});
