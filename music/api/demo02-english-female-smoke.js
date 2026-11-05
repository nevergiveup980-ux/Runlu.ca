#!/usr/bin/env node
/** RUNLU MUSIC STUDIO — Demo 02, English female voice. Dry-run by default.
 * A live run must be separately approved; one request, no automatic retry.
 */
import {writeFile} from "node:fs/promises";
import {createLyriaAdapter} from "./lyria-adapter.js";
import {decodeProviderMp3} from "./provider-audio.js";
import {estimateCbrMp3Duration} from "./mp3-duration.js";

const lyrics="[Verse 1]\nWe left with little more than hope\nAnd dreams too big to fit the road\nThrough all the turns we couldn't see\nYou kept a little light for me\n\n[Verse 2]\nThe years have silvered in our hair\nAnd taught us how to bend, not break\nWhen words were more than I could bear\nYou knew the ones I couldn't say\n\n[Chorus]\nThrough every mile, I'm glad it's you\nBeside me when the cold winds blew\nThe days we thought we'd never get through\nAre stories we can smile back to\nThrough every mile, I'm glad it's you\nMy place to land, my steady truth\nIf life began again somehow\nI'd find you then, as I do now\n\n[Bridge]\nWe were young and we were proud\nWe hid our tears behind the crowd\nNow all the places we once chased\nCan't match the warmth of this embrace\n\n[Final Chorus]\nThrough every mile, I'm glad it's you\nBeside me when the cold winds blew\nIf life began again somehow\nI'd find you then, as I do now\n\n[Outro]\nWhen evening settles soft and blue\nI hope I'm still right here with you";
const prompt="Create an original English-language female-vocal acoustic folk-pop ballad, approximately 3 minutes, 76–80 BPM, 4/4. Warm mature expressive natural female voice, clear English, memorable singable chorus, restrained emotion. Gentle piano intro, fingerpicked acoustic guitar, subtle strings, light percussion, intimate quiet ending. Sing the original lyrics in order, avoid abrupt cutoffs or unrelated lyrics. Do not imitate existing songs or identifiable singers.\n\nLyrics:\n[Verse 1]\nWe left with little more than hope\nAnd dreams too big to fit the road\nThrough all the turns we couldn't see\nYou kept a little light for me\n\n[Verse 2]\nThe years have silvered in our hair\nAnd taught us how to bend, not break\nWhen words were more than I could bear\nYou knew the ones I couldn't say\n\n[Chorus]\nThrough every mile, I'm glad it's you\nBeside me when the cold winds blew\nThe days we thought we'd never get through\nAre stories we can smile back to\nThrough every mile, I'm glad it's you\nMy place to land, my steady truth\nIf life began again somehow\nI'd find you then, as I do now\n\n[Bridge]\nWe were young and we were proud\nWe hid our tears behind the crowd\nNow all the places we once chased\nCan't match the warmth of this embrace\n\n[Final Chorus]\nThrough every mile, I'm glad it's you\nBeside me when the cold winds blew\nIf life began again somehow\nI'd find you then, as I do now\n\n[Outro]\nWhen evening settles soft and blue\nI hope I'm still right here with you";
const outputName="runlu-demo02-english-female.local.mp3";
if(!process.argv.includes("--live")){
 console.log(JSON.stringify({mode:"dry-run",title:"Lucky to Have You Here",voice:"female",language:"en",targetSeconds:180,promptCharacters:prompt.length,paidCall:false}));
 process.exit(0);
}
if(process.env.MUSIC_GENERATION_ENABLED!=="true"||process.env.MUSIC_TEST_APPROVED!=="true"||process.env.MUSIC_FULL_SONG_MODEL_VERIFIED!=="true"||!process.env.GEMINI_API_KEY){
 console.error("BLOCKED: private API key and explicit approval flags required.");
 process.exitCode=2;
}else{
 try{
  const result=await createLyriaAdapter({apiKey:process.env.GEMINI_API_KEY,model:"full"}).generate({prompt,language:"en"});
  const bytes=decodeProviderMp3(result);
  let duration=null;
  try{duration=estimateCbrMp3Duration(bytes);}catch{}
  await writeFile(new URL("./"+outputName,import.meta.url),new Uint8Array(bytes),{flag:"wx",mode:0o600});
  console.log(JSON.stringify({saved:outputName,model:result.model,bytes:bytes.byteLength,estimatedDurationSeconds:duration}));
 }catch(error){
  console.error("DEMO02 FAILED:",error.code||error.name||"UNKNOWN",String(error.message||"").replace(/AIza[0-9A-Za-z_-]+/g,"[REDACTED]"));
  process.exitCode=1;
 }
}
