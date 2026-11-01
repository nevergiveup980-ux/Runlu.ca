import test from "node:test";
import assert from "node:assert/strict";
import {createLyriaAdapter} from "../lyria-adapter.js";
test("requires secret key and valid model",()=>{
 assert.throws(()=>createLyriaAdapter(),{code:"PROVIDER_NOT_CONFIGURED"});
 assert.throws(()=>createLyriaAdapter({apiKey:"x",model:"unknown"}),{code:"INVALID_MODEL"});
});
test("uses documented Interactions endpoint and extracts audio",async()=>{
 let req;
 const adapter=createLyriaAdapter({apiKey:"test-secret",fetchImpl:async(url,options)=>{req={url,options};return {ok:true,json:async()=>({steps:[{type:"model_output",content:[{type:"text",text:"Lyrics"},{type:"audio",data:"SUQz",mime_type:"audio/mpeg"}]}]})};}});
 const result=await adapter.generate({prompt:"故乡与岁月",language:"zh"});
 assert.equal(result.audioBase64,"SUQz");assert.equal(result.lyrics,"Lyrics");
 assert.match(req.url,/generativelanguage.googleapis.com\/v1beta\/interactions/);
 assert.equal(JSON.parse(req.options.body).model,"lyria-3-clip-preview");
 assert.equal(req.options.headers["x-goog-api-key"],"test-secret");
});
test("provider rate limits are retryable",async()=>{
 const adapter=createLyriaAdapter({apiKey:"x",fetchImpl:async()=>({ok:false,status:429})});
 await assert.rejects(()=>adapter.generate({prompt:"music"}),e=>e.code==="PROVIDER_HTTP_ERROR"&&e.retryable);
});
test("missing audio is a hard error",async()=>{
 const adapter=createLyriaAdapter({apiKey:"x",fetchImpl:async()=>({ok:true,json:async()=>({steps:[]})})});
 await assert.rejects(()=>adapter.generate({prompt:"music"}),{code:"NO_AUDIO"});
});
