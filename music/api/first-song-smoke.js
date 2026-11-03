#!/usr/bin/env node
/**
 * One-shot, local-only provider smoke test. Dry-run by default.
 * Real call requires explicit flags and a server-side environment secret.
 * Never logs provider response, API key, or full prompt.
 */
import {writeFile} from "node:fs/promises";
import {generateWithApproval} from "./generation-gate.js";
import {decodeProviderMp3} from "./provider-audio.js";
import {estimateCbrMp3Duration} from "./mp3-duration.js";
const request={prompt:"故乡的月亮，父母的牵挂，岁月里的温暖；原创温柔民谣。",language:"zh",instrumental:false,duration_seconds:30};
const real=process.argv.includes("--live");
if(!real){
 console.log("DRY RUN ONLY. No API request. To run once: set GEMINI_API_KEY in private shell, MUSIC_GENERATION_ENABLED=true, MUSIC_TEST_APPROVED=true, then pass --live.");
 process.exit(0);
}
if(process.env.MUSIC_GENERATION_ENABLED!=="true"||process.env.MUSIC_TEST_APPROVED!=="true"||!process.env.GEMINI_API_KEY){
 console.error("LIVE TEST BLOCKED: requires both explicit approval flags and private GEMINI_API_KEY.");
 process.exitCode=2;
}else{
 try{
  const result=await generateWithApproval({env:process.env,request});
  const audio=decodeProviderMp3(result);
  let duration=null;
  try{duration=estimateCbrMp3Duration(audio);}catch(e){console.warn("Duration estimator cannot parse this encoding:",e.code||e.name);}
  const file=new URL("./runlu-first-preview.local.mp3",import.meta.url);
  await writeFile(file,new Uint8Array(audio),{flag:"wx",mode:0o600});
  console.log(JSON.stringify({result:"saved",model:result.model,bytes:audio.byteLength,estimatedDurationSeconds:duration,file:"runlu-first-preview.local.mp3"}));
 }catch(e){
  console.error("LIVE TEST FAILED:",e.code||e.name||"UNKNOWN");
  process.exitCode=1;
 }
}
