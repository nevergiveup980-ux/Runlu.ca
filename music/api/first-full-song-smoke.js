#!/usr/bin/env node
/**
 * RUNLU first full-song experiment. Dry-run by default.
 * The Lyria 3.5 model ID and REST interactions schema were checked against
 * https://ai.google.dev/gemini-api/docs/music-generation .
 * Do not execute with --live without explicit paid-call approval.
 */
import {writeFile} from "node:fs/promises";
import {createLyriaAdapter} from "./lyria-adapter.js";
import {decodeProviderMp3} from "./provider-audio.js";
import {estimateCbrMp3Duration} from "./mp3-duration.js";

const lyrics=`[Verse 1]
那年背起简单的行囊
以为远方会有不一样的光
一路跌跌撞撞走过风霜
才懂得平凡日子值得珍藏

[Verse 2]
后来岁月染白了鬓角
有些梦想还在路上奔跑
多少没说出口的煎熬
都被一句回来了轻轻化掉

[Chorus]
一路走来所幸有你
陪我走过风也走过雨
那些曾经难熬的日子
回头看成了温暖的回忆
一路走来所幸有你
让漂泊的心有地方安定
如果岁月能够重新写起
我仍愿与你一路同行

[Bridge]
我们曾年轻也曾倔强
也曾把眼泪藏在笑容后方
如今才明白最好的时光
不是远方是有人守在身旁

[Outro]
一路走来所幸有你
千言万语化作这一句
等到夕阳慢慢落下去
愿我身边依然有你`;
const prompt=`创作一首约三分钟的原创中文男声抒情民谣。成熟温暖、自然克制的男声，普通话清晰；旋律优美动人，副歌容易记住。钢琴前奏、指弹木吉他、克制弦乐，最后安静收束。74–82 BPM，4/4。按以下原创歌词依次演唱，尽量不要添加重复或突然截断；不得模仿现有歌曲或歌手。\n\nLyrics:\n${lyrics}`;
if(!process.argv.includes("--live")){
 console.log(JSON.stringify({mode:"dry-run",title:"一路走来，所幸有你",targetSeconds:180,promptCharacters:prompt.length,paidCall:false,warning:"Live model ID, lyric adherence and duration remain unverified."}));
 process.exit(0);
}
if(process.env.MUSIC_GENERATION_ENABLED!=="true"||process.env.MUSIC_TEST_APPROVED!=="true"||process.env.MUSIC_FULL_SONG_MODEL_VERIFIED!=="true"||!process.env.GEMINI_API_KEY){
 console.error("BLOCKED: private GEMINI_API_KEY and all three explicit approval/verification flags are required.");
 process.exitCode=2;
}else{
 try{
  const adapter=createLyriaAdapter({apiKey:process.env.GEMINI_API_KEY,model:"full"});
  const result=await adapter.generate({prompt,language:"zh"});
  const bytes=decodeProviderMp3(result);
  let duration=null;
  try{duration=estimateCbrMp3Duration(bytes);}catch{}
  await writeFile(new URL("./runlu-first-full-song.local.mp3",import.meta.url),new Uint8Array(bytes),{flag:"wx",mode:0o600});
  console.log(JSON.stringify({saved:"runlu-first-full-song.local.mp3",model:result.model,bytes:bytes.byteLength,estimatedDurationSeconds:duration}));
 }catch(e){console.error("TEST FAILED:",e.code||e.name||"UNKNOWN",String(e.message||"").replace(/AIza[0-9A-Za-z_-]+/g,"[REDACTED]"));process.exitCode=1;}
}
